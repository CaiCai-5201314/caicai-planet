const { createCanvas, registerFont } = require('canvas');
const crypto = require('crypto');

// 验证码存储 (生产环境应使用 Redis)
const captchaStore = new Map();

// 字符集：排除容易混淆的字符
const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// 生成随机字符串
const generateRandomString = (length) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

// 生成图像验证码
const generateCaptcha = () => {
  // 生成随机验证码
  const code = generateRandomString(4);
  
  // 生成唯一ID
  const id = crypto.randomBytes(16).toString('hex');
  
  // 创建画布
  const canvas = createCanvas(120, 40);
  const ctx = canvas.getContext('2d');
  
  // 填充背景
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加干扰线
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.stroke();
  }
  
  // 添加干扰点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制验证码
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  
  // 每个字符单独绘制，增加扭曲效果
  for (let i = 0; i < code.length; i++) {
    const x = (i + 0.5) * (canvas.width / code.length);
    const y = canvas.height / 2 + 8;
    
    // 随机旋转角度
    const rotate = (Math.random() - 0.5) * 0.5;
    
    // 随机颜色
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 50)}, ${Math.floor(Math.random() * 100 + 50)})`;
    
    // 保存当前状态
    ctx.save();
    
    // 平移并旋转
    ctx.translate(x, y);
    ctx.rotate(rotate);
    
    // 绘制字符
    ctx.fillText(code[i], 0, 0);
    
    // 恢复状态
    ctx.restore();
  }
  
  // 转换为Base64
  const image = canvas.toBuffer('image/png').toString('base64');
  
  // 存储验证码，有效期5分钟
  captchaStore.set(id, {
    code: code.toLowerCase(),
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  return {
    id,
    image: `data:image/png;base64,${image}`
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