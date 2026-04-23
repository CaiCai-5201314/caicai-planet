const { User, Post, Comment, FriendLink, Like, Favorite, Sequelize } = require('../models');
const storageService = require('../services/storageService');

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
        Post.sum('like_count', { where: { author_id: user.id, status: 'published' } }) || 0,
        FriendLink.count({ where: { user_id: user.id, status: 'approved' } }),
        Comment.count({ where: { user_id: user.id } })
      ]);

      console.log('用户获赞数:', stats[1]);

      // 计算活跃天数（从注册日期到现在的天数）
      const registeredAt = new Date(user.created_at);
      const now = new Date();
      const activeDays = Math.max(0, Math.floor((now - registeredAt) / (1000 * 60 * 60 * 24)));

      res.json({
        user: {
          ...user.toJSON(),
          activeDays,
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
      console.log('Upload avatar request received');
      console.log('Request file:', req.file);
      console.log('Request user:', req.user);
      
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: '请上传图片' });
      }

      let avatarUrl = null;
      try {
        avatarUrl = await storageService.upload(req.file, 'avatars');
      } catch (error) {
        console.error('上传文件失败:', error);
        return res.status(500).json({ message: '上传文件失败' });
      }
      
      console.log('Avatar URL:', avatarUrl);
      console.log('Updating user:', req.user.id);
      
      // 使用User模型来更新用户信息，而不是使用req.user.update()方法
      await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });
      console.log('User updated successfully');

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
      console.log('Upload cover request received');
      console.log('Request file:', req.file);
      console.log('Request user:', req.user);
      
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: '请上传图片' });
      }

      let coverUrl = null;
      try {
        coverUrl = await storageService.upload(req.file, 'covers');
      } catch (error) {
        console.error('上传文件失败:', error);
        return res.status(500).json({ message: '上传文件失败' });
      }
      
      console.log('Cover URL:', coverUrl);
      console.log('Updating user:', req.user.id);
      
      // 使用User模型来更新用户信息，而不是使用req.user.update()方法
      await User.update({ cover_image: coverUrl }, { where: { id: req.user.id } });
      console.log('User updated successfully');

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
  },

  updateSettings: async (req, res) => {
    try {
      const {
        email_notifications,
        push_notifications,
        comment_notifications,
        like_notifications,
        system_notifications,
        badge_notifications,
        profile_visibility,
        show_email,
        show_activity,
        theme,
        language
      } = req.body;

      const updateData = {};
      if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
      if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
      if (comment_notifications !== undefined) updateData.comment_notifications = comment_notifications;
      if (like_notifications !== undefined) updateData.like_notifications = like_notifications;
      if (system_notifications !== undefined) updateData.system_notifications = system_notifications;
      if (badge_notifications !== undefined) updateData.badge_notifications = badge_notifications;
      if (profile_visibility !== undefined) updateData.profile_visibility = profile_visibility;
      if (show_email !== undefined) updateData.show_email = show_email;
      if (show_activity !== undefined) updateData.show_activity = show_activity;
      if (theme !== undefined) updateData.theme = theme;
      if (language !== undefined) updateData.language = language;

      await User.update(updateData, { where: { id: req.user.id } });

      // 获取更新后的用户信息
      const updatedUser = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ['password'] }
      });

      res.json({
        message: '设置更新成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('更新设置错误:', error);
      res.status(500).json({ message: '更新设置失败' });
    }
  }
};

module.exports = userController;
