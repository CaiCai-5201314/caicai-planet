module.exports = (sequelize, DataTypes) => {
  const FileStorage = sequelize.define('FileStorage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    compressed_size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    local_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    qiniu_key: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    qiniu_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'deleted'),
      defaultValue: 'active',
      allowNull: false
    },
    pool_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'file_storages',
    timestamps: true,
    paranoid: true
  });

  FileStorage.associate = (models) => {
    FileStorage.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    FileStorage.belongsTo(models.Pool, { foreignKey: 'pool_id', as: 'pool' });
  };

  return FileStorage;
};