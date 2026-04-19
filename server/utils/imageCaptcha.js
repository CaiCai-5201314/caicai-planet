const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');

// 验证码存储 (生产环境应使用 Redis)
const captchaStore = new Map();

// 生成图像验证码
const generateCaptcha = () => {
  // 生成唯一ID
  const id = crypto.randomBytes(16).toString('hex');

  // 使用svg-captcha生成验证码
  const captcha = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1iIlL',
    noise: 3,
    color: true,
    background: '#f5f5f5',
    width: 120,
    height: 40,
    fontSize: 40
  });

  const code = captcha.text.toLowerCase();

  // 存储验证码，有效期5分钟
  captchaStore.set(id, {
    code: code,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  // 返回SVG格式的验证码
  return {
    id,
    image: captcha.data
  };
};

// 验证验证码
const verifyCaptcha = (id, code) => {
  const record = captchaStore.get(id);

  if (!record) {
    return { valid: false, message: '验证码不存在或已过期' };
  }

  if (Date.now() > record.expiresAt) {
    captchaStore.delete(id);
    return { valid: false, message: '验证码已过期' };
  }

  if (record.code !== code.toLowerCase()) {
    return { valid: false, message: '验证码错误' };
  }

  // 验证成功后删除验证码
  captchaStore.delete(id);
  return { valid: true };
};

// 清理过期验证码
const cleanupCaptchas = () => {
  const now = Date.now();
  for (const [id, record] of captchaStore.entries()) {
    if (now > record.expiresAt) {
      captchaStore.delete(id);
    }
  }
};

// 每5分钟清理一次
setInterval(cleanupCaptchas, 5 * 60 * 1000);

module.exports = {
  generateCaptcha,
  verifyCaptcha
};