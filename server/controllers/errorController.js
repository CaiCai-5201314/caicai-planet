'use strict';

const { v4: uuidv4 } = require('uuid');
const { ErrorLog, User, Sequelize } = require('../models');
const { Op } = Sequelize;

// 清理URL，移除查询参数和时间戳
function normalizeUrl(url) {
  if (!url) return url;
  try {
    const urlObj = new URL(url, 'http://localhost');
    // 移除查询参数和哈希
    urlObj.search = '';
    urlObj.hash = '';
    return urlObj.toString();
  } catch {
    // 如果URL解析失败，直接返回原始URL
    return url;
  }
}

// 记录错误
const logError = async (req, res) => {
  try {
    const errorData = req.body;
    
    // 生成唯一错误ID
    const errorId = uuidv4();
    
    // 准备错误数据
    const logData = {
      error_id: errorId,
      type: errorData.type || 'unknown',
      severity: errorData.severity || 'error',
      message: errorData.message || 'No error message provided',
      stack: errorData.stack,
      url: errorData.url,
      user_agent: errorData.userAgent || req.headers['user-agent'],
      device_info: errorData.deviceInfo,
      user_id: errorData.userId || req.user?.id,
      environment: errorData.environment || process.env.NODE_ENV || 'development',
      context: errorData.context,
      first_seen: new Date(),
      last_seen: new Date()
    };
    
    // 检查是否存在相同的错误（使用标准化的URL）
    const normalizedUrl = normalizeUrl(logData.url);
    const existingError = await ErrorLog.findOne({
      where: {
        type: logData.type,
        message: logData.message,
        url: {
          [Op.like]: `${normalizedUrl}%` // 模糊匹配
        }
      }
    });
    
    if (existingError) {
      // 更新现有错误
      await existingError.update({
        count: existingError.count + 1,
        last_seen: new Date(),
        stack: logData.stack,
        context: logData.context
      });
      
      return res.status(200).json({
        success: true,
        message: 'Error updated',
        errorId: existingError.error_id
      });
    } else {
      // 创建新错误记录
      const errorLog = await ErrorLog.create(logData);
      
      return res.status(201).json({
        success: true,
        message: 'Error logged',
        errorId: errorLog.error_id
      });
    }
  } catch (error) {
    console.error('Error logging error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log error'
    });
  }
};

// 获取错误列表
const getErrors = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, severity, startDate, endDate, search } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    // 构建查询条件
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (startDate) {
      where.last_seen = {
        [Op.gte]: new Date(startDate)
      };
    }
    if (endDate) {
      where.last_seen = {
        ...where.last_seen,
        [Op.lte]: new Date(endDate)
      };
    }
    if (search) {
      where[Op.or] = [
        { message: { [Op.like]: `%${search}%` } },
        { url: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows } = await ErrorLog.findAndCountAll({
      where,
      order: [['last_seen', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname']
      }]
    });
    
    res.status(200).json({
      success: true,
      data: {
        errors: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting errors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get errors'
    });
  }
};

// 获取错误详情
const getErrorById = async (req, res) => {
  try {
    const { errorId } = req.params;
    
    const error = await ErrorLog.findOne({
      where: { error_id: errorId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname']
      }]
    });
    
    if (!error) {
      return res.status(404).json({
        success: false,
        message: 'Error not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: error
    });
  } catch (error) {
    console.error('Error getting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get error'
    });
  }
};

// 清除错误
const clearError = async (req, res) => {
  try {
    const { errorId } = req.params;
    
    const error = await ErrorLog.findOne({
      where: { error_id: errorId }
    });
    
    if (!error) {
      return res.status(404).json({
        success: false,
        message: 'Error not found'
      });
    }
    
    await error.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Error cleared'
    });
  } catch (error) {
    console.error('Error clearing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear error'
    });
  }
};

// 清除所有错误
const clearAllErrors = async (req, res) => {
  try {
    await ErrorLog.destroy({ where: {} });
    
    res.status(200).json({
      success: true,
      message: 'All errors cleared'
    });
  } catch (error) {
    console.error('Error clearing all errors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear all errors'
    });
  }
};

// 获取错误统计
const getErrorStats = async (req, res) => {
  try {
    // 按类型统计
    const typeStats = await ErrorLog.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('count')), 'total_count']
      ],
      group: ['type'],
      order: [[Sequelize.fn('SUM', Sequelize.col('count')), 'DESC']]
    });
    
    // 按严重性统计
    const severityStats = await ErrorLog.findAll({
      attributes: [
        'severity',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('count')), 'total_count']
      ],
      group: ['severity']
    });
    
    // 最近24小时错误
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const recentErrors = await ErrorLog.count({
      where: {
        last_seen: {
          [Op.gte]: last24Hours
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        typeStats,
        severityStats,
        recentErrors,
        totalErrors: await ErrorLog.count()
      }
    });
  } catch (error) {
    console.error('Error getting error stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get error stats'
    });
  }
};

module.exports = {
  logError,
  getErrors,
  getErrorById,
  clearError,
  clearAllErrors,
  getErrorStats
};
