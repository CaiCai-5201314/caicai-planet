module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id'
      },
      comment: '文章ID，与task_id互斥'
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      comment: '任务ID，与post_id互斥'
    }
  }, {
    tableName: 'likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
        name: 'unique_user_post_like',
        where: {
          post_id: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        unique: true,
        fields: ['user_id', 'task_id'],
        name: 'unique_user_task_like',
        where: {
          task_id: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
    ]
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Like.belongsTo(models.Post, { foreignKey: 'post_id', as: 'post' });
    Like.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return Like;
};
