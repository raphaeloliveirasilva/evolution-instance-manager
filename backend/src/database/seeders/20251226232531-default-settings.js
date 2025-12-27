'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const defaultSettings = [
      // Configurações do Sistema
      { key: 'app_name', value: 'EvoManager', group: 'system', is_public: true },
      { key: 'maintenance_mode', value: 'false', group: 'system', is_public: false },
      { key: 'support_link', value: '', group: 'system', is_public: true },
      
      // Configurações da Evolution API
      { key: 'evolution_api_url', value: '', group: 'evolution', is_public: false },
      { key: 'evolution_global_key', value: '', group: 'evolution', is_public: false },
      
      // Configurações de Pagamento (Asaas)
      { key: 'asaas_sandbox', value: 'true', group: 'payment', is_public: false },
      { key: 'asaas_api_key', value: '', group: 'payment', is_public: false }
    ];

    for (const setting of defaultSettings) {
      // Verifica se a chave já existe no banco (importante para Produção)
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM Settings WHERE \`key\` = "${setting.key}" LIMIT 1;`
      );

      // Se não existir (length === 0), insere o registro
      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('Settings', [{
          ...setting,
          created_at: new Date(),
          updated_at: new Date()
        }]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove apenas as chaves que este seeder gerencia
    const keys = [
      'app_name', 
      'maintenance_mode', 
      'support_link', 
      'evolution_api_url', 
      'evolution_global_key', 
      'asaas_sandbox', 
      'asaas_api_key'
    ];
    return queryInterface.bulkDelete('Settings', { key: keys }, {});
  }
};