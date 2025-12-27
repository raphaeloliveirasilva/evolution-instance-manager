const { Model, DataTypes } = require('sequelize');

class Setting extends Model {
  static init(sequelize) {
    super.init({
      key: DataTypes.STRING,
      value: DataTypes.TEXT,
      group: DataTypes.STRING,
      is_public: DataTypes.BOOLEAN
    }, {
      sequelize,
      tableName: 'Settings',
      // Ativamos os timestamps
      timestamps: true,
      // IMPORTANTE: Agora usamos TRUE para bater com created_at e updated_at do banco
      underscored: true, 
    });
  }

  static associate(models) {}
}

module.exports = Setting;