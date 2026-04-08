const { Post, User, Category, Tag, Comment, Like, Favorite, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');

// 全局浏览记录缓存，用于防重复点击
const viewRecords = new Map();

const postController = {
  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 10, category, tag, search, sort = 'newest' } = req.query;
      const offset = (page - 1) * limit;

      const where = { status: 'published' };

      if (category) {
        where.category_id = category;
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      let order = [['is_pinned', 'DESC'], ['pinned_at', 'DESC'], ['created_at', 'DESC']];
      if (sort === 'popular') {
        order = [['is_pinned', 'DESC'], ['pinned_at', 'DESC'], ['view_count', 'DESC']];
      } else if (sort === 'most_liked') {
        order = [['is_pinned', 'DESC'], ['pinned_at', 'DESC'], ['like_count', 'DESC']];
      }

      const include = [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar']
        }
      ];

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
        include,
        order,
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
      console.error('获取文章列表错误:', error);
      res.status(500).json({ message: '获取文章列表失败' });
    }
  },

  getPost: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await Post.findOne({
        where: {
          [Op.or]: [
            { id: !isNaN(id) ? parseInt(id) : 0 },
            { slug: id }
          ],
          status: 'published'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'nickname', 'avatar', 'bio']
          }
        ]
      });

      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      // 添加防重复点击机制，使用IP地址和文章ID作为标识
      const clientIP = req.ip || req.connection.remoteAddress;
      const key = `view:${clientIP}:${post.id}`;
      
      // 检查是否在30秒内已经增加过浏览量
      const now = Date.now();
      const lastViewTime = viewRecords.get(key);
      
      if (!lastViewTime || now - lastViewTime > 30000) {
        await post.increment('view_count');
        viewRecords.set(key, now);
      }

      let isLiked = false;
      let isFavorited = false;

      if (req.user) {
        const [like, favorite] = await Promise.all([
          Like.findOne({ where: { user_id: req.user.id, post_id: post.id } }),
          Favorite.findOne({ where: { user_id: req.user.id, post_id: post.id } })
        ]);
        isLiked = !!like;
        isFavorited = !!favorite;
      }

      res.json({
        post: {
          ...post.toJSON(),
          isLiked,
          isFavorited
        }
      });
    } catch (error) {
      console.error('获取文章详情错误:', error);
      res.status(500).json({ message: '获取文章详情失败' });
    }
  },

  createPost: async (req, res) => {
    try {
      const { title, content, summary } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: '请提供标题和内容' });
      }

      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      let cover_image = null;
      if (req.file) {
        cover_image = `/uploads/posts/${req.file.filename}`;
      }

      const post = await Post.create({
        title,
        content,
        summary: summary || content.substring(0, 200),
        cover_image,
        author_id: req.user.id,
        status: 'published',
        slug: `${slug}-${Date.now()}`
      });

      res.status(201).json({
        message: '文章发布成功',
        post: await Post.findByPk(post.id, {
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'nickname', 'avatar'] }
          ]
        })
      });
    } catch (error) {
      console.error('创建文章错误:', error);
      res.status(500).json({ message: '创建文章失败' });
    }
  },

  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, summary, category_id, tags, cover_image, status } = req.body;

      const post = await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      if (post.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权修改此文章' });
      }

      await post.update({
        title: title || post.title,
        content: content || post.content,
        summary: summary || post.summary,
        cover_image: cover_image !== undefined ? cover_image : post.cover_image,
        status: status || post.status
      });

      res.json({
        message: '文章更新成功',
        post: await Post.findByPk(post.id, {
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'nickname', 'avatar'] }
          ]
        })
      });
    } catch (error) {
      console.error('更新文章错误:', error);
      res.status(500).json({ message: '更新文章失败' });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id, 10);

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      if (post.author_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权删除此文章' });
      }

      // 先删除关联数据
      await Comment.destroy({ where: { post_id: postId } });
      await Like.destroy({ where: { post_id: postId } });
      await Favorite.destroy({ where: { post_id: postId } });
      
      // 删除文章标签关联
      const { sequelize } = require('../models');
      await sequelize.query('DELETE FROM post_tags WHERE post_id = ?', {
        replacements: [postId],
        type: sequelize.QueryTypes.DELETE
      });

      await post.destroy();

      res.json({ message: '文章删除成功' });
    } catch (error) {
      console.error('删除文章错误:', error);
      res.status(500).json({ message: '删除文章失败', error: error.message });
    }
  },

  likePost: async (req, res) => {
    try {
      const { id } = req.params;

      const existingLike = await Like.findOne({
        where: { user_id: req.user.id, post_id: id }
      });

      if (existingLike) {
        await existingLike.destroy();
        await Post.decrement('like_count', { where: { id } });
        return res.json({ message: '取消点赞成功', liked: false });
      }

      await Like.create({ user_id: req.user.id, post_id: id });
      await Post.increment('like_count', { where: { id } });

      // 发送通知给文章作者
      const post = await Post.findByPk(id, {
        include: [{ model: User, as: 'author' }]
      });
      if (post && post.author_id !== req.user.id) {
        const content = `${req.user.nickname || req.user.username} 点赞了你的文章《${post.title}》`;
        await createNotification(post.author_id, 'like', content, id);
      }

      res.json({ message: '点赞成功', liked: true });
    } catch (error) {
      console.error('点赞错误:', error);
      res.status(500).json({ message: '点赞失败' });
    }
  },

  favoritePost: async (req, res) => {
    try {
      const { id } = req.params;

      const existingFavorite = await Favorite.findOne({
        where: { user_id: req.user.id, post_id: id }
      });

      if (existingFavorite) {
        await existingFavorite.destroy();
        return res.json({ message: '取消收藏成功', favorited: false });
      }

      await Favorite.create({ user_id: req.user.id, post_id: id });

      res.json({ message: '收藏成功', favorited: true });
    } catch (error) {
      console.error('收藏错误:', error);
      res.status(500).json({ message: '收藏失败' });
    }
  },

  togglePin: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '只有管理员可以置顶文章' });
      }

      const post = await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      const newPinnedStatus = !post.is_pinned;
      const newPinnedAt = newPinnedStatus ? new Date() : null;

      await post.update({
        is_pinned: newPinnedStatus,
        pinned_at: newPinnedAt
      });

      res.json({ 
        message: newPinnedStatus ? '文章置顶成功' : '取消置顶成功',
        is_pinned: newPinnedStatus,
        pinned_at: newPinnedAt
      });
    } catch (error) {
      console.error('置顶文章错误:', error);
      res.status(500).json({ message: '置顶文章失败' });
    }
  }
};

module.exports = postController;
