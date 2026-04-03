const { UserTask, Task, User, Like } = require('../models');

const userTaskController = {
  // 接受任务
  acceptTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      // 检查任务是否存在
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({ message: '任务不存在' });
      }

      // 检查任务状态
      if (task.status !== 'published') {
        return res.status(400).json({ message: '任务未发布或已过期' });
      }

      // 检查是否已接受
      const existingUserTask = await UserTask.findOne({
        where: { user_id: userId, task_id: taskId }
      });

      if (existingUserTask) {
        if (existingUserTask.status === 'accepted') {
          return res.status(400).json({ message: '您已接受该任务' });
        } else if (existingUserTask.status === 'completed') {
          return res.status(400).json({ message: '您已完成该任务' });
        } else if (existingUserTask.status === 'cancelled') {
          // 重新接受
          await existingUserTask.update({ status: 'accepted', acceptedAt: new Date() });
          return res.json({ message: '任务重新接受成功', userTask: existingUserTask });
        }
      }

      // 创建用户任务记录
      const userTask = await UserTask.create({
        user_id: userId,
        task_id: taskId,
        status: 'accepted'
      });

      // 增加任务参与人数
      await Task.increment('currentParticipants', { where: { id: taskId } });

      res.status(201).json({
        message: '任务接受成功',
        userTask
      });
    } catch (error) {
      console.error('接受任务错误:', error);
      res.status(500).json({ message: '接受任务失败' });
    }
  },

  // 取消任务
  cancelTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const userTask = await UserTask.findOne({
        where: { user_id: userId, task_id: taskId }
      });

      if (!userTask) {
        return res.status(404).json({ message: '未找到该任务记录' });
      }

      if (userTask.status === 'completed') {
        return res.status(400).json({ message: '已完成任务无法取消' });
      }

      await userTask.update({ status: 'cancelled' });

      // 减少任务参与人数
      await Task.decrement('currentParticipants', { where: { id: taskId } });

      res.json({ message: '任务取消成功' });
    } catch (error) {
      console.error('取消任务错误:', error);
      res.status(500).json({ message: '取消任务失败' });
    }
  },

  // 完成任务
  completeTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const userTask = await UserTask.findOne({
        where: { user_id: userId, task_id: taskId }
      });

      if (!userTask) {
        return res.status(404).json({ message: '未找到该任务记录' });
      }

      if (userTask.status !== 'accepted') {
        return res.status(400).json({ message: '只能完成已接受的任务' });
      }

      await userTask.update({
        status: 'completed',
        completedAt: new Date()
      });

      // 给用户增加积分（如果有奖励）
      const task = await Task.findByPk(taskId);
      if (task && task.reward > 0) {
        await User.increment('points', {
          by: task.reward,
          where: { id: userId }
        });
      }

      res.json({
        message: '任务完成成功',
        reward: task ? task.reward : 0
      });
    } catch (error) {
      console.error('完成任务错误:', error);
      res.status(500).json({ message: '完成任务失败' });
    }
  },

  // 获取用户接受的任务列表
  getUserTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: userId };
      if (status) {
        where.status = status;
      }

      const { count, rows: userTasks } = await UserTask.findAndCountAll({
        where,
        include: [
          {
            model: Task,
            as: 'task',
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'username', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['acceptedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        userTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户任务列表错误:', error);
      res.status(500).json({ message: '获取任务列表失败' });
    }
  },

  // 获取用户点赞的任务列表
  getUserLikedTasks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: likes } = await Like.findAndCountAll({
        where: {
          user_id: userId,
          task_id: { [require('sequelize').Op.ne]: null }
        },
        include: [
          {
            model: Task,
            as: 'task',
            include: [
              {
                model: User,
                as: 'creator',
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
        likedTasks: likes.map(like => like.task),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户点赞任务错误:', error);
      res.status(500).json({ message: '获取点赞任务失败' });
    }
  },

  // 检查用户是否已接受任务
  checkTaskStatus: async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const userTask = await UserTask.findOne({
        where: { user_id: userId, task_id: taskId }
      });

      const like = await Like.findOne({
        where: { user_id: userId, task_id: taskId }
      });

      res.json({
        accepted: !!userTask && userTask.status === 'accepted',
        completed: !!userTask && userTask.status === 'completed',
        liked: !!like,
        status: userTask ? userTask.status : null
      });
    } catch (error) {
      console.error('检查任务状态错误:', error);
      res.status(500).json({ message: '检查任务状态失败' });
    }
  }
};

module.exports = userTaskController;
