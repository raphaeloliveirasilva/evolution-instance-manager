module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('instances', 'profile_picture', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn('instances', 'profile_picture');
  }
};