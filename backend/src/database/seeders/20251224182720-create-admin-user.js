'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Alteramos a busca: Agora verificamos se existe QUALQUER admin no sistema
    const [anyAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = "admin" LIMIT 1;`
    );

    // 2. Se não existir NENHUM usuário com cargo de admin, criamos o inicial
    // Se você já tiver criado seu próprio usuário admin, o seeder vai pular este bloco
    if (!anyAdmin || anyAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin', 8);

      return queryInterface.bulkInsert('users', [{
        name: 'Administrador Inicial',
        email: 'admin@admin',
        password_hash: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
    }

    // Se já houver um admin, não fazemos nada. 
    // Isso evita que o admin@admin seja recriado caso tenha sido deletado.
    return Promise.resolve();
  },

  down: (queryInterface, Sequelize) => {
    // Remove apenas o e-mail padrão se ele ainda existir
    return queryInterface.bulkDelete('users', { email: 'admin@admin' }, {});
  }
};