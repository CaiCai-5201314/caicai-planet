const db = require('../models');
const User = db.User;
const MoonPointRule = db.MoonPointRule;
const MoonPointRequest = db.MoonPointRequest;
const MoonPointLog = db.MoonPointLog;
const ExpLevel = db.ExpLevel;
const Op = db.Sequelize.Op;

/**
 * 截断小数点后1位（不进行四舍五入）
 * @param {number} num - 要处理的数字
 * @returns {number} 只保留小数点后1位的数字
 */
const truncateToOneDecimal = (num) => {
  return Math.floor(num * 10) / 10;
};

/**
 * 根据用户等级计算月球分加成
 * @param {number} userId - 用户ID
 * @param {number} basePoints - 基础月球分
 * @returns {Promise<Object>} 包含加成后的总分和加成信息
 */
const calculateLevelBonus = async (userId, basePoints) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.level) {
      return {
        totalPoints: truncateToOneDecimal(basePoints),
        basePoints: truncateToOneDecimal(basePoints),
        bonusPoints: 0,
        bonusPercentage: 0,
        level: null
      };
    }

    const expLevel = await ExpLevel.findOne({
      where: { level: user.level, is_active: 1 }
    });

    if (!expLevel || !expLevel.moon_points_bonus) {
      return {
        totalPoints: truncateToOneDecimal(basePoints),
        basePoints: truncateToOneDecimal(basePoints),
        bonusPoints: 0,
        bonusPercentage: 0,
        level: user.level
      };
    }

    const bonusPercentage = expLevel.moon_points_bonus;
    const bonusPoints = truncateToOneDecimal(basePoints * (bonusPercentage / 100));
    const totalPoints = truncateToOneDecimal(basePoints + bonusPoints);

    return {
      totalPoints,
      basePoints: truncateToOneDecimal(basePoints),
      bonusPoints,
      bonusPercentage,
      level: user.level,
      levelName: expLevel.name
    };
  } catch (error) {
    console.error('[calculateLevelBonus] 计算等级加成失败:', error);
    return {
      totalPoints: truncateToOneDecimal(basePoints),
      basePoints: truncateToOneDecimal(basePoints),
      bonusPoints: 0,
      bonusPercentage: 0,
      level: null
    };
  }
};

/**
 * 申请/发放月球分
 * @param {number} userId - 用户ID
 * @param {string} reasonType - 原因类型 (reason_type)
 * @param {number} relatedId - 相关ID (可选)
 * @param {string} customReason - 自定义原因 (可选)
 * @returns {Promise<Object>} 结果对象
 */
const applyMoonPoints = async (userId, reasonType, relatedId = null, customReason = null) => {
  console.log(`[applyMoonPoints] 开始处理 - 用户ID: ${userId}, 原因类型: ${reasonType}, 相关ID: ${relatedId}`);
  
  try {
    // 获取用户
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('[applyMoonPoints] 用户不存在:', userId);
      throw new Error('用户不存在');
    }

    // 获取规则
    console.log(`[applyMoonPoints] 查找规则: reason_type=${reasonType}`);
    const rule = await MoonPointRule.findOne({
      where: { reason_type: reasonType, is_active: 1 }
    });

    if (!rule) {
      console.error(`[applyMoonPoints] 未找到规则: reason_type=${reasonType}`);
      throw new Error(`未找到原因类型为 ${reasonType} 的规则`);
    }
    console.log(`[applyMoonPoints] 找到规则: ${rule.name}, 积分: ${rule.base_points}, 需要审核: ${rule.need_approval}`);

    // 检查每日限制
    if (rule.daily_limit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 检查MoonPointRequest表中的申请记录
      const requestCount = await MoonPointRequest.count({
        where: {
          user_id: userId,
          reason_type: reasonType,
          created_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });
      
      // 检查MoonPointLog表中的直接发放记录
      const logCount = await MoonPointLog.count({
        where: {
          user_id: userId,
          reason_type: reasonType,
          created_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      });
      
      const todayCount = requestCount + logCount;
      console.log(`[applyMoonPoints] 今日已申请次数: ${todayCount}/${rule.daily_limit} (申请: ${requestCount}, 直接发放: ${logCount})`);

      if (todayCount >= rule.daily_limit) {
        return {
          success: false,
          error: `今日已达到${rule.name}次数上限（${rule.daily_limit}次），请明天再试！`
        };
      }
    }

    // 计算等级加成
    const bonusResult = await calculateLevelBonus(userId, rule.base_points);
    const points = bonusResult.totalPoints;
    const basePoints = bonusResult.basePoints;
    const bonusPoints = bonusResult.bonusPoints;

    // 构建原因说明，包含等级加成信息
      let reason = customReason || rule.name;
      if (bonusPoints > 0) {
        reason = `${reason}（基础${basePoints}分 + ${bonusResult.level || '1'}级加成${bonusPoints}分）`;
      }

    if (!rule.need_approval) {
      console.log(`[applyMoonPoints] 无需审核，直接发放 ${points} 月球分（基础${basePoints}分 + 加成${bonusPoints}分）`);
      // 无需审核，直接发放
      const transaction = await db.sequelize.transaction();

      try {
        // 更新用户月球分（处理DECIMAL类型）
        const currentPoints = parseFloat(user.moon_points) || 0;
        const pointsToAdd = parseFloat(points) || 0;
        const newPoints = currentPoints + pointsToAdd;
        
        await user.update(
          { moon_points: newPoints },
          { transaction }
        );

        // 创建月球分记录
        await MoonPointLog.create({
          user_id: userId,
          points,
          reason,
          reason_type: reasonType,
          related_id: relatedId
        }, { transaction });

        await transaction.commit();
        console.log(`[applyMoonPoints] 直接发放成功`);

        return {
          success: true,
          type: 'direct',
          points,
          basePoints,
          bonusPoints,
          bonusPercentage: bonusResult.bonusPercentage,
          level: bonusResult.level,
          levelName: bonusResult.levelName,
          message: '月球分发放成功'
        };
      } catch (error) {
        await transaction.rollback();
        console.error('[applyMoonPoints] 直接发放失败:', error);
        throw error;
      }
    } else {
      console.log(`[applyMoonPoints] 需要审核，创建申请，申请分数: ${points}（基础${basePoints}分 + 加成${bonusPoints}分）`);
      // 需要审核，创建申请
      const request = await MoonPointRequest.create({
        user_id: userId,
        points,
        reason,
        reason_type: reasonType,
        related_id: relatedId,
        status: 'pending'
      });
      console.log(`[applyMoonPoints] 创建审核申请成功, 申请ID: ${request.id}`);

      return {
        success: true,
        type: 'pending',
        requestId: request.id,
        points,
        basePoints,
        bonusPoints,
        bonusPercentage: bonusResult.bonusPercentage,
        level: bonusResult.level,
        levelName: bonusResult.levelName,
        message: '申请已提交，等待审核'
      };
    }
  } catch (error) {
    console.error('[applyMoonPoints] 申请月球分失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  applyMoonPoints
};
