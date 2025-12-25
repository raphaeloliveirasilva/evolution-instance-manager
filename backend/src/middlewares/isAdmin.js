const { User } = require('../models/Index');

module.exports = async (req, res, next) => {
  try {
    // Busca o usuário logado pelo ID vindo do token (authMiddleware)
    const user = await User.findByPk(req.userId);

    // Verifica se o usuário existe e se o papel dele é 'admin'
    if (user && user.role === 'admin') {
      return next();
    }

    // Se não for admin, retorna erro 403 (Proibido)
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
    });
    
  } catch (error) {
    console.error("Erro no middleware isAdmin:", error);
    return res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
  }
};