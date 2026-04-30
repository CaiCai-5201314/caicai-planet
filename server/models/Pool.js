module.exports = (sequelize, DataTypes) => {
  const Pool = sequelize.define('Pool', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('fixed', 'random'),
      allowNull: false,
      defaultValue: 'fixed'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    random_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'pools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['name'] },
      { fields: ['type'] },
      { fields: ['status'] }
    ]
  });

  Pool.associate = (models) => {
    Pool.hasMany(models.FileStorage, {
      foreignKey: 'pool_id',
      as: 'files'
    });
  };

  return Pool;
};