const { v4: uuidv4 } = require('uuid');
const { FriendLink } = require('../models');

// 生成唯一分享码
const generateShareCode = () => {
  return uuidv4().substring(0, 8);
};

// 生成外链接
exports.generateShareLink = async (req, res) => {
  try {
    console.log('开始生成外链接');
    console.log('请求参数:', req.params);
    console.log('请求体:', req.body);
    
    const { id } = req.params;
    const { password, limit, expiresAt } = req.body;
    
    console.log('友链ID:', id);
    
    // 查找友链
    console.log('开始查找友链');
    const friendLink = await FriendLink.findByPk(id);
    console.log('找到的友链:', friendLink);
    
    if (!friendLink) {
      console.log('友链不存在');
      return res.status(404).json({
        success: false,
        message: '友链不存在'
      });
    }
    
    // 检查友链状态
    console.log('友链状态:', friendLink.status);
    if (friendLink.status !== 'approved') {
      console.log('友链状态不是已通过');
      return res.status(400).json({
        success: false,
        message: '只有已通过审核的友链才能生成外链接'
      });
    }
    
    // 生成分享码
    console.log('生成分享码');
    const shareCode = generateShareCode();
    console.log('分享码:', shareCode);
    
    // 更新友链信息
    console.log('更新友链信息');
    console.log('更新数据:', {
      share_code: shareCode,
      share_password: password,
      share_limit: limit,
      share_expires_at: expiresAt ? new Date(expiresAt) : null,
      share_created_at: new Date()
    });
    
    await friendLink.update({
      share_code: shareCode,
      share_password: password,
      share_limit: limit,
      share_expires_at: expiresAt ? new Date(expiresAt) : null,
      share_created_at: new Date()
    });
    
    // 生成外链接 URL
    console.log('生成外链接 URL');
    const shareUrl = `${req.protocol}://${req.get('host')}/share/friend-link/${shareCode}`;
    // 生成短链接
    const shortUrl = `${req.protocol}://${req.get('host')}/short/${shareCode}`;
    console.log('外链接 URL:', shareUrl);
    console.log('短链接 URL:', shortUrl);
    
    console.log('生成外链接成功');
    res.json({
      success: true,
      data: {
        shareUrl,
        shortUrl,
        shareCode,
        password,
        limit,
        expiresAt
      }
    });
  } catch (error) {
    console.error('生成外链接失败:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '生成外链接失败: ' + error.message
    });
  }
};

// 验证外链接
exports.verifyShareLink = async (req, res) => {
  try {
    const { shareCode, password } = req.body;
    
    // 查找友链
    const friendLink = await FriendLink.findOne({
      where: {
        share_code: shareCode
      }
    });
    
    if (!friendLink) {
      return res.status(404).json({
        success: false,
        message: '外链接不存在'
      });
    }
    
    // 检查友链状态
    if (friendLink.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: '友链已被禁用'
      });
    }
    
    // 检查密码
    if (friendLink.share_password) {
      if (!password || friendLink.share_password !== password) {
        return res.status(401).json({
          success: false,
          message: '密码错误'
        });
      }
    }
    
    // 检查有效期
    if (friendLink.share_expires_at && friendLink.share_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: '外链接已过期'
      });
    }
    
    // 检查点击次数
    if (friendLink.share_limit && friendLink.share_clicks >= friendLink.share_limit) {
      return res.status(400).json({
        success: false,
        message: '外链接已达到点击限制'
      });
    }
    
    res.json({
      success: true,
      data: friendLink
    });
  } catch (error) {
    console.error('验证外链接失败:', error);
    res.status(500).json({
      success: false,
      message: '验证外链接失败'
    });
  }
};

// 处理外链接点击
exports.handleShareLinkClick = async (req, res) => {
  try {
    const { shareCode } = req.params;
    
    // 检查用户登录状态（只有非短链接需要登录）
    const isShortLink = req.path.startsWith('/short/');
    if (!isShortLink && !req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录再访问外链接'
      });
    }
    
    // 查找友链
    const friendLink = await FriendLink.findOne({
      where: {
        share_code: shareCode
      }
    });
    
    if (!friendLink) {
      return res.status(404).json({
        success: false,
        message: '外链接不存在'
      });
    }
    
    // 检查友链状态
    if (friendLink.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: '友链已被禁用'
      });
    }
    
    // 检查有效期
    if (friendLink.share_expires_at && friendLink.share_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: '外链接已过期'
      });
    }
    
    // 检查点击次数
    if (friendLink.share_limit && friendLink.share_clicks >= friendLink.share_limit) {
      return res.status(400).json({
        success: false,
        message: '外链接已达到点击限制'
      });
    }
    
    // 增加点击次数
    await friendLink.update({
      share_clicks: friendLink.share_clicks + 1
    });
    
    // 重定向到目标网站
    res.redirect(friendLink.url);
  } catch (error) {
    console.error('处理外链接点击失败:', error);
    res.status(500).json({
      success: false,
      message: '处理外链接点击失败'
    });
  }
};

// 获取外链接信息
exports.getShareLinkInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找友链
    const friendLink = await FriendLink.findByPk(id);
    if (!friendLink) {
      return res.status(404).json({
        success: false,
        message: '友链不存在'
      });
    }
    
    // 生成外链接 URL 和短链接
    const shareUrl = friendLink.share_code ? `${req.protocol}://${req.get('host')}/share/friend-link/${friendLink.share_code}` : null;
    const shortUrl = friendLink.share_code ? `${req.protocol}://${req.get('host')}/short/${friendLink.share_code}` : null;
    
    res.json({
      success: true,
      data: {
        shareCode: friendLink.share_code,
        sharePassword: friendLink.share_password,
        shareClicks: friendLink.share_clicks,
        shareLimit: friendLink.share_limit,
        shareExpiresAt: friendLink.share_expires_at,
        shareCreatedAt: friendLink.share_created_at,
        shareUrl,
        shortUrl
      }
    });
  } catch (error) {
    console.error('获取外链接信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取外链接信息失败'
    });
  }
};

// 重置外链接
exports.resetShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找友链
    const friendLink = await FriendLink.findByPk(id);
    if (!friendLink) {
      return res.status(404).json({
        success: false,
        message: '友链不存在'
      });
    }
    
    // 重置外链接信息
    await friendLink.update({
      share_code: null,
      share_password: null,
      share_clicks: 0,
      share_limit: null,
      share_expires_at: null,
      share_created_at: null
    });
    
    res.json({
      success: true,
      message: '外链接已重置'
    });
  } catch (error) {
    console.error('重置外链接失败:', error);
    res.status(500).json({
      success: false,
      message: '重置外链接失败'
    });
  }
};