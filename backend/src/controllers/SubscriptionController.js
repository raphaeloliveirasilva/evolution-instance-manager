const { Subscription, Plan } = require('../models/Index');

module.exports = {
  async store(req, res) {
    const { plan_id } = req.body;
    const user_id = req.userId; // Esse ID vem automático do Token (graças ao middleware)

    try {
      // 1. Verifica se o plano existe no "Menu"
      const plan = await Plan.findByPk(plan_id);
      if (!plan) {
        return res.status(400).json({ error: 'Plano não encontrado.' });
      }

      // 2. Verifica se o usuário já tem um contrato ativo
      const existingSub = await Subscription.findOne({
        where: { user_id, status: 'active' }
      });

      if (existingSub) {
        return res.status(400).json({ error: 'Você já possui uma assinatura ativa.' });
      }

      // 3. Define a validade (Simulando 30 dias de teste/uso)
      const today = new Date();
      const expirationDate = new Date(today);
      expirationDate.setDate(expirationDate.getDate() + 30); // Soma 30 dias

      // 4. Cria a Assinatura (A Ponte)
      const subscription = await Subscription.create({
        user_id,
        plan_id,
        status: 'active', // Começa ativa
        trial_ends_at: expirationDate
      });

      return res.json(subscription);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar assinatura.' });
    }
  }
};