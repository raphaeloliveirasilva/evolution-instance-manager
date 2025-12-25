const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const User = require('./User');
const Plan = require('./Plan');
const Subscription = require('./Subscription');
const Instance = require('./Instance');
// const GlobalConfig = require('./GlobalConfig'); // Descomente se já criou este arquivo

const connection = new Sequelize(dbConfig);

// 1. Inicializa os models
User.init(connection);
Plan.init(connection);
Subscription.init(connection);
Instance.init(connection);
// GlobalConfig.init(connection);

// 2. Executa as associações
User.associate(connection.models);
Plan.associate(connection.models);
Subscription.associate(connection.models);
Instance.associate(connection.models);

// CORREÇÃO AQUI: Exportamos um objeto com tudo
module.exports = {
  connection, 
  User,
  Plan,
  Subscription,
  Instance
};