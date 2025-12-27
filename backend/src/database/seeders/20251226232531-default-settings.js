'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultSettings = [
      { key: 'app_name', value: 'EvoManager', group: 'system', is_public: true },
      { key: 'asaas_api_key', value: '', group: 'payment', is_public: false },
      // ... outras chaves
    ];

    for (const setting of defaultSettings) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM Settings WHERE \`key\` = "${setting.key}" LIMIT 1;`
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('Settings', [{
          ...setting,
          created_at: new Date(),
          updated_at: new Date()
        }]);
      }
    }
  }
};