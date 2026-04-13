const { Comment, User, Post, Task, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');

const commentController = {
  getComments: async (req, res) => {
    try {
      const { post_id, task_id, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = { status: 'active' };
      
      if (post_id) {
        where.post_id = post_id;
        where.parent_id = null;
      } else if (task_id) {
        where.task_id = task_id;
        where.parent_id = null;
      }

      const includeOptions = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'uid', 'username', 'nickname', 'avatar', 'exp']
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
              attributes: ['id', 'uid', 'username', 'nickname', 'avatar', 'exp']
            }
          ]
        }
      ];

      if (post_id) {
        includeOptions.push({
          model: Post,
          as: 'post',
          attributes: ['id', 'title']
        });
      } else if (task_id) {
        includeOptions.push({
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        });
      }

      const { count, rows: comments } = await Comment.findAndCountAll({
        where,
        include: includeOptions,
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
      const { post_id, task_id, content, parent_id } = req.body;
      
      console.log('创建评论请求:', { post_id, task_id, content, parent_id, user_id: req.user?.id });

      if (!post_id && !task_id) {
        return res.status(400).json({ message: '请指定文章或任务' });
      }

      if (post_id && task_id) {
        return res.status(400).json({ message: '不能同时指定文章和任务' });
      }

      let target = null;
      let targetType = '';

      if (post_id) {
        target = await Post.findByPk(post_id);
        targetType = '文章';
        if (!target) {
          return res.status(404).json({ message: '文章不存在' });
        }
      } else if (task_id) {
        target = await Task.findByPk(task_id);
        targetType = '任务';
        if (!target) {
          return res.status(404).json({ message: '任务不存在' });
        }
      }

      let parentComment = null;
      if (parent_id) {
        parentComment = await Comment.findByPk(parent_id);
        if (!parentComment) {
          return res.status(404).json({ message: '父评论不存在' });
        }
      }

      const commentData = {
        content,
        parent_id,
        user_id: req.user.id
      };

      if (post_id) {
        commentData.post_id = post_id;
      } else if (task_id) {
        commentData.task_id = task_id;
      }

      const comment = await Comment.create(commentData);

      if (post_id) {
        await Post.increment('comment_count', { where: { id: post_id } });
      }

      const newComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });

      // 发送通知给目标作者（文章作者或任务创建者）
      try {
        const authorId = post_id ? target.author_id : target.createdBy;
        if (authorId && authorId !== req.user.id) {
          const notifyContent = `${req.user.nickname || req.user.username} 评论了你的${targetType}《${target.title}》`;
          await createNotification(authorId, 'comment', notifyContent, post_id || task_id);
        }
      } catch (notifyError) {
        console.error('发送评论通知失败:', notifyError);
      }

      // 发送通知给被回复的用户
      try {
        if (parentComment && parentComment.user_id !== req.user.id) {
          const notifyContent = `${req.user.nickname || req.user.username} 回复了你的评论`;
          await createNotification(parentComment.user_id, 'comment', notifyContent, comment.id);
        }
      } catch (notifyError) {
        console.error('发送回复通知失败:', notifyError);
      }

      res.status(201).json({
        message: '评论成功',
        comment: newComment
      });
    } catch (error) {
      console.error('创建评论错误:', error);
      console.error('错误详情:', error.message, error.stack);
      res.status(500).json({ message: '评论失败', error: error.message });
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
      
      if (comment.post_id) {
        await Post.decrement('comment_count', { where: { id: comment.post_id } });
      }

      res.json({ message: '评论删除成功' });
    } catch (error) {
      console.error('删除评论错误:', error);
      res.status(500).json({ message: '删除评论失败' });
    }
  }
};

module.exports = commentController;
