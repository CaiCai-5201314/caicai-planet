require('dotenv').config();
const nodemailer = require('nodemailer');

// 调试：打印邮件配置
console.log('邮件配置加载:');
console.log('163邮箱:', process.env.EMAIL_USER);
console.log('QQ邮箱:', process.env.EMAIL_QQ_USER);

// 创建163邮件发送器
const transporter163 = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.163.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
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
    pass: process.env.EMAIL_QQ_PASS || ''
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 验证邮件配置
transporter163.verify((error, success) => {
  if (error) {
    console.error('163邮件服务配置错误:', error);
  } else {
    console.log('163邮件服务配置成功');
  }
});

transporterQQ.verify((error, success) => {
  if (error) {
    console.error('QQ邮件服务配置错误:', error);
  } else {
    console.log('QQ邮件服务配置成功');
  }
});

// 发送验证码邮件 (使用QQ邮箱)
const sendVerificationCode = async (email, code) => {
  console.log(`正在发送验证码邮件到: ${email}`);

  const mailOptions = {
    from: `"菜菜星球" <${process.env.EMAIL_QQ_USER || 'caicaijiejie520@qq.com'}>`,
    to: email,
    subject: '菜菜星球 - 邮箱验证码',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">菜菜星球</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">邮箱验证码</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 16px;">您好！</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">您正在找回密码。您的验证码是：</p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">如非本人操作，请忽略此邮件。</p>
        </div>
      </div>
    `
  };

  try {
    const result = await transporterQQ.sendMail(mailOptions);
    console.log('QQ邮件发送成功:', result.messageId);
    return result;
  } catch (error) {
    console.error('QQ邮件发送失败:', error);
    throw error;
  }
};

// 发送邮件（根据用户设置决定是否发送，验证码和账号封禁除外）
const sendEmailWithSettings = async (userId, mailOptions, type = 'general') => {
  // 验证码和账号封禁邮件总是发送
  if (type === 'verification' || type === 'ban') {
    try {
      const result = await transporterQQ.sendMail(mailOptions);
      console.log('邮件发送成功:', result.messageId);
      return result;
    } catch (error) {
      console.error('邮件发送失败:', error);
      throw error;
    }
  }

  // 其他类型邮件检查用户设置
  try {
    // 延迟导入User模型，避免循环导入
    const { User } = require('../models');
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('用户不存在，不发送邮件');
      return null;
    }

    // 检查用户是否开启了邮件通知
    if (!user.email_notifications) {
      console.log('用户未开启邮件通知，不发送邮件');
      return null;
    }

    // 根据邮件类型检查具体设置
    if (type === 'comment' && !user.comment_notifications) {
      console.log('用户未开启评论通知，不发送邮件');
      return null;
    }

    if (type === 'like' && !user.like_notifications) {
      console.log('用户未开启点赞通知，不发送邮件');
      return null;
    }

    if (type === 'system' && !user.system_notifications) {
      console.log('用户未开启系统通知，不发送邮件');
      return null;
    }

    // 发送邮件
    const result = await transporterQQ.sendMail(mailOptions);
    console.log('邮件发送成功:', result.messageId);
    return result;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationCode,
  sendEmailWithSettings,
  transporter163,
  transporterQQ
};
