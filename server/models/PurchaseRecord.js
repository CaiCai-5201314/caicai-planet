module.exports = (sequelize, DataTypes) => {
  const PurchaseRecord = sequelize.define('PurchaseRecord', {
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
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称'
    },
    price: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      comment: '购买价格'
    },
    cdk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联的CDK ID'
    },
    status: {
      type: DataTypes.ENUM('completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'completed',
      comment: '购买状态'
    }
  }, {
    tableName: 'purchase_records',
    timestamps: true,
    createdAt: 'purchased_at',
    updatedAt: 'updated_at'
  });

  PurchaseRecord.associate = (models) => {
    PurchaseRecord.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
    PurchaseRecord.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', constraints: false });
    PurchaseRecord.belongsTo(models.CDK, { foreignKey: 'cdk_id', as: 'cdk', constraints: false });
  };

  return PurchaseRecord;
};