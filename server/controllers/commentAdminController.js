const { Comment, User, Post, Task, Sequelize } = require('../models');
const { Op } = Sequelize;

const commentAdminController = {
  getComments: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search, type } = req.query;
      const offset = (page - 1) * limit;

      console.log('获取评论列表 - type:', type);

      const where = {};
      if (status) {
        where.status = status;
      }
      if (search) {
        where.content = {
          [Op.like]: `%${search}%`
        };
      }
      
      // 根据类型筛选：post-社区评论，task-任务评论
      if (type === 'post') {
        // 社区评论：有post_id
        where.post_id = { [Op.ne]: null };
      } else if (type === 'task') {
        // 任务评论：有task_id
        where.task_id = { [Op.ne]: null };
      }

      console.log('查询条件 where:', JSON.stringify(where, null, 2));

      const includeOptions = [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Comment,
          as: 'parent',
          attributes: ['id', 'content'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'nickname']
            }
          ]
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
      ];

      // 根据类型添加关联
      if (type === 'task' || !type) {
        includeOptions.push({
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        });
      }
      if (type === 'post' || !type) {
        includeOptions.push({
          model: Post,
          as: 'post',
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
      console.error('获取评论列表错误:', error);
      res.status(500).json({ message: '获取评论列表失败' });
    }
  },

  // 更新评论状态
  updateCommentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      const oldStatus = comment.status;
      await comment.update({ status });

      // 如果状态从非active变为active，增加文章评论数
      if (oldStatus !== 'active' && status === 'active') {
        await Post.increment('comment_count', { where: { id: comment.post_id } });
      }
      // 如果状态从active变为非active，减少文章评论数
      if (oldStatus === 'active' && status !== 'active') {
        await Post.decrement('comment_count', { where: { id: comment.post_id } });
      }

      res.json({
        message: '评论状态更新成功',
        comment: {
          id: comment.id,
          status: comment.status
        }
      });
    } catch (error) {
      console.error('更新评论状态错误:', error);
      res.status(500).json({ message: '更新评论状态失败' });
    }
  },

  // 回复评论（管理员）
  replyComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const parentComment = await Comment.findByPk(id);
      if (!parentComment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      const reply = await Comment.create({
        post_id: parentComment.post_id,
        content,
        parent_id: id,
        user_id: req.user.id,
        status: 'active'
      });

      await Post.increment('comment_count', { where: { id: parentComment.post_id } });

      const newReply = await Comment.findByPk(reply.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });

      res.status(201).json({
        message: '回复成功',
        comment: newReply
      });
    } catch (error) {
      console.error('回复评论错误:', error);
      res.status(500).json({ message: '回复评论失败' });
    }
  }
};

module.exports = commentAdminController;