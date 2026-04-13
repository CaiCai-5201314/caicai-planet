module.exports = (sequelize, DataTypes) => {
  const UserLevel = sequelize.define('UserLevel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    required_exp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#3b82f6'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_levels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return UserLevel;
};
