module.exports = {
  up: (queryInterface, Sequelize) => {
    // Adiciona a coluna 'number' na tabela 'instances' que você já tem
    return queryInterface.addColumn('instances', 'number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    // Remove a coluna caso você precise dar um rollback
    return queryInterface.removeColumn('instances', 'number');
  }
};