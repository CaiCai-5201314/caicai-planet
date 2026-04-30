module.exports = (sequelize, DataTypes) => {
  const CDK = sequelize.define('CDK', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: 'CDK码'
    },
    type: {
      type: DataTypes.ENUM('single', 'batch', 'vip'),
      allowNull: false,
      defaultValue: 'single',
      comment: '类型：单码/批次/专属'
    },
    batch_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '批次码（批次CDK共用）'
    },
    rewards: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '奖励内容 {"moon_points":100, "exp":50, "items":[...]}'
    },
    pool_type: {
      type: DataTypes.ENUM('fixed', 'random'),
      allowNull: true,
      comment: '池类型：固定池/随机池'
    },
    pool_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联的池ID'
    },
    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '总数量'
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '已使用数量'
    },
    expire_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '过期时间'
    },
    min_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '最低等级限制'
    },
    min_moon_points: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
      defaultValue: 0,
      comment: '最低月球分限制'
    },
    max_use_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '每人最多使用次数'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述说明'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '创建者ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '创建时间'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '更新时间'
    }
  }, {
    tableName: 'cdks',
    timestamps: false,
    indexes: [
      { name: 'idx_cdk_code', fields: ['code'] },
      { name: 'idx_cdk_batch', fields: ['batch_code'] },
      { name: 'idx_cdk_status', fields: ['status'] },
      { name: 'idx_cdk_expire', fields: ['expire_at'] }
    ]
  });

  CDK.associate = (models) => {
    CDK.hasMany(models.CDKUse, { foreignKey: 'cdk_id', as: 'uses' });
    CDK.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator', constraints: false });
    CDK.hasMany(models.Product, { foreignKey: 'cdk_id', as: 'products', constraints: false });
  };

  return CDK;
};