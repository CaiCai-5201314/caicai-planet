module.exports = (sequelize, DataTypes) => {
  const MoonPointRule = sequelize.define('MoonPointRule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '规则名称'
    },
    reason_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '原因类型'
    },
    base_points: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      defaultValue: 0,
      comment: '基础月球分'
    },
    need_approval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否需要审核'
    },
    daily_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '每日限制次数，null表示无限制'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '规则描述'
    }
  }, {
    tableName: 'moon_point_rules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return MoonPointRule;
};
