const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendVerificationCode } = require('../config/email');
const { generateCode, saveCode } = require('../utils/verificationCode');
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

    const { email } = req.body;

    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 生成验证码
    const code = generateCode();
    
    // 保存验证码
    saveCode(email, code);

    // 发送邮件
    await sendVerificationCode(email, code);

    res.json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '发送验证码失败，请稍后重试' });
  }
});

module.exports = router;
