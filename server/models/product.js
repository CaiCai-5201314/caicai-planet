const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0.01
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active'
    },
    cdk_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联的CDK ID'
    },
    cdk_reward_type: {
      type: DataTypes.ENUM('direct', 'on_purchase'),
      allowNull: true,
      defaultValue: 'on_purchase',
      comment: 'CDK奖励发放方式：直接发放/购买后发放'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'products',
    timestamps: false,
    hooks: {
      beforeUpdate: (product) => {
        product.updated_at = new Date();
      }
    }
  });

  Product.associate = (models) => {
    Product.belongsTo(models.CDK, { foreignKey: 'cdk_id', as: 'cdk', constraints: false });
  };

  return Product;
};