const db = require('../models');
const User = db.User;
const MoonPointLog = db.MoonPointLog;
const logger = require('../utils/logger');

/**
 * 月球分衰减规则
 * 1个月内：衰减5%
 * 3个月内：衰减8%
 * 6个月内：衰减10%
 * 12个月内：衰减50%
 */
const DECAY_RULES = [
  { months: 1, rate: 0.05, name: '1个月衰减5%' },
  { months: 3, rate: 0.08, name: '3个月衰减8%' },
  { months: 6, rate: 0.10, name: '6个月衰减10%' },
  { months: 12, rate: 0.50, name: '12个月衰减50%' }
];

/**
 * 计算用户应该衰减的月球分
 * @param {number} currentPoints - 当前月球分
 * @param {Date} lastDecayAt - 上一次衰减时间
 * @param {Date} createdAt - 用户注册时间或第一次获得月球分时间
 * @returns {Object} 包含衰减金额和规则信息
 */
const calculateDecay = (currentPoints, lastDecayAt, createdAt) => {
  if (currentPoints <= 0) {
    return { shouldDecay: false };
  }

  const now = new Date();
  const referenceDate = lastDecayAt || createdAt;
  
  // 计算从参考日期到现在的月数
  const monthsPassed = Math.floor(
    (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (monthsPassed <= 0) {
    return { shouldDecay: false };
  }

  // 找到适用的衰减规则
  let applicableRule = null;
  for (const rule of DECAY_RULES) {
    if (monthsPassed >= rule.months) {
      applicableRule = rule;
    }
  }

  if (!applicableRule) {
    return { shouldDecay: false };
  }

  // 计算衰减金额
  const decayAmount = currentPoints * applicableRule.rate;
  
  return {
    shouldDecay: true,
    decayAmount,
    monthsPassed,
    rule: applicableRule
  };
};

/**
 * 执行单个用户的月球分衰减
 * @param {number} userId - 用户ID
 * @returns {Promise<boolean>} 是否衰减成功
 */
const decayUserMoonPoints = async (userId) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const user = await User.findByPk(userId, { transaction });
    
    if (!user || user.moon_points <= 0) {
      await transaction.commit();
      return false;
    }

    const decayResult = calculateDecay(
      user.moon_points,
      user.last_moon_point_decay_at,
      user.created_at
    );

    if (!decayResult.shouldDecay) {
      await transaction.commit();
      return false;
    }

    // 执行衰减
    const newPoints = user.moon_points - decayResult.decayAmount;
    
    await user.update(
      {
        moon_points: newPoints,
        last_moon_point_decay_at: new Date()
      },
      { transaction }
    );

    // 记录衰减日志
    await MoonPointLog.create(
      {
        user_id: userId,
        points: -decayResult.decayAmount,
        reason: `月球分衰减（${decayResult.rule.name}）`,
        reason_type: 'decay'
      },
      { transaction }
    );

    await transaction.commit();
    
    logger.info(`用户 ${user.username} (ID: ${userId}) 月球分衰减成功: -${decayResult.decayAmount.toFixed(1)} 分，规则: ${decayResult.rule.name}`);
    
    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error(`用户 ${userId} 月球分衰减失败`, { error: error.message, stack: error.stack });
    throw error;
  }
};

/**
 * 批量执行所有用户的月球分衰减
 * @returns {Promise<Object>} 衰减统计信息
 */
const decayAllUsersMoonPoints = async () => {
  logger.info('开始执行月球分批量衰减');
  
  try {
    const users = await User.findAll({
      where: {
        moon_points: {
          [db.Sequelize.Op.gt]: 0
        }
      }
    });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const success = await decayUserMoonPoints(user.id);
        if (success) {
          successCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    const result = {
      totalUsers: users.length,
      successCount,
      failCount
    };

    logger.info('月球分批量衰减完成', result);
    return result;
  } catch (error) {
    logger.error('月球分批量衰减失败', { error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = {
  calculateDecay,
  decayUserMoonPoints,
  decayAllUsersMoonPoints
};
