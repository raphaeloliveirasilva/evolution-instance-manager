const axios = require('axios');
const { Instance, Subscription, Plan } = require('../models/Index');
const User = require('../models/User');

module.exports = {

  // Listar todas as instâncias do usuário logado
  async index(req, res) {
    const userId = req.userId;
    try {
      const user = await User.findByPk(userId);
      let whereClause = { owner_id: userId };

      if (user.role === 'admin') {
        whereClause = {};
      }

      const instances = await Instance.findAll({
        where: whereClause,
        attributes: ['id', 'name', 'token', 'status', 'number', 'profile_picture', 'createdAt', 'settings'],
        include: [
          { 
            model: User, 
            as: 'owner', 
            attributes: ['name', 'email'] 
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      // AJUSTE: Converte a string 'settings' de volta para objeto para o Frontend não quebrar
      const formattedInstances = instances.map(inst => {
        const i = inst.toJSON();
        if (typeof i.settings === 'string') {
          try { i.settings = JSON.parse(i.settings); } catch (e) { i.settings = {}; }
        }
        return i;
      });

      return res.json(formattedInstances);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar instâncias.' });
    }
  },

  // Criar Instância
  async store(req, res) {
    const { name } = req.body; 
    const userId = req.userId; 

    try {
      const user = await User.findByPk(userId);

      if (user.role !== 'admin') {
        const subscription = await Subscription.findOne({
          where: { user_id: userId, status: 'active' },
          include: [{ model: Plan, as: 'plan' }]
        });

        if (!subscription) {
          return res.status(403).json({ error: 'Você não possui uma assinatura ativa.' });
        }

        const currentInstances = await Instance.count({ where: { owner_id: userId } });

        if (currentInstances >= subscription.plan.max_instances) {
          return res.status(403).json({ 
            error: `Seu plano permite apenas ${subscription.plan.max_instances} instâncias. Faça um upgrade.` 
          });
        }
      }

      try {
        const response = await axios.post(
          `${process.env.EVOLUTION_URL}/instance/create`,
          {
            instanceName: name,
            qrcode: false,
            integration: "WHATSAPP-BAILEYS"
          },
          {
            headers: {
              'apikey': process.env.EVOLUTION_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        const evolutionData = response.data;
        
        let instanceToken = evolutionData.hash?.apikey || evolutionData.hash || evolutionData.token;

        if (!instanceToken) {
            throw new Error('A Evolution API não retornou um token válido.');
        }

        const newInstance = await Instance.create({
          name: name,
          token: instanceToken, 
          status: 'disconnected', 
          owner_id: userId,
          number: null,
          // AJUSTE: Salva um valor padrão inicial para não vir nulo
          settings: JSON.stringify({ rejectCall: false, groupsIgnore: false, alwaysOnline: false })
        });

        return res.status(201).json(newInstance);

      } catch (apiError) {
        return res.status(400).json({ 
            error: 'Falha ao criar instância na Evolution API.',
            details: apiError.response?.data 
        });
      }

    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  async connect(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole; // AJUSTE: Pegando o cargo

    try {
      const instance = await Instance.findByPk(id);

      if (!instance) return res.status(404).json({ error: 'Instância não encontrada.' });

      // AJUSTE: Permissão para Admin ou Dono
      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado.' });
      }

      try {
        const response = await axios.get(
          `${process.env.EVOLUTION_URL}/instance/connect/${instance.name}`,
          { headers: { 'apikey': process.env.EVOLUTION_API_KEY } }
        );
        return res.json(response.data);
      } catch (apiError) {
        return res.status(400).json({ error: 'Falha ao gerar QR Code na Evolution.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
      const instance = await Instance.findByPk(id);
      if (!instance) return res.status(404).json({ error: 'Instância não encontrada.' });

      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada.' });
      }

      try {
        await axios.delete(`${process.env.EVOLUTION_URL}/instance/delete/${instance.name}`, {
          headers: { 'apikey': process.env.EVOLUTION_API_KEY }
        });
      } catch (evoError) {
        console.error(`Instância já removida da Evolution.`);
      }

      await instance.destroy();
      return res.json({ message: 'Instância excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir instância.' });
    }
  },

  async status(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
      const instance = await Instance.findByPk(id);
      if (!instance) return res.status(404).json({ error: 'Instância não encontrada.' });

      // AJUSTE: Admin também pode checar status
      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Negado.' });
      }

      const response = await axios.get(
        `${process.env.EVOLUTION_URL}/instance/fetchInstances`,
        { headers: { 'apikey': process.env.EVOLUTION_API_KEY } }
      );

      const evo = response.data.find(e => (e.instanceName === instance.name) || (e.name === instance.name));

      if (evo) {
        const currentStatus = evo.status || evo.connectionStatus || evo.state;
        const rawNumber = evo.ownerJid || evo.owner || evo.number || evo.instanceNumber;
        const isConnected = ['open', 'connected', 'CONNECTED'].includes(currentStatus) && !!rawNumber;

        instance.status = isConnected ? 'connected' : 'disconnected';
        instance.number = isConnected ? rawNumber.split('@')[0] : null;
        instance.profile_picture = isConnected ? (evo.profilePictureUrl || evo.profilePicUrl) : null;
        
        await instance.save();
      }
      return res.json(instance);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao consultar status.' });
    }
  },

  async logout(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
      const instance = await Instance.findByPk(id);
      if (!instance) return res.status(404).json({ error: 'Não encontrada.' });

      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Negado.' });
      }

      try {
        await axios.delete(`${process.env.EVOLUTION_URL}/instance/logout/${instance.name}`, {
          headers: { 'apikey': process.env.EVOLUTION_API_KEY }
        });
      } catch (apiErr) {
        console.log("Instância já deslogada.");
      }

      instance.status = 'disconnected';
      instance.number = null;
      instance.profile_picture = null;
      await instance.save();

      return res.json({ message: 'WhatsApp desconectado.' });
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao desconectar.' });
    }
  },

  async show(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
      const instance = await Instance.findByPk(id);
      if (!instance) return res.status(404).json({ error: 'Instância não encontrada.' });

      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Sem permissão.' });
      }

      // AJUSTE CRÍTICO: Converte a string de configurações para Objeto antes de enviar
      const data = instance.toJSON();
      if (typeof data.settings === 'string') {
        try {
          data.settings = JSON.parse(data.settings);
        } catch (e) {
          data.settings = {};
        }
      }

      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  },

  async updateSettings(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;
    
    const { 
      reject_call, 
      msg_call, 
      groups_ignore, 
      always_online, 
      read_messages,
      read_status 
    } = req.body;

    try {
      const instance = await Instance.findByPk(id);
      if (!instance) return res.status(404).json({ error: 'Instância não encontrada.' });

      if (instance.owner_id !== userId && userRole !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada.' });
      }

      // Payload camelCase para a Evolution
      const settingsPayload = {
        rejectCall: Boolean(reject_call),
        msgCall: msg_call || "",
        groupsIgnore: Boolean(groups_ignore),
        alwaysOnline: Boolean(always_online),
        readMessages: Boolean(read_messages),
        readStatus: Boolean(read_status),
        syncFullHistory: false
      };

      // 1. Enviar para Evolution
      await axios.post(
        `${process.env.EVOLUTION_URL}/settings/set/${instance.name}`, 
        settingsPayload,
        { headers: { 'apikey': process.env.EVOLUTION_API_KEY } }
      );

      // 2. Salvar no Banco (como string JSON)
      await instance.update({
        settings: JSON.stringify(settingsPayload)
      });

      return res.json({ message: 'Configurações salvas!', settings: settingsPayload });

    } catch (error) {
      console.error(error.response?.data || error.message);
      return res.status(500).json({ error: 'Erro ao salvar configurações.' });
    }
  }
};