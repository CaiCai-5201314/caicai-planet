// 验证码存储 (生产环境应使用 Redis)
const verificationCodes = new Map();

// 生成6位验证码
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 保存验证码
const saveCode = (email, code) => {
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10分钟有效期
  });
};

// 验证验证码
const verifyCode = (email, code) => {
  const record = verificationCodes.get(email);
  if (!record) {
    return { valid: false, message: '验证码不存在或已过期' };
  }
  
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(email);
    return { valid: false, message: '验证码已过期' };
  }
  
  if (record.code !== code) {
    return { valid: false, message: '验证码错误' };
  }
  
  // 验证成功后删除验证码
  verificationCodes.delete(email);
  return { valid: true };
};

// 清理过期验证码
const cleanupCodes = () => {
  const now = Date.now();
  for (const [email, record] of verificationCodes.entries()) {
    if (now > record.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};

// 每5分钟清理一次
setInterval(cleanupCodes, 5 * 60 * 1000);

module.exports = {
  generateCode,
  saveCode,
  verifyCode
};
