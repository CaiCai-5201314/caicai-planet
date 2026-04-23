module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '任务名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务描述'
    },
    type: {
      type: DataTypes.ENUM('sports', 'tech', 'beauty', 'crafts', 'other'),
      defaultValue: 'other',
      comment: '任务类型（保留原有枚举类型作为兼容）'
    },
    customTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'task_types',
        key: 'id'
      },
      comment: '自定义任务类型ID'
    },
    customTopicId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'task_topics',
        key: 'id'
      },
      comment: '自定义话题ID'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
      comment: '任务所属性别专区：male-男版，female-女版'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'expired', 'disabled'),
      defaultValue: 'draft',
      comment: '任务状态：draft-待发布，published-已发布，expired-已过期，disabled-已禁用'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
      comment: '任务难度：easy-简单，medium-中等，hard-困难'
    },
    reward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '任务奖励积分'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '生效时间'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间'
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最大参与人数'
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前参与人数'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '任务图标'
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '任务卡片颜色'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '创建者ID'
    },
    proposalUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '提议用户ID（如果是用户提议的任务）'
    },
    suggestedTime: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '建议游玩时间'
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '任务道具（JSON格式存储）'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    Task.belongsTo(models.User, {
      foreignKey: 'proposalUserId',
      as: 'proposalUser'
    });
    Task.belongsTo(models.TaskType, {
      foreignKey: 'customTypeId',
      as: 'customType'
    });
    Task.belongsTo(models.TaskTopic, {
      foreignKey: 'customTopicId',
      as: 'customTopic'
    });
    Task.hasMany(models.Comment, {
      foreignKey: 'task_id',
      as: 'comments'
    });
  };

  return Task;
};
