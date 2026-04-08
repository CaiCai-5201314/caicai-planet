const db = require('../models');
const ShortLink = db.ShortLink;

// 生成随机短码
const generateShortCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 生成短链接
exports.generateShortLink = async (req, res) => {
  try {
    const { original_url } = req.body;
    
    if (!original_url) {
      return res.status(400).json({ message: '缺少原始链接' });
    }
    
    // 生成唯一的短码
    let shortCode;
    let isUnique = false;
    
    while (!isUnique) {
      shortCode = generateShortCode();
      const existingLink = await ShortLink.findOne({ where: { short_code: shortCode } });
      if (!existingLink) {
        isUnique = true;
      }
    }
    
    // 创建短链接记录
    const shortLink = await ShortLink.create({
      original_url,
      short_code: shortCode,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天过期
    });
    
    // 构建短链接URL
    const shortUrl = `${req.protocol}://${req.get('host')}/r/${shortCode}`;
    
    res.status(200).json({ 
      success: true,
      short_url: shortUrl,
      short_code: shortCode,
      original_url 
    });
  } catch (error) {
    console.error('生成短链接失败:', error);
    res.status(500).json({ message: '生成短链接失败' });
  }
};

// 重定向短链接
exports.redirectShortLink = async (req, res) => {
  try {
    const { code } = req.params;
    
    const shortLink = await ShortLink.findOne({ where: { short_code: code } });
    
    if (!shortLink) {
      return res.status(404).json({ message: '短链接不存在' });
    }
    
    // 检查是否过期
    if (shortLink.expires_at && new Date() > shortLink.expires_at) {
      return res.status(410).json({ message: '短链接已过期' });
    }
    
    // 增加点击次数
    await shortLink.update({ click_count: shortLink.click_count + 1 });
    
    // 重定向到原始链接
    res.redirect(302, shortLink.original_url);
  } catch (error) {
    console.error('重定向失败:', error);
    res.status(500).json({ message: '重定向失败' });
  }
};