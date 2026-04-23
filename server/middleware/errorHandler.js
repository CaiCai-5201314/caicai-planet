const { logError } = require('../services/errorLogService');
const errorHandler = async (err, req, res, next) => {
  // 记录错误日志
  await logError(err, req, res);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: '数据验证失败',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      })),
      description: '输入的数据不符合验证规则，请检查输入是否符合字段要求',
      troubleshooting: '检查输入数据是否符合字段要求，如长度、格式、必填项等'
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: '数据已存在',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      })),
      description: '违反了唯一性约束，数据已存在',
      troubleshooting: '检查是否重复提交了相同的数据，或使用了已存在的唯一标识'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: '关联数据不存在',
      description: '违反了外键约束，关联的记录不存在',
      troubleshooting: '检查关联的ID是否存在，或是否已被删除'
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: '文件大小超过限制',
      description: '上传的文件大小超过了系统设置的限制',
      troubleshooting: '减小文件大小，确保不超过系统设置的文件大小限制'
    });
  }

  if (err.message === '只允许上传图片文件 (JPEG, PNG, GIF, WebP)') {
    return res.status(400).json({
      message: err.message,
      description: '文件类型不支持，只允许上传图片文件',
      troubleshooting: '只上传系统支持的文件类型，如图片文件（JPEG, PNG, GIF, WebP）'
    });
  }

  // 其他错误
  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
    description: '服务器内部错误，请联系系统管理员',
    troubleshooting: '请联系系统管理员，提供错误发生的时间和操作',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
