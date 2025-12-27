'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = 'admin@admin';

    // 1. Verifica se já existe um usuário com esse e-mail
    const [existingAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = "${adminEmail}" LIMIT 1;`
    );

    // 2. Se não existir, criamos o admin inicial
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 8);

      return queryInterface.bulkInsert('users', [{
        name: 'Administrador',
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
    }

    // Se já existir, não fazemos nada (preserva a senha e dados atuais)
    return Promise.resolve();
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@admin' }, {});
  }
};