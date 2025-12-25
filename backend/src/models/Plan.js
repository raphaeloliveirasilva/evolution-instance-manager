const { Model, DataTypes } = require('sequelize');

class Plan extends Model {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
      max_instances: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
    }, {
      sequelize,
      tableName: 'plans',
    });

    return this;
  }

  static associate(models) {
    // Um plano pode estar em muitas assinaturas
    this.hasMany(models.Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });
  }
}

module.exports = Plan;