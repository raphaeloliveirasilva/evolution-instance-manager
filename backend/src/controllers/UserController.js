const { User, Subscription, Plan, Instance, connection } = require('../models/Index');
const axios = require('axios');

module.exports = {
  // Listagem de Usuários
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        include: [{
          model: Subscription,
          as: 'subscription',
          include: [{ model: Plan, as: 'plan', attributes: ['name', 'id'] }] // Adicionado id do plano
        }],
        order: [['createdAt', 'DESC']]
      });
      return res.json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  },

  // Criação de Usuário
  async store(req, res) {
    const { name, email, password, role, plan_id } = req.body;
    if (!connection) return res.status(500).json({ error: 'Erro na conexão.' });

    const t = await connection.transaction();
    try {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        await t.rollback();
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }

      // Buscamos o usuário que está logado (quem faz a requisição)
      const requestUser = await User.findByPk(req.userId);

      // Só aceitamos o 'role' vindo do body se quem estiver criando for um 'admin'
      // Caso contrário, forçamos sempre para 'user'
      const finalRole = (requestUser && requestUser.role === 'admin') ? (role || 'user') : 'user';

      const user = await User.create(
        { name, email, password, role: finalRole },
        { transaction: t }
      );

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await Subscription.create({
        user_id: user.id,
        plan_id: plan_id,
        status: 'active',
        trial_ends_at: expiryDate
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      if (t) await t.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  },

  // Atualização de Usuário
  async update(req, res) {
    const { id } = req.params;
    const { name, email, password, role, plan_id } = req.body;

    const t = await connection.transaction();

    try {
      // Carrega o usuário com a assinatura atual
      const user = await User.findByPk(id, {
        include: [{ model: Subscription, as: 'subscription' }]
      });

      if (!user) {
        await t.rollback();
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // --- LÓGICA DE PLANO/ASSINATURA ---
      if (plan_id) {
        const newPlan = await Plan.findByPk(plan_id);
        if (!newPlan) {
          await t.rollback();
          return res.status(404).json({ error: 'Plano selecionado não existe.' });
        }

        // Caso 1: O usuário JÁ TEM uma assinatura vinculada
        if (user.subscription) {
          // Só processa se o plano enviado for diferente do atual
          if (plan_id != user.subscription.plan_id) {
            const instanceCount = await Instance.count({ where: { owner_id: id } });

            if (instanceCount > newPlan.max_instances) {
              await t.rollback();
              return res.status(400).json({
                error: `O usuário possui ${instanceCount} instâncias, mas o plano ${newPlan.name} permite apenas ${newPlan.max_instances}.`
              });
            }

            await user.subscription.update({ plan_id: Number(plan_id) }, { transaction: t });
            console.log(`✅ Assinatura do usuário ${id} atualizada para o plano ${newPlan.name}`);
          }
        }
        // Caso 2: O usuário NÃO TEM assinatura (Usuários de Seeder ou erros de sistema)
        else {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // Define 30 dias de validade padrão

          await Subscription.create({
            user_id: id,
            plan_id: Number(plan_id),
            status: 'active',
            trial_ends_at: expiryDate
          }, { transaction: t });
          console.log(`✅ Nova assinatura criada para o usuário ${id} (Plano: ${newPlan.name})`);
        }
      }

      // --- LÓGICA DE DADOS DO USUÁRIO ---
      const updateData = { name, email, role };

      // Só altera a senha se o campo não estiver vazio
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      await user.update(updateData, { transaction: t });

      await t.commit();
      return res.json({ message: 'Usuário e plano atualizados com sucesso!' });

    } catch (error) {
      if (t) await t.rollback();
      console.error("ERRO NO UPDATE DE USUÁRIO:", error);
      return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
    }
  },

  // Exclusão de Usuário
  async delete(req, res) {
    const { id } = req.params;
    const t = await connection.transaction();

    try {
      const user = await User.findByPk(id);
      if (!user) {
        await t.rollback();
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // 1. Buscar instâncias para limpar na Evolution
      const userInstances = await Instance.findAll({ where: { owner_id: id } });

      for (const instance of userInstances) {
        try {
          await axios.delete(`${process.env.EVOLUTION_URL}/instance/delete/${instance.name}`, {
            headers: { 'apikey': process.env.EVOLUTION_API_KEY }
          });
        } catch (evoError) {
          console.error(`Instância ${instance.name} já removida ou erro na Evolution.`);
        }
      }

      // 2. Deletar usuário (Cascade cuidará do resto no banco)
      await user.destroy({ transaction: t });

      await t.commit();
      return res.json({ message: 'Usuário e todas as suas instâncias foram removidos!' });

    } catch (error) {
      if (t) await t.rollback();
      console.error("ERRO NA EXCLUSÃO:", error);
      return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
    }
  }
};