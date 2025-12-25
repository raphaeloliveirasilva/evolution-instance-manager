'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('instances', 'settings', {
      type: Sequelize.JSON,
      allowNull: true,
      // Valor padrão inicial para evitar erros de undefined
      defaultValue: {
        instance: {
          rejectCall: false,
          msgCall: "",
          alwaysOnline: false,
          readMessages: false,
          readStatus: false,
          groupsIgnore: false
        },
        typebot: { enabled: false },
        webhook: { enabled: false }
      }
    });
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('instances', 'settings');
  }
};