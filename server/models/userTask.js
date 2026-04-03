module.exports = (sequelize, DataTypes) => {
  const UserTask = sequelize.define('UserTask', {
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
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('accepted', 'completed', 'cancelled'),
      defaultValue: 'accepted',
      comment: '任务状态：accepted-已接受，completed-已完成，cancelled-已取消'
    },
    acceptedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '接受时间'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间'
    }
  }, {
    tableName: 'user_tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'task_id']
      }
    ]
  });

  UserTask.associate = (models) => {
    UserTask.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UserTask.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return UserTask;
};
