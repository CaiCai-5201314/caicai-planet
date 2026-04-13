module.exports = (sequelize, DataTypes) => {
  const UserDailyTaskAccept = sequelize.define('UserDailyTaskAccept', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '任务ID'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '接取日期'
    }
  }, {
    tableName: 'user_daily_task_accepts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'task_id', 'date'],
        name: 'unique_user_task_date'
      }
    ]
  });

  UserDailyTaskAccept.associate = (models) => {
    UserDailyTaskAccept.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserDailyTaskAccept.belongsTo(models.Task, {
      foreignKey: 'task_id',
      as: 'task'
    });
  };

  return UserDailyTaskAccept;
};
