'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const plans = [
      { name: 'Bronze', max_instances: 1, price: 49.90 },
      { name: 'Prata', max_instances: 5, price: 99.90 },
      { name: 'Ouro', max_instances: 10, price: 199.90 }
    ];

    for (const plan of plans) {
      // Verifica se o plano já existe pelo nome
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM plans WHERE name = "${plan.name}" LIMIT 1;`
      );

      if (existing.length === 0) {
        // Só insere se não existir
        await queryInterface.bulkInsert('plans', [{
          ...plan,
          created_at: new Date(),
          updated_at: new Date()
        }]);
      }
    }
  },

  down: async (queryInterface) => {
    // No down, você decide se quer apagar ou não. Em prod, geralmente deixamos vazio.
  }
};