'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ErrorLog extends Model {
    static associate(models) {
      ErrorLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  
  ErrorLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    error_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stack: {
      type: DataTypes.TEXT
    },
    url: {
      type: DataTypes.STRING(255)
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    device_info: {
      type: DataTypes.JSON
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    environment: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    context: {
      type: DataTypes.JSON
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    first_seen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ErrorLog',
    tableName: 'error_logs',
    timestamps: true,
    underscored: true
  });
  
  return ErrorLog;
};
