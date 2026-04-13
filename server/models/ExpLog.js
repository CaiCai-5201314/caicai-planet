module.exports = (sequelize, DataTypes) => {
  const ExpLog = sequelize.define('ExpLog', {
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
    exp_change: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '经验值变化（正数增加，负数减少）'
    },
    exp_before: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变化前经验值'
    },
    exp_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变化后经验值'
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '变化原因'
    },
    reason_type: {
      type: DataTypes.ENUM('check_in', 'task', 'post', 'comment', 'like', 'admin', 'login', 'other'),
      allowNull: false,
      defaultValue: 'other',
      comment: '原因类型'
    },
    related_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联ID（如任务ID、文章ID等）'
    },
    operator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '操作人ID（管理员操作时记录）'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'exp_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExpLog.associate = (models) => {
    ExpLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
    ExpLog.belongsTo(models.User, { foreignKey: 'operator_id', as: 'operator', constraints: false });
  };

  return ExpLog;
};
