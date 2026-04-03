const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ErrorType = sequelize.define('ErrorType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    error_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    error_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    },
    http_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_custom: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'error_types',
    timestamps: true,
    indexes: [
      {
        fields: ['error_code']
      },
      {
        fields: ['category']
      },
      {
        fields: ['severity']
      }
    ]
  });

  return ErrorType;
};