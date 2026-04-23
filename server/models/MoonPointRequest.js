module.exports = (sequelize, DataTypes) => {
  const MoonPointRequest = sequelize.define('MoonPointRequest', {
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
    points: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      comment: '月球分数值'
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '申请原因'
    },
    reason_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'other',
      comment: '原因类型'
    },
    related_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '相关记录ID（如任务ID、活动ID等）'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '审核状态'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '审核人ID'
    },
    approval_note: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '审核备注'
    }
  }, {
    tableName: 'moon_point_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MoonPointRequest.associate = (models) => {
    MoonPointRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
    MoonPointRequest.belongsTo(models.User, { foreignKey: 'approved_by', as: 'approver', constraints: false });
  };

  return MoonPointRequest;
};
