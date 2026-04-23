// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足，需要管理员权限' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = { adminMiddleware };