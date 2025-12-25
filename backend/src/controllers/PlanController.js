const { Plan, Subscription } = require('../models/Index');

module.exports = {
  // Listar planos
  async index(req, res) {
    try {
      const plans = await Plan.findAll({
        order: [['price', 'ASC']]
      });
      return res.json(plans);
    } catch (error) {
      console.error("Erro ao listar planos:", error);
      return res.status(500).json({ error: 'Erro ao listar planos.' });
    }
  },

  // Criar novo plano
  async store(req, res) {
    try {
      const { name, max_instances, price } = req.body;

      const planExists = await Plan.findOne({ where: { name } });
      if (planExists) {
        return res.status(400).json({ error: 'Já existe um plano com este nome.' });
      }

      const plan = await Plan.create({ name, max_instances, price });
      return res.status(201).json(plan);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      return res.status(500).json({ error: 'Erro ao criar plano.' });
    }
  },

  // --- NOVAS FUNÇÕES ---

  // Editar plano existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, max_instances, price } = req.body;

      const plan = await Plan.findByPk(id);
      if (!plan) {
        return res.status(404).json({ error: 'Plano não encontrado.' });
      }

      await plan.update({ name, max_instances, price });

      return res.json(plan);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      return res.status(500).json({ error: 'Erro ao atualizar plano.' });
    }
  },

  // Excluir plano
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificação de segurança: existe algum usuário usando este plano?
      const hasSubscriptions = await Subscription.findOne({ where: { plan_id: id } });
      if (hasSubscriptions) {
        return res.status(400).json({ 
          error: 'Não é possível excluir um plano que possui usuários vinculados. Mude os usuários de plano primeiro.' 
        });
      }

      const plan = await Plan.findByPk(id);
      if (!plan) {
        return res.status(404).json({ error: 'Plano não encontrado.' });
      }

      await plan.destroy();

      return res.json({ message: 'Plano excluído com sucesso.' });
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      return res.status(500).json({ error: 'Erro ao excluir plano.' });
    }
  }
};