module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('plans', [
      {
        name: 'Bronze',
        max_instances: 1,
        price: 49.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Prata',
        max_instances: 5,
        price: 99.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ouro',
        max_instances: 10,
        price: 199.90,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('plans', null, {});
  }
};