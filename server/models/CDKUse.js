module.exports = (sequelize, DataTypes) => {
  const CDKUse = sequelize.define('CDKUse', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cdk_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'CDK ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    rewards_received: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '实际获得的奖励'
    },
    used_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '使用时间'
    }
  }, {
    tableName: 'cdk_uses',
    timestamps: false,
    indexes: [
      { name: 'idx_cdk_use_cdk', fields: ['cdk_id'] },
      { name: 'idx_cdk_use_user', fields: ['user_id'] },
      { name: 'idx_cdk_use_time', fields: ['used_at'] },
      { name: 'unique_user_cdk', fields: ['user_id', 'cdk_id'], unique: true }
    ]
  });

  CDKUse.associate = (models) => {
    CDKUse.belongsTo(models.CDK, { foreignKey: 'cdk_id', as: 'cdk' });
    CDKUse.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
  };

  return CDKUse;
};