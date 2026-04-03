const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ErrorTypeVersion = sequelize.define('ErrorTypeVersion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    error_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'error_types',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: false
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
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false
    },
    http_status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    change_note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'error_type_versions',
    timestamps: true,
    indexes: [
      {
        fields: ['error_type_id']
      },
      {
        fields: ['version']
      }
    ]
  });

  return ErrorTypeVersion;
};