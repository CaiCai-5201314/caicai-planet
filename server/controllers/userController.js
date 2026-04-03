const { User, Post, Comment, FriendLink, Like, Favorite, Sequelize } = require('../models');

const userController = {
  getProfile: async (req, res) => {
    try {
      const { username } = req.params;

      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ['password', 'email', 'role', 'status'] },
        include: [
          {
            model: Post,
            as: 'posts',
            where: { status: 'published' },
            required: false,
            attributes: ['id', 'title', 'summary', 'cover_image', 'view_count', 'like_count', 'comment_count', 'created_at'],
            limit: 10,
            order: [['created_at', 'DESC']]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const stats = await Promise.all([
        Post.count({ where: { author_id: user.id, status: 'published' } }),
        Like.count({ where: { user_id: user.id } }),
        FriendLink.count({ where: { user_id: user.id, status: 'approved' } }),
        Comment.count({ where: { user_id: user.id } })
      ]);

      res.json({
        user: {
          ...user.toJSON(),
          stats: {
            postCount: stats[0],
            likeCount: stats[1],
            friendLinkCount: stats[2],
            commentCount: stats[3]
          }
        }
      });
    } catch (error) {
      console.error('获取用户资料错误:', error);
      res.status(500).json({ message: '获取用户资料失败' });
    }
  },

  getUserPosts: async (req, res) => {
    try {
      const { username } = req.params;
      const { page = 1, limit = 10, category } = req.query;
      const offset = (page - 1) * limit;

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const where = {
        author_id: user.id
      };

      // 只有文章作者或管理员才能查看非发布状态的文章
      if (!req.user || (req.user.username !== username && req.user.role !== 'admin')) {
        where.status = 'published';
      }

      if (category) {
        where.category_id = category;
      }

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
        attributes: ['id', 'title', 'summary', 'cover_image', 'view_count', 'like_count', 'comment_count', 'created_at', 'status'],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户文章错误:', error);
      res.status(500).json({ message: '获取用户文章失败' });
    }
  },

  getUserFavorites: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: favorites } = await Favorite.findAndCountAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Post,
            as: 'post',
            where: { status: 'published' },
            required: true,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        favorites: favorites.map(f => f.post),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户收藏错误:', error);
      res.status(500).json({ message: '获取用户收藏失败' });
    }
  },

  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '请上传图片' });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await req.user.update({ avatar: avatarUrl });

      res.json({
        message: '头像上传成功',
        avatar: avatarUrl
      });
    } catch (error) {
      console.error('上传头像错误:', error);
      res.status(500).json({ message: '上传头像失败' });
    }
  },

  uploadCover: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '请上传图片' });
      }

      const coverUrl = `/uploads/covers/${req.file.filename}`;
      await req.user.update({ cover_image: coverUrl });

      res.json({
        message: '封面上传成功',
        cover_image: coverUrl
      });
    } catch (error) {
      console.error('上传封面错误:', error);
      res.status(500).json({ message: '上传封面失败' });
    }
  },

  getUserLikes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: likes } = await Like.findAndCountAll({
        where: { user_id: req.user.id },
        include: [
          {
            model: Post,
            as: 'post',
            where: { status: 'published' },
            required: true,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        likes: likes.map(l => l.post),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户点赞错误:', error);
      res.status(500).json({ message: '获取用户点赞失败' });
    }
  }
};

module.exports = userController;
