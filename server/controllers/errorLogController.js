const db = require('../models');
const { getErrorStats } = require('../services/errorLogService');
const logger = require('../utils/logger');

const { ErrorLog, User, sequelize, Sequelize } = db;
const { Op } = Sequelize;

// 获取错误日志列表
const getErrorLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, severity, startDate, endDate } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await ErrorLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });
    
    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('获取错误日志列表失败:', error);
    console.error('详细错误信息:', error);
    res.status(500).json({
      success: false,
      message: '获取错误日志列表失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 获取错误日志详情
const getErrorLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const errorLog = await ErrorLog.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });
    
    if (!errorLog) {
      return res.status(404).json({
        success: false,
        message: '错误日志不存在'
      });
    }
    
    res.json({
      success: true,
      data: errorLog
    });
  } catch (error) {
    logger.error('获取错误日志详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取错误日志详情失败',
      error: error.message
    });
  }
};

// 获取错误统计数据
const getErrorStatistics = async (req, res) => {
  try {
    const stats = await getErrorStats();
    
    // 按严重程度统计
    const severityStats = await ErrorLog.findAll({
      attributes: [
        'severity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['severity'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
    
    // 按日期统计
    const dailyStats = await ErrorLog.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
      limit: 7
    });
    
    res.json({
      success: true,
      data: {
        byType: stats,
        bySeverity: severityStats,
        daily: dailyStats
      }
    });
  } catch (error) {
    logger.error('获取错误统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取错误统计数据失败',
      error: error.message
    });
  }
};

// 清除错误日志
const clearErrorLogs = async (req, res) => {
  try {
    const { type, severity, beforeDate } = req.body;
    
    const where = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (beforeDate) {
      where.created_at = {
        [Op.lt]: new Date(beforeDate)
      };
    }
    
    const deletedCount = await ErrorLog.destroy({ where });
    
    logger.info(`清除了 ${deletedCount} 条错误日志`);
    
    res.json({
      success: true,
      message: `成功清除了 ${deletedCount} 条错误日志`
    });
  } catch (error) {
    logger.error('清除错误日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清除错误日志失败',
      error: error.message
    });
  }
};

// 标记错误为已处理
const markErrorAsHandled = async (req, res) => {
  try {
    const { id } = req.params;
    
    const errorLog = await ErrorLog.findByPk(id);
    if (!errorLog) {
      return res.status(404).json({
        success: false,
        message: '错误日志不存在'
      });
    }
    
    await errorLog.update({
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      message: '错误日志已标记为已处理',
      data: errorLog
    });
  } catch (error) {
    logger.error('标记错误日志为已处理失败:', error);
    res.status(500).json({
      success: false,
      message: '标记错误日志为已处理失败',
      error: error.message
    });
  }
};

module.exports = {
  getErrorLogs,
  getErrorLogById,
  getErrorStatistics,
  clearErrorLogs,
  markErrorAsHandled
};