// 验证码存储 (生产环境应使用 Redis)
// 使用 email:type 作为键，确保不同类型的验证码互不影响
const verificationCodes = new Map();

// 发送记录存储，用于频率限制
const sendRecords = new Map();

// 生成6位验证码
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 检查发送频率限制
const checkSendFrequency = (email, type = 'register') => {
  const now = Date.now();
  const key = `${email}:${type}`;
  const record = sendRecords.get(key) || {
    attempts: [],
    lastSent: 0
  };

  // 清理过期的发送记录（1小时前的记录）
  record.attempts = record.attempts.filter(timestamp => now - timestamp < 60 * 60 * 1000);

  // 检查限制：每分钟最多1次，每小时最多5次
  const oneMinuteAgo = now - 60 * 1000;

  const recentAttempts = record.attempts.filter(timestamp => timestamp > oneMinuteAgo);
  if (recentAttempts.length > 0) {
    return { allowed: false, message: '发送过于频繁，请1分钟后再试' };
  }

  if (record.attempts.length >= 5) {
    return { allowed: false, message: '发送次数过多，请1小时后再试' };
  }

  // 更新发送记录
  record.attempts.push(now);
  record.lastSent = now;
  sendRecords.set(key, record);

  return { allowed: true };
};

// 保存验证码（支持类型）
const saveCode = (email, code, type = 'register') => {
  const key = `${email}:${type}`;
  verificationCodes.set(key, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10分钟有效期
    type
  });
};

// 验证验证码（支持类型）
const verifyCode = (email, code, type = 'register') => {
  const key = `${email}:${type}`;
  const record = verificationCodes.get(key);
  if (!record) {
    return { valid: false, message: '验证码不存在或已过期' };
  }

  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(key);
    return { valid: false, message: '验证码已过期' };
  }

  if (record.code !== code) {
    return { valid: false, message: '验证码错误' };
  }

  // 验证成功后删除验证码
  verificationCodes.delete(key);
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
  verifyCode,
  checkSendFrequency
};
