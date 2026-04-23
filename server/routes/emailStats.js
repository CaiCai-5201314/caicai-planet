const express = require('express');
const router = express.Router();
const { getEmailStats } = require('../utils/emailMonitor');
const logger = require('../utils/logger');

// 获取邮件发送统计数据
router.get('/stats', async (req, res) => {
  try {
    const stats = getEmailStats();
    logger.info('获取邮件统计数据', { stats });
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取邮件统计数据失败', { error: error.message });
    res.status(500).json({
      success: false,
      message: '获取邮件统计数据失败'
    });
  }
});

module.exports = router;