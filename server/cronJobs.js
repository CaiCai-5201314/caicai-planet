const cron = require('node-cron');
const { User, CheckIn, ExpLog } = require('./models');
const logger = require('./utils/logger');
const { decayAllUsersMoonPoints } = require('./services/moonPointDecayService');

// 定时自动刷新功能
const setupCronJobs = () => {
  // 每日12点10分执行自动刷新操作
  cron.schedule('10 12 * * *', async () => {
    logger.info('开始执行每日自动刷新操作');
    
    try {
      // 1. 重置所有用户的每日登录奖励状态
      // 这里不需要手动重置，因为登录奖励是基于日期判断的
      
      // 2. 重置所有用户的每日打卡状态
      // 同样，打卡状态也是基于日期判断的
      
      // 3. 其他需要每日刷新的操作
      // 例如：清理过期的验证码、更新统计数据等
      
      logger.info('每日自动刷新操作执行完成');
    } catch (error) {
      logger.error('每日自动刷新操作执行失败', { error: error.message, stack: error.stack });
    }
  });
  
  // 每日凌晨2点执行月球分衰减
  cron.schedule('0 2 * * *', async () => {
    logger.info('开始执行月球分衰减任务');
    
    try {
      const result = await decayAllUsersMoonPoints();
      logger.info('月球分衰减任务执行完成', result);
    } catch (error) {
      logger.error('月球分衰减任务执行失败', { error: error.message, stack: error.stack });
    }
  });
  
  logger.info('定时任务已设置：');
  logger.info('  - 每日12点10分执行系统自动刷新操作');
  logger.info('  - 每日凌晨2点执行月球分衰减');
};

module.exports = setupCronJobs;