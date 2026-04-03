module.exports = (sequelize, DataTypes) => {
  const TaskTopic = sequelize.define('TaskTopic', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    taskTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'task_types',
        key: 'id'
      },
      comment: '所属任务类型ID'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '话题名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '话题描述'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序顺序'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: '创建者ID'
    }
  }, {
    tableName: 'task_topics',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  TaskTopic.associate = (models) => {
    TaskTopic.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    TaskTopic.belongsTo(models.TaskType, {
      foreignKey: 'taskTypeId',
      as: 'taskType'
    });
  };

  return TaskTopic;
};
