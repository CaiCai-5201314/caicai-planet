const { Comment, User, Post, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');

const commentController = {
  getComments: async (req, res) => {
    try {
      const { post_id, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = { status: 'active' };
      if (post_id) {
        where.post_id = post_id;
        where.parent_id = null;
      }

      const { count, rows: comments } = await Comment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: Comment,
            as: 'replies',
            where: { status: 'active' },
            required: false,
            include: [
              {
                model: User,
                as: 'user',
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
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取评论错误:', error);
      res.status(500).json({ message: '获取评论失败' });
    }
  },

  createComment: async (req, res) => {
    try {
      const { post_id, content, parent_id } = req.body;

      const post = await Post.findByPk(post_id);
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      let parentComment = null;
      if (parent_id) {
        parentComment = await Comment.findByPk(parent_id);
        if (!parentComment) {
          return res.status(404).json({ message: '父评论不存在' });
        }
      }

      const comment = await Comment.create({
        post_id,
        content,
        parent_id,
        user_id: req.user.id
      });

      await Post.increment('comment_count', { where: { id: post_id } });

      const newComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });

      // 发送通知给文章作者
      if (post.author_id !== req.user.id) {
        const content = `${req.user.nickname || req.user.username} 评论了你的文章《${post.title}》`;
        await createNotification(post.author_id, 'comment', content, post_id);
      }

      // 发送通知给被回复的用户
      if (parentComment && parentComment.user_id !== req.user.id) {
        const content = `${req.user.nickname || req.user.username} 回复了你的评论`;
        await createNotification(parentComment.user_id, 'comment', content, comment.id);
      }

      res.status(201).json({
        message: '评论成功',
        comment: newComment
      });
    } catch (error) {
      console.error('创建评论错误:', error);
      res.status(500).json({ message: '评论失败' });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权删除此评论' });
      }

      await comment.update({ status: 'deleted' });
      await Post.decrement('comment_count', { where: { id: comment.post_id } });

      res.json({ message: '评论删除成功' });
    } catch (error) {
      console.error('删除评论错误:', error);
      res.status(500).json({ message: '删除评论失败' });
    }
  }
};

module.exports = commentController;
