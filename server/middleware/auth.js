const jwt = require('jsonwebtoken');
const { User, OperationLog } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'caicai_planet_secret_key_2024';

const auth = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware Called ===');
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    
    // 从Authorization头或cookie中获取token
    let token = req.headers.authorization?.split(' ')[1];
    
    console.log('Authorization token exists:', !!token);
    
    // 如果Authorization头中没有token，尝试从cookie中获取
    if (!token) {
      token = req.cookies?.token;
      console.log('Cookie token exists:', !!token);
    }
    
    if (!token) {
      console.log('No token provided, returning 401');
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('User not found, returning 401');
      return res.status(401).json({ message: '用户不存在' });
    }

    console.log('User found:', user.id, user.username, user.role);

    if (user.status === 'banned') {
      return res.status(403).json({ message: '账号已被封禁' });
    }

    // 检查token是否与用户存储的current_token一致，实现单设备登录限制
    if (user.current_token && user.current_token !== token) {
      return res.status(401).json({ message: '该账户已在其他设备登录，当前登录已挤掉之前的会话' });
    }

    // 将 Sequelize 模型实例转换为普通对象，确保 permissions 是对象类型
    const userData = user.toJSON();
    
    // 确保 permissions 是对象类型（处理 JSON 字段）
    if (typeof userData.permissions === 'string') {
      try {
        userData.permissions = JSON.parse(userData.permissions);
      } catch (e) {
        console.error('解析 permissions 失败:', e);
        userData.permissions = {};
      }
    } else if (!userData.permissions) {
      userData.permissions = {};
    }

    req.user = userData;
    console.log('Auth successful, user:', userData.id, userData.username, userData.role);
    next();
  } catch (error) {
    console.error('=== Auth Error ===');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期' });
    }
    return res.status(401).json({ message: '无效的令牌' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.status !== 'banned') {
        // 将 Sequelize 模型实例转换为普通对象，确保 permissions 是对象类型
        const userData = user.toJSON();
        
        // 确保 permissions 是对象类型（处理 JSON 字段）
        if (typeof userData.permissions === 'string') {
          try {
            userData.permissions = JSON.parse(userData.permissions);
          } catch (e) {
            console.error('解析 permissions 失败:', e);
            userData.permissions = {};
          }
        } else if (!userData.permissions) {
          userData.permissions = {};
        }
        
        req.user = userData;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

const subAdminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'sub_admin' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
};

// 基于权限的访问控制中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    
    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }
    
    // 获取用户权限（req.user 已经是普通对象）
    const userPermissions = req.user.permissions || {};
    
    // 子管理员需要有对应的权限
    if (req.user.role === 'sub_admin' && !userPermissions[permission]) {
      console.log('requirePermission 权限检查失败:', {
        permission,
        userPermissions,
        permissionsType: typeof userPermissions,
        path: req.path
      });
      return res.status(403).json({ message: `权限不足，需要 ${permission} 权限` });
    }
    
    next();
  };
};

// 操作日志中间件
const logOperation = async (req, res, next) => {
  try {
    if (req.user) {
      await OperationLog.create({
        user_id: req.user.id,
        action: req.method,
        resource: req.path,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: {
          params: req.params,
          query: req.query,
          body: req.body
        }
      });
    }
    next();
  } catch (error) {
    console.error('记录操作日志失败:', error);
    next();
  }
};

module.exports = { auth, optionalAuth, adminOnly, subAdminOnly, requirePermission, logOperation };
