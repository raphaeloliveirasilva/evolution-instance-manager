const { Setting } = require('../models/Index');

// Lista de chaves que NUNCA devem aparecer no frontend
const SENSITIVE_KEYS = [
  'asaas_api_key', 
  'evolution_global_key', 
  'smtp_pass',
  'asaas_wallet_id'
];

module.exports = {
  /**
   * GET /settings
   * Retorna todas as configurações, mas mascara as sensíveis.
   * Opcional: pode filtrar por grupo via query param ?group=payment
   */
  async index(req, res) {
    try {
      const { group } = req.query;
      const where = {};

      if (group) {
        where.group = group;
      }

      // 1. Busca todas as configs
      const settings = await Setting.findAll({
        where,
        attributes: ['key', 'value', 'group', 'is_public'] // Não precisa retornar ID ou datas
      });

      // 2. Sanitiza os dados antes de enviar
      const sanitizedSettings = settings.map(item => {
        // Converte o model do Sequelize para objeto puro JSON
        const setting = item.toJSON();

        // Se a chave for sensível, esconde o valor real
        if (SENSITIVE_KEYS.includes(setting.key) && setting.value) {
          setting.value = '********'; 
        }

        return setting;
      });

      return res.json(sanitizedSettings);

    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar configurações.' });
    }
  },

  /**
   * PUT /settings
   * Recebe um ARRAY de configurações para atualizar.
   * Body esperado: [ { key: 'app_name', value: 'Novo Nome' }, ... ]
   */
  async update(req, res) {
    const settingsToUpdate = req.body; // Deve ser um array

    if (!Array.isArray(settingsToUpdate)) {
      return res.status(400).json({ error: 'O corpo da requisição deve ser um array de configurações.' });
    }

    try {
      // Usamos uma transação para garantir que ou salva tudo ou não salva nada
      // (Se seu Sequelize estiver configurado, adicione { transaction: t } nas queries)
      
      const updatePromises = settingsToUpdate.map(async (item) => {
        const { key, value } = item;

        // SEGURANÇA: Se o valor for a máscara, IGNORA. 
        // Significa que o usuário não mexeu nesse campo.
        if (value === '********') {
          return null; 
        }

        // Busca se a configuração existe
        const setting = await Setting.findOne({ where: { key } });

        if (setting) {
          // Atualiza apenas se o valor for diferente
          if (setting.value !== value) {
            setting.value = value;
            await setting.save();
          }
        } else {
          // Opcional: Criar se não existir (cuidado com chaves inválidas)
          // Por segurança, no EvoManager, preferimos só atualizar as existentes via Seed
          console.warn(`Tentativa de atualizar chave inexistente: ${key}`);
        }
      });

      await Promise.all(updatePromises);

      return res.json({ message: 'Configurações atualizadas com sucesso!' });

    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({ error: 'Erro ao salvar configurações.' });
    }
  }
};