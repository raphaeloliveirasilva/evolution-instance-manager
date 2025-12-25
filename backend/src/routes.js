const express = require('express');
const UserController = require('./controllers/UserController');
const AuthController = require('./controllers/AuthController');
const PlanController = require('./controllers/PlanController'); 
const SubscriptionController = require('./controllers/SubscriptionController');
const InstanceController = require('./controllers/InstanceController');


const authMiddleware = require('./middlewares/auth'); 
const isAdmin = require('./middlewares/isAdmin'); // <--- Importando o middleware de segurança

const routes = express.Router();

routes.get('/', (req, res) => {
  return res.json({ status: 'online', version: '1.0.0' });
});

// --- ROTAS PÚBLICAS ---
// Removida a rota de cadastro público (UserController.store)
routes.post('/login', AuthController.store); // Login continua público

// --- ROTAS PRIVADAS (Requer Token) ---
routes.use(authMiddleware);

// --- GESTÃO ADMINISTRATIVA (Apenas Admin) ---
// Agora a criação de usuários e planos exige que o logado seja Admin
routes.get('/users', isAdmin, UserController.index);
routes.post('/users', isAdmin, UserController.store);
routes.put('/users/:id', isAdmin, UserController.update);
routes.post('/plans', isAdmin, PlanController.store);
routes.put('/plans/:id', isAdmin, PlanController.update);
routes.delete('/plans/:id', isAdmin, PlanController.delete);
routes.delete('/users/:id', isAdmin, UserController.delete);

// --- FUNCIONALIDADES DE USUÁRIO (Qualquer um logado) ---
// Ver planos (Útil para o Admin listar no formulário de criação)
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