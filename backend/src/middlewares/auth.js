const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o token foi enviado
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O header vem como "Bearer eyJhbGci..." -> Pegamos só a segunda parte
  const [, token] = authHeader.split(' ');

  try {
    // 2. Decodifica o token usando a sua chave secreta (.env)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Inclui o ID e o Role do usuário na requisição para as próximas rotas usarem
    req.userId = decoded.id;
    req.userRole = decoded.role;

    return next(); // Pode passar, tá liberado!
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};