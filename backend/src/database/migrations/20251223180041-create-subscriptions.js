'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptions', {
      id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }, // Cria a chave estrangeira para Usuários
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'plans', key: 'id' }, // Cria a chave estrangeira para Planos
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: { 
        type: Sequelize.ENUM('trialing', 'active', 'expired', 'canceled'), 
        defaultValue: 'trialing' 
      },
      trial_ends_at: { 
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('subscriptions');
  }
};