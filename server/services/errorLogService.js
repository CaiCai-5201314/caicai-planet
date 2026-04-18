const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const db = require('../models');
const { sequelize, ErrorLog } = db;

// 错误类型的中文说明和故障排除建议
const errorDescriptions = {
  // 数据库错误
  'SequelizeValidationError': {
    description: '数据验证失败，输入的数据不符合验证规则',
    troubleshooting: '检查输入数据是否符合字段要求，如长度、格式、必填项等'
  },
  'SequelizeUniqueConstraintError': {
    description: '数据已存在，违反了唯一性约束',
    troubleshooting: '检查是否重复提交了相同的数据，或使用了已存在的唯一标识'
  },
  'SequelizeForeignKeyConstraintError': {
    description: '关联数据不存在，违反了外键约束',
    troubleshooting: '检查关联的ID是否存在，或是否已被删除'
  },
  
  // 文件上传错误
  'LIMIT_FILE_SIZE': {
    description: '文件大小超过限制',
    troubleshooting: '减小文件大小，确保不超过系统设置的文件大小限制'
  },
  'FileExtensionError': {
    description: '文件类型不支持',
    troubleshooting: '只上传系统支持的文件类型，如图片文件（JPEG, PNG, GIF, WebP）'
  },
  
  // 认证错误
  'UnauthorizedError': {
    description: '未授权访问',
    troubleshooting: '确保已登录并拥有足够的权限'
  },
  'TokenExpiredError': {
    description: '令牌已过期',
    troubleshooting: '重新登录获取新的令牌'
  },
  
  // 网络错误
  'NetworkError': {
    description: '网络连接错误',
    troubleshooting: '检查网络连接是否正常，稍后重试'
  },
  
  // 服务器错误
  'InternalServerError': {
    description: '服务器内部错误',
    troubleshooting: '请联系系统管理员，提供错误发生的时间和操作'
  },
  
  // 其他错误
  'Error': {
    description: '未知错误',
    troubleshooting: '请联系系统管理员，提供错误发生的详细信息'
  }
};

// 分析错误类型和严重程度
const analyzeError = (err) => {
  let type = 'Error';
  let severity = 'error';
  
  if (err.name) {
    type = err.name;
  } else if (err.code) {
    type = err.code;
  }
  
  // 根据错误类型确定严重程度
  if (['SequelizeValidationError', 'SequelizeUniqueConstraintError', 'LIMIT_FILE_SIZE'].includes(type)) {
    severity = 'warning';
  } else if (['SequelizeForeignKeyConstraintError', 'TokenExpiredError'].includes(type)) {
    severity = 'error';
  } else if (['InternalServerError', 'NetworkError'].includes(type)) {
    severity = 'critical';
  }
  
  return { type, severity };
};

// 提取错误位置信息
const extractErrorLocation = (stack) => {
  if (!stack) return null;
  
  const lines = stack.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('at ')) {
      const match = line.match(/at (.+) \((.+):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          file: match[2],
          line: parseInt(match[3]),
          column: parseInt(match[4])
        };
      }
    }
  }
  return null;
};

// 记录错误日志
const logError = async (err, req, res) => {
  try {
    const { type, severity } = analyzeError(err);
    const location = extractErrorLocation(err.stack);
    
    // 获取错误的中文说明和故障排除建议
    const errorInfo = errorDescriptions[type] || errorDescriptions['Error'];
    
    // 构建错误日志数据
    const errorData = {
      error_id: uuidv4(),
      type,
      severity,
      message: err.message || '未知错误',
      stack: err.stack,
      url: req.originalUrl,
      user_agent: req.headers['user-agent'],
      device_info: {
        ip: req.ip,
        method: req.method,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body
      },
      user_id: req.user?.id || null,
      environment: process.env.NODE_ENV || 'development',
      context: {
        location,
        timestamp: new Date().toISOString()
      },
      chinese_description: errorInfo.description,
      troubleshooting: errorInfo.troubleshooting
    };
    
    // 记录到控制台和文件日志
    logger.error('错误日志', errorData);
    
    // 存储到数据库
    await ErrorLog.create(errorData);
    
    return errorData;
  } catch (logError) {
    console.error('记录错误日志失败:', logError);
    return null;
  }
};

// 获取错误统计
const getErrorStats = async () => {
  try {
    const stats = await ErrorLog.findAll({
      attributes: [
        'type',
        'severity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type', 'severity'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });
    
    return stats;
  } catch (error) {
    console.error('获取错误统计失败:', error);
    return [];
  }
};

module.exports = {
  logError,
  getErrorStats,
  errorDescriptions
};