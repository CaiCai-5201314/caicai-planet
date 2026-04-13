module.exports = (sequelize, DataTypes) => {
  const MoonCenter = sequelize.define('MoonCenter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分中心名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分中心代码'
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所属区域'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '分中心描述'
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '管理员ID'
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
      comment: '最大用户数'
    },
    current_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '当前用户数'
    },
    resource_allocation: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: '资源分配配置'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      allowNull: false,
      defaultValue: 'active',
      comment: '分中心状态'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: '其他配置'
    }
  }, {
    tableName: 'moon_centers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MoonCenter.associate = (models) => {
    MoonCenter.belongsTo(models.User, { foreignKey: 'manager_id', as: 'manager', constraints: false });
    MoonCenter.hasMany(models.User, { foreignKey: 'moon_center_id', as: 'users', constraints: false });
  };

  return MoonCenter;
};
