const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAchievement = sequelize.define('UserAchievement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    achievement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'achievements',
        key: 'id'
      }
    },
    achieved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_achievements',
    timestamps: false
  });

  UserAchievement.associate = (models) => {
    UserAchievement.belongsTo(models.Achievement, {
      foreignKey: 'achievement_id',
      as: 'achievement'
    });
  };

  return UserAchievement;
};
