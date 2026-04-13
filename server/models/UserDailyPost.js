module.exports = (sequelize, DataTypes) => {
  const UserDailyPost = sequelize.define('UserDailyPost', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '文章ID'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '发布日期'
    }
  }, {
    tableName: 'user_daily_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id', 'date'],
        name: 'unique_user_post_date'
      }
    ]
  });

  UserDailyPost.associate = (models) => {
    UserDailyPost.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', constraints: false });
    UserDailyPost.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post', constraints: false });
  };

  return UserDailyPost;
};
