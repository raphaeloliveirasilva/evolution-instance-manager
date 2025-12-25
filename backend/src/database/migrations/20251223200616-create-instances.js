'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('instances', {
      id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
      },
      name: { 
        type: Sequelize.STRING, 
        allowNull: false, 
        unique: true 
      },
      token: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }, // Chave estrangeira para o Dono (User)
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Se deletar o usuário, deleta as instâncias dele
      },
      status: { 
        type: Sequelize.STRING, 
        defaultValue: 'disconnected' 
      },
      created_at: { 
        type: Sequelize.DATE, 
        allowNull: false 
      },
      updated_at: { 
        type: Sequelize.DATE, 
        allowNull: false 
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('instances');
  }
};