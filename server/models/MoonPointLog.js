module.exports = (sequelize, DataTypes) => {
  const MoonPointLog = sequelize.define('MoonPointLog', {
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
      comment: '月球分数值（正数为增加，负数为减少）'
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '获得/扣除原因'
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
    }
  }, {
    tableName: 'moon_point_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MoonPointLog.associate = (models) => {
    MoonPointLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
  };

  return MoonPointLog;
};