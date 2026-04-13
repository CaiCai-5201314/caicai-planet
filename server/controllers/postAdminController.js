const { Post, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');

const postAdminController = {
  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status, category } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (category) where.category_id = category;

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
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
      console.error('获取文章列表错误:', error);
      res.status(500).json({ message: '获取文章列表失败' });
    }
  },

  // 更新文章状态（审核）
  updatePostStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const post = await Post.findByPk(id, {
        include: [{ model: User, as: 'author' }]
      });
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      await post.update({ status });

      // 发送文章审核通知
      let content = '';
      if (status === 'published') {
        content = `您的文章《${post.title}》已审核通过，现在可以在社区页面查看。`;
      } else if (status === 'rejected') {
        content = `您的文章《${post.title}》审核未通过，无法在社区页面显示。`;
      }

      if (content) {
        await createNotification(post.author_id, 'post_approval', content, post.id);
      }

      res.json({
        message: '文章状态更新成功',
        post: {
          id: post.id,
          title: post.title,
          status: post.status
        }
      });
    } catch (error) {
      console.error('更新文章状态错误:', error);
      res.status(500).json({ message: '更新文章状态失败' });
    }
  }
};

module.exports = postAdminController;