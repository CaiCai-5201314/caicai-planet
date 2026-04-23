const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Achievement = sequelize.define('Achievement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    condition_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['tasks_completed', 'events_participated', 'points_earned', 'posts_created', 'comments_made']]
      }
    },
    condition_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reward_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'achievements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Achievement.associate = (models) => {
    Achievement.hasMany(models.UserAchievement, {
      foreignKey: 'achievement_id',
      as: 'userAchievements'
    });
  };

  return Achievement;
};
