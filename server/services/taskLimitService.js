const { User, UserLevel, ExpLog } = require('../models');
const logger = require('../utils/logger');

/**
 * 根据用户经验值计算用户等级
 * @param {number} exp - 用户经验值
 * @returns {Promise<number>} 用户等级
 */
const calculateUserLevel = async (exp) => {
  try {
    const levels = await UserLevel.findAll({
      order: [['level', 'ASC']]
    });

    let userLevel = 1;
    for (const level of levels) {
      if (exp >= level.required_exp) {
        userLevel = level.level;
      } else {
        break;
      }
    }

    return userLevel;
  } catch (error) {
    logger.error('计算用户等级失败', { error: error.message, exp });
    return 1; // 默认为1级
  }
};

/**
 * 根据用户等级获取每日任务上限
 * 1~4级：5个任务
 * 5~8级：6个任务
 * 9级：8个任务
 * 10级：10个任务
 * @param {number} level - 用户等级
 * @returns {number} 每日任务上限
 */
const getDailyTaskLimit = (level) => {
  if (level >= 10) {
    return 10;
  } else if (level >= 9) {
    return 8;
  } else if (level >= 5) {
    return 6;
  } else {
    return 5; // 1~4级
  }
};

/**
 * 获取用户今日已接取的任务数
 * @param {number} userId - 用户ID
 * @param {Date} date - 日期（默认为今天）
 * @returns {Promise<number>} 今日已接取任务数
 */
const getTodayAcceptedTaskCount = async (userId, date = new Date()) => {
  const { UserDailyTaskAccept } = require('../models');
  
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  
  const count = await UserDailyTaskAccept.count({
    where: {
      user_id: userId,
      date: localDate
    }
  });

  return count;
};

/**
 * 检查用户是否可以接取新任务
 * @param {number} userId - 用户ID
 * @param {number} userExp - 用户经验值
 * @returns {Promise<{canAccept: boolean, limit: number, currentCount: number, level: number}>}
 */
const canAcceptTask = async (userId, userExp) => {
  try {
    const level = await calculateUserLevel(userExp);
    const limit = getDailyTaskLimit(level);
    const currentCount = await getTodayAcceptedTaskCount(userId);

    return {
      canAccept: currentCount < limit,
      limit,
      currentCount,
      level
    };
  } catch (error) {
    logger.error('检查任务接取限制失败', { error: error.message, userId, userExp });
    // 出错时默认允许接取
    return {
      canAccept: true,
      limit: 5,
      currentCount: 0,
      level: 1
    };
  }
};

/**
 * 记录用户接取任务
 * @param {number} userId - 用户ID
 * @param {number} taskId - 任务ID
 * @param {Date} date - 日期（默认为今天）
 * @returns {Promise<void>}
 */
const recordTaskAccept = async (userId, taskId, date = new Date()) => {
  const { UserDailyTaskAccept } = require('../models');
  
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);

  try {
    await UserDailyTaskAccept.create({
      user_id: userId,
      task_id: taskId,
      date: localDate
    });
    logger.info('记录任务接取成功', { userId, taskId, date: localDate });
  } catch (error) {
    // 如果是重复记录的错误，忽略
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.warn('任务接取记录已存在', { userId, taskId, date: localDate });
    } else {
      logger.error('记录任务接取失败', { error: error.message, userId, taskId, date: localDate });
      throw error;
    }
  }
};

module.exports = {
  calculateUserLevel,
  getDailyTaskLimit,
  getTodayAcceptedTaskCount,
  canAcceptTask,
  recordTaskAccept
};
