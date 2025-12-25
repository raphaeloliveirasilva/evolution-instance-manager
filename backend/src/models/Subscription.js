const { Model, DataTypes } = require('sequelize');

class Subscription extends Model {
  static init(sequelize) {
    super.init({
      status: DataTypes.ENUM('trialing', 'active', 'expired', 'canceled'),
      trial_ends_at: DataTypes.DATE,
    }, {
      sequelize,
      tableName: 'subscriptions',
    });

    return this;
  }

  static associate(models) {
    // A assinatura pertence a um usuário
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    // A assinatura está vinculada a um plano
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
  }
}

module.exports = Subscription;