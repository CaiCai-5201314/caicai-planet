module.exports = (sequelize, DataTypes) => {
  const FriendLink = sequelize.define('FriendLink', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('tech', 'life', 'design', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reciprocal_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_reciprocal_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // 外链接相关字段
    share_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true
    },
    share_password: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    share_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    share_limit: {
      type: DataTypes.INTEGER,
      allowNull: true // null 表示无限制
    },
    share_expires_at: {
      type: DataTypes.DATE,
      allowNull: true // null 表示永不过期
    },
    share_created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'friend_links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  FriendLink.associate = (models) => {
    FriendLink.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return FriendLink;
};
