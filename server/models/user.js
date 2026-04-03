module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uid: {
      type: DataTypes.STRING(5),
      allowNull: false,
      unique: true,
      comment: '5位数字用户ID，不可修改'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '/uploads/avatars/default.png'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cover_style: {
      type: DataTypes.ENUM('cover', 'contain', 'stretch', 'center'),
      allowNull: true,
      defaultValue: 'cover'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    github: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    weibo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'active'
    },
    is_muted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否禁言'
    },
    is_post_banned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否禁止发布'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_username_change: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: 'author_id', as: 'posts' });
    User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
    User.hasMany(models.FriendLink, { foreignKey: 'user_id', as: 'friendLinks' });
    User.hasMany(models.Like, { foreignKey: 'user_id', as: 'likes' });
    User.hasMany(models.Favorite, { foreignKey: 'user_id', as: 'favorites' });
  };

  return User;
};
