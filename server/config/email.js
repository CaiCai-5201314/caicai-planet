require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { recordEmailResult } = require('../utils/emailMonitor');

// 调试：打印邮件配置
logger.info('邮件配置加载:', {
<<<<<<< HEAD
  email163: process.env.EMAIL_163_USER,
=======
  email163: process.env.EMAIL_USER,
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
  emailQQ: process.env.EMAIL_QQ_USER
});

// 创建163邮件发送器
const transporter163 = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.163.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_163_USER || '',
    pass: process.env.EMAIL_163_AUTH_CODE || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 创建QQ邮件发送器
const transporterQQ = nodemailer.createTransport({
  host: process.env.EMAIL_QQ_HOST || 'smtp.qq.com',
  port: parseInt(process.env.EMAIL_QQ_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_QQ_USER || '',
    pass: process.env.EMAIL_QQ_AUTH_CODE || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 验证邮件配置
transporter163.verify((error, success) => {
  if (error) {
    logger.error('163邮件服务配置错误:', { error: error.message });
  } else {
    logger.info('163邮件服务配置成功');
  }
});

transporterQQ.verify((error, success) => {
  if (error) {
    logger.error('QQ邮件服务配置错误:', { error: error.message });
  } else {
    logger.info('QQ邮件服务配置成功');
  }
});

// 发送验证码邮件 (支持故障转移)
const sendVerificationCode = async (email, code) => {
  logger.info('正在发送验证码邮件', { email });

  // 构建邮件选项
  const buildMailOptions = (fromEmail) => ({
    from: `"菜菜星球" <${fromEmail}>`,
    to: email,
    subject: '菜菜星球 - 安全验证',
    // 添加邮件认证头信息
    headers: {
      'X-Mailer': 'Node.js Nodemailer',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'List-Unsubscribe': '<mailto:unsubscribe@caicaiplanet.com>',
      'Reply-To': `"菜菜星球" <${fromEmail}>`
    },
    // 纯文本版本，提高邮件信誉度
    text: `尊敬的用户：

您正在进行账号安全验证，您的验证码是：${code}

验证码有效期为10分钟，请在有效期内完成验证。

如非本人操作，请忽略此邮件。

菜菜星球`,
    // HTML版本
    html: `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>菜菜星球 - 安全验证</title>
        <style>
          body { font-family: Arial, 'Microsoft YaHei', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 30px; }
          .content p { margin: 0 0 15px 0; line-height: 1.6; }
          .code-box { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e9ecef; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { padding: 20px 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
          .footer p { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>菜菜星球</h1>
            <p>安全验证</p>
          </div>
          <div class="content">
            <p>尊敬的用户：</p>
            <p>您正在进行账号安全验证，您的验证码如下：</p>
            <div class="code-box">
              <span class="code">${code}</span>
            </div>
            <p>验证码有效期为 10 分钟，请在有效期内完成验证。</p>
            <p>为了您的账号安全，请勿将验证码透露给他人。</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿直接回复。</p>
            <p>如非本人操作，请忽略此邮件。</p>
            <p>© 2024 菜菜星球 版权所有</p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  // 重试机制函数
  const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn(`邮件发送尝试 ${i + 1} 失败`, { 
          error: error.message,
          nextRetry: i < maxRetries - 1 ? `${initialDelay * Math.pow(2, i)}ms` : '无更多重试'
        });
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  };

  // 首先尝试使用QQ邮箱
  try {
    const qqOptions = buildMailOptions(process.env.EMAIL_QQ_USER || 'caicaijiejie520@qq.com');
    const result = await retryWithBackoff(() => transporterQQ.sendMail(qqOptions));
    logger.info('QQ邮件发送成功', { 
      email, 
      messageId: result.messageId 
    });
    recordEmailResult(email, true, 'qq');
    return result;
  } catch (error) {
    logger.error('QQ邮件发送失败，尝试使用163邮箱', { 
      email, 
      error: error.message 
    });
    
    // 故障转移到163邮箱
    try {
      const email163Options = buildMailOptions(process.env.EMAIL_USER || '');
      const result = await retryWithBackoff(() => transporter163.sendMail(email163Options));
      logger.info('163邮件发送成功', { 
        email, 
        messageId: result.messageId 
      });
      recordEmailResult(email, true, '163');
      return result;
    } catch (error163) {
      logger.error('163邮件发送也失败', { 
        email, 
        error: error163.message 
      });
      recordEmailResult(email, false, null, error163);
      throw new Error(`所有邮件服务器发送失败: ${error163.message}`);
    }
  }
};

// 发送邮件（根据用户设置决定是否发送，验证码和账号封禁除外）
const sendEmailWithSettings = async (userId, mailOptions, type = 'general') => {
  // 重试机制函数
  const retryWithBackoff = async (fn, maxRetries = 2, initialDelay = 1000) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`尝试 ${i + 1} 失败，${i < maxRetries - 1 ? `将在 ${initialDelay * Math.pow(2, i)}ms 后重试` : '已达到最大重试次数'}`);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  };

  // 发送邮件的核心函数，支持故障转移
  const sendEmailWithFailover = async (options) => {
    // 首先尝试使用QQ邮箱
    try {
      const result = await retryWithBackoff(() => transporterQQ.sendMail(options));
      logger.info('QQ邮件发送成功', { 
        to: options.to, 
        messageId: result.messageId 
      });
      recordEmailResult(options.to, true, 'qq');
      return result;
    } catch (error) {
      logger.error('QQ邮件发送失败，尝试使用163邮箱', { 
        to: options.to, 
        error: error.message 
      });
      
      // 故障转移到163邮箱
      try {
        // 更新发件人地址为163邮箱
        const options163 = {
          ...options,
          from: options.from.replace(/<[^>]+>/, `<${process.env.EMAIL_USER || ''}>`)
        };
        const result = await retryWithBackoff(() => transporter163.sendMail(options163));
        logger.info('163邮件发送成功', { 
          to: options.to, 
          messageId: result.messageId 
        });
        recordEmailResult(options.to, true, '163');
        return result;
      } catch (error163) {
        logger.error('163邮件发送也失败', { 
          to: options.to, 
          error: error163.message 
        });
        recordEmailResult(options.to, false, null, error163);
        throw new Error(`所有邮件服务器发送失败: ${error163.message}`);
      }
    }
  };

  // 验证码和账号封禁邮件总是发送
  if (type === 'verification' || type === 'ban') {
    return await sendEmailWithFailover(mailOptions);
  }

  // 其他类型邮件检查用户设置
  try {
    // 延迟导入User模型，避免循环导入
    const { User } = require('../models');
    const user = await User.findByPk(userId);
    if (!user) {
      logger.info('用户不存在，不发送邮件', { userId });
      return null;
    }

    // 检查用户是否开启了邮件通知
    if (!user.email_notifications) {
      logger.info('用户未开启邮件通知，不发送邮件', { userId });
      return null;
    }

    // 根据邮件类型检查具体设置
    if (type === 'comment' && !user.comment_notifications) {
      logger.info('用户未开启评论通知，不发送邮件', { userId });
      return null;
    }

    if (type === 'like' && !user.like_notifications) {
      logger.info('用户未开启点赞通知，不发送邮件', { userId });
      return null;
    }

    if (type === 'system' && !user.system_notifications) {
      logger.info('用户未开启系统通知，不发送邮件', { userId });
      return null;
    }

    // 发送邮件
    return await sendEmailWithFailover(mailOptions);
  } catch (error) {
    logger.error('邮件发送失败', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
};

module.exports = {
  sendVerificationCode,
  sendEmailWithSettings,
  transporter163,
  transporterQQ
};
