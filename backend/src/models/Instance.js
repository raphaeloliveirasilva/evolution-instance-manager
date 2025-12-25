const { Model, DataTypes } = require('sequelize');

class Instance extends Model {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
      status: DataTypes.STRING,
      number: DataTypes.STRING,
      token: DataTypes.STRING, 
      profile_picture: DataTypes.STRING,
      
      // Declarar explicitamente para facilitar o uso no backend
      owner_id: DataTypes.INTEGER,

      settings: {
        type: DataTypes.JSON,
        // Usamos uma função para retornar o objeto, garantindo que 
        // cada nova instância tenha seu próprio objeto único na memória.
        defaultValue: () => ({
          instance: {
            rejectCall: false,
            msgCall: "",
            alwaysOnline: false,
            readMessages: false,
            readStatus: false,
            groupsIgnore: false
          },
          typebot: { 
            enabled: false,
            url: "",
            botName: "",
            expire: 20
          },
          webhook: { 
            enabled: false,
            url: "",
            byEvents: false,
            events: []
          }
        })
      },
    }, {
      sequelize,
      tableName: 'instances', 
      underscored: true, // Garante que campos como createdAt virem created_at
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
  }
}

module.exports = Instance;