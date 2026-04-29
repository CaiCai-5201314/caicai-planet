module.exports = (sequelize, DataTypes) => {
  const DiceUsage = sequelize.define('DiceUsage', {
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
    purchase_record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '购买记录ID'
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '使用时间'
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '投掷结果'
    }
  }, {
    tableName: 'dice_usages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  DiceUsage.associate = (models) => {
    DiceUsage.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
    DiceUsage.belongsTo(models.PurchaseRecord, { foreignKey: 'purchase_record_id', as: 'purchaseRecord', constraints: false });
  };

  return DiceUsage;
};