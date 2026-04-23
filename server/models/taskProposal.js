module.exports = (sequelize, DataTypes) => {
  const TaskProposal = sequelize.define('TaskProposal', {
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
      allowNull: false,
      comment: '任务描述'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'both'),
      allowNull: false,
      comment: '适用专区：male-男版，female-女版，both-通用'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium',
      comment: '任务难度：easy-简单，medium-中等，hard-困难'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      comment: '审核状态：pending-待审核，approved-已通过，rejected-已拒绝'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: '提议用户ID'
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: '审核管理员ID'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核时间'
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
    tableName: 'task_proposals',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  TaskProposal.associate = (models) => {
    TaskProposal.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    TaskProposal.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return TaskProposal;
};
