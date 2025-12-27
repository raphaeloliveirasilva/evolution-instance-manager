const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const User = require('./User');
const Plan = require('./Plan');
const Subscription = require('./Subscription');
const Instance = require('./Instance');
const Setting = require('./Setting'); // <--- 1. Importar o arquivo

const connection = new Sequelize(dbConfig);

// 2. Inicializa os models
User.init(connection);
Plan.init(connection);
Subscription.init(connection);
Instance.init(connection);
Setting.init(connection); // <--- 2. Iniciar o Model na conexão

// 3. Executa as associações
User.associate(connection.models);
Plan.associate(connection.models);
Subscription.associate(connection.models);
Instance.associate(connection.models);
Setting.associate(connection.models); // <--- (Opcional, mas bom manter o padrão)

// 4. Exportar
module.exports = {
  connection, 
  User,
  Plan,
  Subscription,
  Instance,
  Setting // <--- 3. Exportar para o Controller usar
};