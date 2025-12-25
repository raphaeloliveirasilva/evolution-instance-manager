const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.VIRTUAL,
      password_hash: DataTypes.STRING,
      role: DataTypes.ENUM('admin', 'user'),
      instance_limit: DataTypes.INTEGER,
    }, {
      sequelize,
      tableName: 'users',
    });

    // Hook para criptografar a senha antes de salvar
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  // Método para validar senha no login
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  static associate(models) {
  // Um usuário tem uma assinatura
  this.hasOne(models.Subscription, { foreignKey: 'user_id', as: 'subscription' });
  // Um usuário pode ter várias instâncias
  this.hasMany(models.Instance, { foreignKey: 'owner_id', as: 'instances' });
  }

}

module.exports = User;