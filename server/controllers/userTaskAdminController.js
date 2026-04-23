const { UserTask, User, Task } = require('../models');

const userTaskAdminController = {
  // 获取用户任务列表
  getUserTasks: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, userId, taskId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (userId) {
        where.user_id = userId;
      }
      if (taskId) {
        where.task_id = taskId;
      }

      const { count, rows: userTasks } = await UserTask.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar', 'email']
          },
          {
            model: Task,
            as: 'task',
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'username', 'nickname']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
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
      res.status(500).json({ message: '获取用户任务列表失败' });
    }
  },

  // 更新用户任务状态
  updateUserTaskStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const userTask = await UserTask.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'nickname'] },
          { model: Task, as: 'task', attributes: ['id', 'title'] }
        ]
      });

      if (!userTask) {
        return res.status(404).json({ message: '用户任务记录不存在' });
      }

      const oldStatus = userTask.status;
      const updateData = { status };

      if (status === 'completed' && oldStatus !== 'completed') {
        updateData.completedAt = new Date();
        // 给用户增加积分
        if (userTask.task && userTask.task.reward > 0) {
          await User.increment('points', {
            by: userTask.task.reward,
            where: { id: userTask.user_id }
          });
        }
      }

      await userTask.update(updateData);

      res.json({
        message: '任务状态更新成功',
        userTask: {
          id: userTask.id,
          status: userTask.status,
          user: userTask.user,
          task: userTask.task
        }
      });
    } catch (error) {
      console.error('更新用户任务状态错误:', error);
      res.status(500).json({ message: '更新任务状态失败' });
    }
  },

  // 删除用户任务记录
  deleteUserTask: async (req, res) => {
    try {
      const { id } = req.params;

      const userTask = await UserTask.findByPk(id);
      if (!userTask) {
        return res.status(404).json({ message: '用户任务记录不存在' });
      }

      await userTask.destroy();

      // 减少任务参与人数
      await Task.decrement('currentParticipants', { where: { id: userTask.task_id } });

      res.json({ message: '用户任务记录删除成功' });
    } catch (error) {
      console.error('删除用户任务错误:', error);
      res.status(500).json({ message: '删除用户任务失败' });
    }
  }
};

module.exports = userTaskAdminController;