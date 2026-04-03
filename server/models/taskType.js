module.exports = (sequelize, DataTypes) => {
  const TaskType = sequelize.define('TaskType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '任务类型名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务类型描述'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'both'),
      allowNull: false,
      defaultValue: 'both',
      comment: '适用性别：male-男版，female-女版，both-通用'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '类型图标'
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: '',
      comment: '类型颜色'
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
    tableName: 'task_types',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  TaskType.associate = (models) => {
    TaskType.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    TaskType.hasMany(models.TaskTopic, {
      foreignKey: 'taskTypeId',
      as: 'topics'
    });
  };

  return TaskType;
};
