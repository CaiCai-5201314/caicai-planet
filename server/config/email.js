const nodemailer = require('nodemailer');

// 创建邮件发送器 (网易163配置)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.163.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // 使用SSL
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '' // 网易邮箱使用授权码
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 验证邮件配置
transporter.verify((error, success) => {
  if (error) {
    console.error('邮件服务配置错误:', error);
  } else {
    console.log('邮件服务配置成功，可以发送邮件');
  }
});

// 发送验证码邮件
const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: `"菜菜星球" <${process.env.EMAIL_USER || 'caicaifensi520@163.com'}>`,
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
          <p style="color: #666; font-size: 14px; line-height: 1.6;">感谢您注册菜菜星球。您的验证码是：</p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">如非本人操作，请忽略此邮件。</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationCode,
  transporter
};
