const { UserTask, Task, User, Like } = require('../models');
const { applyMoonPoints } = require('../services/moonPointService');
const { canAcceptTask, recordTaskAccept } = require('../services/taskLimitService');

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

      // 检查用户是否处于任务接取禁令期间
      const user = await User.findByPk(userId);
      if (user.task_ban_end_time && new Date() < user.task_ban_end_time) {
        const banEndTime = user.task_ban_end_time;
        const remainingTime = Math.ceil((banEndTime - new Date()) / (1000 * 60)); // 转换为分钟
        return res.status(403).json({ 
          message: `您因任务失败被禁止接取任务，剩余时间：${remainingTime}分钟` 
        });
      }

      // 检查每日任务接取限制
      const limitCheck = await canAcceptTask(userId, user.exp);
      if (!limitCheck.canAccept) {
        return res.status(400).json({ 
          message: `您今天已达到每日任务接取上限（${limitCheck.currentCount}/${limitCheck.limit}个），请明天再来！`,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          level: limitCheck.level
        });
      }

      // 检查用户是否已有未完成的任务
      const activeUserTask = await UserTask.findOne({
        where: { 
          user_id: userId, 
          status: 'accepted' 
        }
      });

      if (activeUserTask) {
        const activeTask = await Task.findByPk(activeUserTask.task_id);
        return res.status(400).json({ 
          message: `您当前已有未完成的任务：${activeTask.title}，请完成后再接取新任务` 
        });
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
          // 更新用户当前任务ID
          await user.update({ current_task_id: taskId });
          // 增加任务参与人数
          await Task.increment('currentParticipants', { where: { id: taskId } });
          // 记录任务接取（用于每日限制统计）
          await recordTaskAccept(userId, taskId);
          return res.json({ 
            message: '任务重新接受成功', 
            userTask: existingUserTask,
            limitInfo: {
              currentCount: limitCheck.currentCount + 1,
              limit: limitCheck.limit,
              level: limitCheck.level
            }
          });
        } else if (existingUserTask.status === 'failed') {
          // 重新接受失败的任务
          await existingUserTask.update({ status: 'accepted', acceptedAt: new Date(), failedAt: null });
          // 更新用户当前任务ID
          await user.update({ current_task_id: taskId });
          // 增加任务参与人数
          await Task.increment('currentParticipants', { where: { id: taskId } });
          // 记录任务接取（用于每日限制统计）
          await recordTaskAccept(userId, taskId);
          return res.json({ 
            message: '任务重新接受成功', 
            userTask: existingUserTask,
            limitInfo: {
              currentCount: limitCheck.currentCount + 1,
              limit: limitCheck.limit,
              level: limitCheck.level
            }
          });
        }
      }

      // 创建用户任务记录
      const userTask = await UserTask.create({
        user_id: userId,
        task_id: taskId,
        status: 'accepted'
      });

      // 更新用户当前任务ID
      await user.update({ current_task_id: taskId });

      // 增加任务参与人数
      await Task.increment('currentParticipants', { where: { id: taskId } });

      // 记录任务接取（用于每日限制统计）
      await recordTaskAccept(userId, taskId);

      res.status(201).json({
        message: '任务接受成功',
        userTask,
        limitInfo: {
          currentCount: limitCheck.currentCount + 1,
          limit: limitCheck.limit,
          level: limitCheck.level
        }
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

      // 检查是否在10分钟内
      if (userTask.acceptedAt) {
        const acceptTime = new Date(userTask.acceptedAt);
        const now = new Date();
        const diffMinutes = (now - acceptTime) / (1000 * 60);
        
        if (diffMinutes < 10) {
          const remainingMinutes = Math.ceil(10 - diffMinutes);
          return res.status(400).json({ 
            message: `任务接取后10分钟内禁止取消，剩余时间：${remainingMinutes}分钟` 
          });
        }
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

      // 给用户增加经验值（如果有奖励）
      const task = await Task.findByPk(taskId);
      if (task && task.reward > 0) {
        await User.increment('exp', {
          by: task.reward,
          where: { id: userId }
        });
      }

      // 集成月球分规则系统 - 根据任务难度申请/发放月球分
      let moonPointResult = null;
      try {
        let reasonType = 'complete_task_medium'; // 默认中等任务
        if (task && task.difficulty) {
          if (task.difficulty === 'easy') {
            reasonType = 'complete_task_easy';
          } else if (task.difficulty === 'hard') {
            reasonType = 'complete_task_hard';
          }
        }
        
        console.log(`[completeTask] 调用applyMoonPoints - userId: ${userId}, reasonType: ${reasonType}, userTaskId: ${userTask.id}`);
        moonPointResult = await applyMoonPoints(userId, reasonType, userTask.id);
        
        console.log(`[completeTask] applyMoonPoints结果:`, moonPointResult);
        
        // 检查月球分申请/发放是否成功
        if (!moonPointResult || !moonPointResult.success) {
          return res.status(400).json({ 
            message: '完成任务失败', 
            error: moonPointResult?.error || '月球分发放失败' 
          });
        }
        
        // 如果任务有提议用户，给提议用户申请1点月球分
        let proposalMoonPointResult = null;
        if (task && task.proposalUserId && task.proposalUserId !== userId) {
          try {
            console.log(`[completeTask] 任务有提议用户，给提议用户申请月球分 - proposalUserId: ${task.proposalUserId}`);
            proposalMoonPointResult = await applyMoonPoints(
              task.proposalUserId, 
              'proposal_task_completed', 
              userTask.id,
              `您提议的任务"${task.title}"已被完成`
            );
            console.log(`[completeTask] 提议用户月球分申请结果:`, proposalMoonPointResult);
          } catch (proposalError) {
            console.error('[completeTask] 给提议用户申请月球分失败:', proposalError);
            // 即使提议用户的月球分申请失败不影响主流程，继续执行
          }
        }
        
        // 开启事务
        const sequelize = require('../models').sequelize;
        const transaction = await sequelize.transaction();

        try {
          // 记录月球分申请ID（仅当有申请ID时）
          if (moonPointResult && moonPointResult.requestId) {
            await userTask.update({ moon_point_request_id: moonPointResult.requestId }, { transaction });
          }

          // 只有月球分发放成功后，才更新任务状态
          await userTask.update({
            status: 'completed',
            completedAt: new Date()
          }, { transaction });

          // 清除用户当前任务ID
          await User.update({ current_task_id: null }, { where: { id: userId }, transaction });

          await transaction.commit();
          console.log(`[completeTask] 任务完成成功，事务提交`);

          res.json({
            message: '任务完成成功，已提交到月球中心管理系统等待审核',
            reward: task ? task.reward : 0,
            moonPoint: moonPointResult,
            proposalMoonPoint: proposalMoonPointResult
          });
        } catch (transactionError) {
          await transaction.rollback();
          console.error('事务处理失败:', transactionError);
          res.status(500).json({ message: '完成任务失败，事务处理失败' });
        }
      } catch (moonPointError) {
        console.error('发放月球分失败:', moonPointError);
        res.status(500).json({ message: '完成任务失败，月球分发放失败' });
      }
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
            attributes: ['id', 'title', 'description', 'type', 'gender', 'status', 'difficulty', 'reward', 'startTime', 'endTime', 'icon', 'color', 'createdAt', 'updatedAt']
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
      res.status(500).json({ message: '获取任务列表失败', error: error.message });
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
            attributes: ['id', 'title', 'description', 'type', 'gender', 'status', 'difficulty', 'reward', 'startTime', 'endTime', 'icon', 'color', 'createdAt', 'updatedAt']
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
      res.status(500).json({ message: '获取点赞任务失败', error: error.message });
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
  },

  // 任务失败处理
  failTask: async (req, res) => {
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
        return res.status(400).json({ message: '只能标记已接受的任务为失败' });
      }

      // 开启事务
      const sequelize = require('../models').sequelize;
      const transaction = await sequelize.transaction();

      try {
        // 更新任务状态为失败
        await userTask.update({
          status: 'failed',
          failedAt: new Date()
        }, { transaction });

        // 清除用户当前任务ID
        await User.update({ current_task_id: null }, { where: { id: userId }, transaction });

        // 计算6小时后的时间作为禁令结束时间
        const banEndTime = new Date();
        banEndTime.setHours(banEndTime.getHours() + 6);

        // 设置用户任务接取禁令
        await User.update({ task_ban_end_time: banEndTime }, { where: { id: userId }, transaction });

        // 扣除1月球分作为处罚
        const user = await User.findByPk(userId, { transaction });
        if (user && user.moon_points >= 1) {
          await user.update(
            { moon_points: user.moon_points - 1 },
            { transaction }
          );

          // 创建月球分扣除记录
          const MoonPointLog = require('../models').MoonPointLog;
          await MoonPointLog.create({
            user_id: userId,
            points: -1,
            reason: '任务失败处罚',
            reason_type: 'task_failure_penalty',
            related_id: userTask.id
          }, { transaction });
        }

        await transaction.commit();

        res.json({
          message: '任务标记为失败，已实施处罚：6小时内禁止接取任务，扣除1月球分',
          banEndTime: banEndTime
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('任务失败处理错误:', error);
      res.status(500).json({ message: '任务失败处理失败' });
    }
  },

  // 获取用户任务状态和处罚信息
  getUserTaskStatus: async (req, res) => {
    try {
      const userId = req.user.id;

      // 获取用户信息
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'nickname', 'task_ban_end_time', 'current_task_id']
      });

      // 获取当前任务信息
      let currentTask = null;
      if (user.current_task_id) {
        currentTask = await Task.findByPk(user.current_task_id, {
          attributes: ['id', 'title', 'description', 'difficulty', 'reward']
        });
      }

      // 计算禁令剩余时间
      let banRemainingTime = null;
      if (user.task_ban_end_time && new Date() < user.task_ban_end_time) {
        banRemainingTime = Math.ceil((user.task_ban_end_time - new Date()) / (1000 * 60)); // 转换为分钟
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname
        },
        currentTask,
        taskBanEndTime: user.task_ban_end_time,
        banRemainingTime,
        isBanned: !!banRemainingTime
      });
    } catch (error) {
      console.error('获取用户任务状态错误:', error);
      res.status(500).json({ message: '获取用户任务状态失败' });
    }
  }
};

module.exports = userTaskController;
