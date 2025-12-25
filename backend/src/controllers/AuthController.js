const jwt = require('jsonwebtoken');
const { User } = require('../models/Index');

module.exports = {
  async store(req, res) {
    const { email, password } = req.body;

    // 1. Verifica se o usuário existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Verifica se a senha bate (usando o método que criamos no Model)
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, name, role, instance_limit } = user;

    // 3. Gera o Token JWT
    // O payload guarda o ID e o Role para usarmos nos Middlewares depois
    return res.json({
      user: {
        id,
        name,
        email,
        role,
        instance_limit
      },
      token: jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token válido por 7 dias
      }),
    });
  }
};