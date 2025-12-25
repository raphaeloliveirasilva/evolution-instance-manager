const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Criptografa a senha "admin"
    const hashedPassword = await bcrypt.hash('admin', 8);

    // Insere o usuário Admin
    return queryInterface.bulkInsert('users', [{
      name: 'Administrador',
      email: 'admin@admin',
      password_hash: hashedPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    // Permite reverter a criação se necessário
    return queryInterface.bulkDelete('users', { email: 'admin@admin' }, {});
  }
};