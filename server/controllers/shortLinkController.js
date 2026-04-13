const db = require('../models');
const ShortLink = db.ShortLink;
const ExpLog = db.ExpLog;
const MoonPointLog = db.MoonPointLog;
const User = db.User;
const { Op } = require('sequelize');

// 导入月球分服务
const { applyMoonPoints } = require('../services/moonPointService');

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
    console.log('=== 开始处理生成短链接请求 ===');
    console.log('请求方法:', req.method);
    console.log('请求路径:', req.path);
    console.log('收到分享请求:', req.body);
    console.log('请求头:', req.headers);
    console.log('用户信息:', req.user);
    console.log('=== 请求信息打印完毕 ===');
    
    const { original_url } = req.body;
    
    if (!original_url) {
      console.error('缺少原始链接');
      return res.status(400).json({ message: '缺少原始链接' });
    }
    
    try {
      // 生成唯一的短码
      let shortCode;
      let isUnique = false;
      
      while (!isUnique) {
        shortCode = generateShortCode();
        console.log('生成短码:', shortCode);
        const existingLink = await ShortLink.findOne({ where: { short_code: shortCode } });
        console.log('检查短码是否存在:', existingLink ? '存在' : '不存在');
        if (!existingLink) {
          isUnique = true;
        }
      }
      
      // 创建短链接记录
      console.log('准备创建短链接记录');
      const shortLink = await ShortLink.create({
        original_url,
        short_code: shortCode,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天过期
      });
      console.log('短链接记录创建成功:', shortLink.id);
      
      // 构建短链接URL
      const shortUrl = `${req.protocol}://${req.get('host')}/r/${shortCode}`;
      console.log('短链接URL:', shortUrl);
      
      // 分享奖励逻辑
      let rewardResult = null;
      if (req.user) {
        console.log('用户信息:', req.user);
        // 获取今天的日期范围
        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayStart = new Date(localToday + 'T00:00:00');
        const todayEnd = new Date(localToday + 'T23:59:59');
        console.log('今天的日期范围:', todayStart, '到', todayEnd);
        
        // 检查今天是否已经领取过分享奖励
        console.log('检查今天是否已经领取过分享奖励');
        const existingExpLog = await ExpLog.findOne({
          where: {
            user_id: req.user.id,
            reason: '分享奖励',
            created_at: {
              [Op.gte]: todayStart,
              [Op.lte]: todayEnd
            }
          }
        });
        
        const existingMoonPointLog = await MoonPointLog.findOne({
          where: {
            user_id: req.user.id,
            reason_type: 'share_post',
            created_at: {
              [Op.gte]: todayStart,
              [Op.lte]: todayEnd
            }
          }
        });
        
        console.log('经验值奖励记录:', existingExpLog ? '存在' : '不存在');
        console.log('月球分奖励记录:', existingMoonPointLog ? '存在' : '不存在');
        
        const hasReceivedReward = existingExpLog || existingMoonPointLog;
        
        if (!hasReceivedReward) {
          // 发放10点经验值
          const expBefore = req.user.exp || 0;
          const expAfter = expBefore + 10;
          console.log('经验值更新:', expBefore, '->', expAfter);
          
          // 更新用户经验值
          console.log('更新用户经验值:', { userId: req.user.id, expBefore, expAfter });
          try {
            await User.update({ exp: expAfter }, { where: { id: req.user.id } });
            console.log('用户经验值更新成功');
          } catch (updateError) {
            console.error('更新用户经验值失败:', updateError);
            // 继续执行，不影响短链接生成
          }
          
          // 记录经验值日志
          console.log('记录经验值日志');
          try {
            await ExpLog.create({
              user_id: req.user.id,
              exp_change: 10,
              exp_before: expBefore,
              exp_after: expAfter,
              reason: '分享奖励',
              reason_type: 'share'
            });
            console.log('经验值日志记录成功');
          } catch (logError) {
            console.error('记录经验值日志失败:', logError);
            // 继续执行，不影响短链接生成
          }
          
          // 发放5点月球分（无需审核，自动发放）
          try {
            console.log('发放月球分');
            await applyMoonPoints(req.user.id, 'share_post', shortLink.id);
            console.log('月球分发放成功');
          } catch (moonPointError) {
            console.error('发放月球分失败:', moonPointError);
            // 不影响短链接生成
          }
          
          rewardResult = {
            success: true,
            exp_change: 10,
            message: '分享成功，获得10点经验值和5点月球分'
          };
        } else {
          rewardResult = {
            success: false,
            message: '今日已领取分享奖励'
          };
        }
      }
      
      console.log('生成短链接成功:', { shortUrl, shortCode, original_url, rewardResult });
      res.status(200).json({ 
        success: true,
        short_url: shortUrl,
        short_code: shortCode,
        original_url,
        reward: rewardResult
      });
    } catch (innerError) {
      console.error('生成短链接过程中出错:', innerError);
      console.error('错误堆栈:', innerError.stack);
      res.status(500).json({ message: '生成短链接失败' });
    }
  } catch (error) {
    console.error('生成短链接失败:', error);
    console.error('错误堆栈:', error.stack);
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

// 健康检查
exports.healthCheck = async (req, res) => {
  try {
    console.log('收到健康检查请求');
    res.status(200).json({ status: 'ok', message: '短链接服务运行正常' });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({ status: 'error', message: '短链接服务运行异常' });
  }
};