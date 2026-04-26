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
    exp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '用户经验值'
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
      type: DataTypes.ENUM('user', 'admin', 'sub_admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      allowNull: false,
      defaultValue: 'active'
    },
    is_sub_account: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    parent_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
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
    },
    register_ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用户注册时的IP地址'
    },
    email_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否接收邮件通知'
    },
    push_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否接收推送通知'
    },
    comment_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否接收评论通知'
    },
    like_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否接收点赞通知'
    },
    system_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否接收系统通知'
    },
    badge_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否显示未读通知角标'
    },
    profile_visibility: {
      type: DataTypes.ENUM('public', 'followers', 'private'),
      allowNull: false,
      defaultValue: 'public',
      comment: '个人资料可见性'
    },
    show_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否显示邮箱'
    },
    show_activity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否显示活动动态'
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark'),
      allowNull: false,
      defaultValue: 'light',
      comment: '主题设置'
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'zh-CN',
      comment: '语言设置'
    },
    last_checkin_reminder: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '最后一次打卡提醒的日期'
    },
    moon_center_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '所属月球分中心ID'
    },
    moon_points: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
      defaultValue: 0,
      comment: '月球分数值'
    },
    current_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '当前登录token，用于单设备登录限制'
    },
    task_ban_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '任务接取禁令结束时间'
    },
    current_task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '当前正在进行的任务ID'
    },
    last_moon_point_decay_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后一次月球分衰减时间'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: 'author_id', as: 'posts', onDelete: 'CASCADE' });
    User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
    User.hasMany(models.FriendLink, { foreignKey: 'user_id', as: 'friendLinks', onDelete: 'CASCADE' });
    User.hasMany(models.Like, { foreignKey: 'user_id', as: 'likes', onDelete: 'CASCADE' });
    User.hasMany(models.Favorite, { foreignKey: 'user_id', as: 'favorites', onDelete: 'CASCADE' });
    User.belongsTo(models.UserLevel, { foreignKey: 'level', targetKey: 'level', as: 'userLevel', constraints: false });
    User.belongsTo(models.MoonCenter, { foreignKey: 'moon_center_id', as: 'moonCenter', constraints: false });
  };

  return User;
};
