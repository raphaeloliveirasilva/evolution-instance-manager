const express = require('express');
const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const PlanController = require('./controllers/PlanController'); 
const SubscriptionController = require('./controllers/SubscriptionController');
const InstanceController = require('./controllers/InstanceController');
const SettingsController = require('./controllers/SettingsController'); // <--- 1. Importação nova

const authMiddleware = require('./middlewares/auth'); 
const isAdmin = require('./middlewares/isAdmin'); 

const routes = express.Router();

routes.get('/', (req, res) => {
  return res.json({ status: 'online', version: '1.0.0' });
});

// --- ROTAS PÚBLICAS ---
routes.post('/login', AuthController.store); 

// --- ROTAS PRIVADAS (Requer Token) ---
routes.use(authMiddleware);

// --- GESTÃO ADMINISTRATIVA (Apenas Admin) ---
// Configurações do Sistema (NOVO)
routes.get('/settings', isAdmin, SettingsController.index);  // <--- 2. Rota para ler
routes.put('/settings', isAdmin, SettingsController.update); // <--- 2. Rota para salvar

routes.get('/users', isAdmin, UserController.index);
routes.post('/users', isAdmin, UserController.store);
routes.put('/users/:id', isAdmin, UserController.update);
routes.delete('/users/:id', isAdmin, UserController.delete);

routes.post('/plans', isAdmin, PlanController.store);
routes.put('/plans/:id', isAdmin, PlanController.update);
routes.delete('/plans/:id', isAdmin, PlanController.delete);


// --- FUNCIONALIDADES DE USUÁRIO (Qualquer um logado) ---
// Ver planos
routes.get('/plans', PlanController.index);

// Assinaturas
routes.post('/subscriptions', SubscriptionController.store);

// Rota de Instâncias
routes.get('/instances', InstanceController.index);
routes.post('/instances', InstanceController.store);
routes.get('/instances/:id', InstanceController.show);
routes.get('/instances/:id/connect', InstanceController.connect);
routes.get('/instances/:id/status', InstanceController.status);
routes.get('/instances/:id/logout', InstanceController.logout);
routes.put('/instances/:id/settings', InstanceController.updateSettings);
routes.delete('/instances/:id', InstanceController.delete);

module.exports = routes;