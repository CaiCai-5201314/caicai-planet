const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendVerificationCode } = require('../config/email');
const { generateCode, saveCode, checkSendFrequency } = require('../utils/verificationCode');
const { generateCaptcha, verifyCaptcha } = require('../utils/imageCaptcha');
const { User } = require('../models');

// 发送验证码
router.post('/send', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, type = 'register' } = req.body;

    // 注册类型验证码需要检查邮箱是否已被注册
    if (type === 'register') {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }
    }

    // 检查发送频率限制
    const frequencyCheck = checkSendFrequency(email, type);
    if (!frequencyCheck.allowed) {
      return res.status(429).json({ message: frequencyCheck.message });
    }

    // 生成验证码
    const code = generateCode();

    // 保存验证码（带类型）
    saveCode(email, code, type);

    // 发送邮件
    await sendVerificationCode(email, code);

    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '发送验证码失败，请稍后重试' });
  }
});

// 获取图像验证码
router.get('/captcha', async (req, res) => {
  try {
    const captcha = generateCaptcha();
    res.json({ success: true, data: captcha });
  } catch (error) {
    console.error('生成验证码失败:', error);
    res.status(500).json({ success: false, message: '生成验证码失败' });
  }
});

// 验证图像验证码
router.post('/captcha/verify', [
  body('id').notEmpty().withMessage('验证码ID不能为空'),
  body('code').notEmpty().withMessage('验证码不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id, code } = req.body;
    const result = verifyCaptcha(id, code);

    if (result.valid) {
      res.json({ success: true, message: '验证码验证成功' });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('验证验证码失败:', error);
    res.status(500).json({ success: false, message: '验证验证码失败' });
  }
});

module.exports = router;
