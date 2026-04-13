const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'caicai_planet_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const USER_TOKEN_EXPIRES_IN = '4h'; // 用户端4小时过期
const ADMIN_TOKEN_EXPIRES_IN = '365d'; // 管理员365天（近似无限制）

const generateToken = (payload, isAdmin = false) => {
  const expiresIn = isAdmin ? ADMIN_TOKEN_EXPIRES_IN : USER_TOKEN_EXPIRES_IN;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
