const logger = require('./logger');

// 邮件发送统计数据
const emailStats = {
  total: 0,
  success: 0,
  failed: 0,
  last24Hours: {
    total: 0,
    success: 0,
    failed: 0,
    timestamp: Date.now()
  },
  byProvider: {
    qq: { total: 0, success: 0, failed: 0 },
    163: { total: 0, success: 0, failed: 0 }
  },
  byRecipient: {}
};

// 清理24小时前的统计数据
const cleanupStats = () => {
  emailStats.last24Hours = {
    total: 0,
    success: 0,
    failed: 0,
    timestamp: Date.now()
  };
  logger.info('已清理24小时前的邮件统计数据');
};

// 每24小时清理一次
setInterval(cleanupStats, 24 * 60 * 60 * 1000);

// 记录邮件发送结果
const recordEmailResult = (email, success, provider, error = null) => {
  // 更新总体统计
  emailStats.total++;
  if (success) {
    emailStats.success++;
  } else {
    emailStats.failed++;
  }

  // 更新24小时统计
  emailStats.last24Hours.total++;
  if (success) {
    emailStats.last24Hours.success++;
  } else {
    emailStats.last24Hours.failed++;
  }

  // 更新服务商统计
  if (provider && emailStats.byProvider[provider]) {
    emailStats.byProvider[provider].total++;
    if (success) {
      emailStats.byProvider[provider].success++;
    } else {
      emailStats.byProvider[provider].failed++;
    }
  }

  // 更新收件人统计
  if (!emailStats.byRecipient[email]) {
    emailStats.byRecipient[email] = { total: 0, success: 0, failed: 0 };
  }
  emailStats.byRecipient[email].total++;
  if (success) {
    emailStats.byRecipient[email].success++;
  } else {
    emailStats.byRecipient[email].failed++;
  }

  // 检查送达率并触发告警
  checkDeliveryRate();

  logger.info('邮件发送结果记录', {
    email,
    success,
    provider,
    error: error ? error.message : null
  });
};

// 检查送达率并触发告警
const checkDeliveryRate = () => {
  const total = emailStats.last24Hours.total;
  if (total < 10) return; // 样本不足，不触发告警

  const successRate = emailStats.last24Hours.success / total;
  const threshold = 0.95; // 95%的送达率阈值

  if (successRate < threshold) {
    const failedRate = emailStats.last24Hours.failed / total;
    logger.error('邮件送达率异常', {
      successRate: (successRate * 100).toFixed(2) + '%',
      failedRate: (failedRate * 100).toFixed(2) + '%',
      total,
      success: emailStats.last24Hours.success,
      failed: emailStats.last24Hours.failed
    });

    // 这里可以添加具体的告警逻辑，如发送通知邮件、短信等
    // sendAlert('邮件送达率异常', `当前送达率: ${(successRate * 100).toFixed(2)}%`);
  }
};

// 获取邮件统计数据
const getEmailStats = () => {
  const totalSuccessRate = emailStats.total > 0 ? emailStats.success / emailStats.total : 0;
  const last24HoursSuccessRate = emailStats.last24Hours.total > 0 ? 
    emailStats.last24Hours.success / emailStats.last24Hours.total : 0;

  return {
    overall: {
      total: emailStats.total,
      success: emailStats.success,
      failed: emailStats.failed,
      successRate: (totalSuccessRate * 100).toFixed(2) + '%'
    },
    last24Hours: {
      total: emailStats.last24Hours.total,
      success: emailStats.last24Hours.success,
      failed: emailStats.last24Hours.failed,
      successRate: (last24HoursSuccessRate * 100).toFixed(2) + '%',
      timestamp: emailStats.last24Hours.timestamp
    },
    byProvider: Object.entries(emailStats.byProvider).map(([provider, stats]) => ({
      provider,
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(2) + '%' : '0%'
    }))
  };
};

module.exports = {
  recordEmailResult,
  getEmailStats
};