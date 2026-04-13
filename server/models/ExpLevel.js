module.exports = (sequelize, DataTypes) => {
  const ExpLevel = sequelize.define('ExpLevel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '等级编号'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '等级名称'
    },
    min_exp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最低经验值'
    },
    max_exp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最高经验值'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '等级图标'
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#8b5cf6',
      comment: '等级颜色'
    },
    privileges: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: '等级特权'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '等级描述'
    },
    point_bonus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '积分加成百分比'
    },
    moon_points_bonus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '月球分加成百分比'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用'
    }
  }, {
    tableName: 'exp_levels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExpLevel.associate = (models) => {
    ExpLevel.hasMany(models.User, { foreignKey: 'level', sourceKey: 'level', as: 'levelUsers', constraints: false });
  };

  return ExpLevel;
};
