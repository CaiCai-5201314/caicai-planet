const { User } = require('../models');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { generateCode, saveCode, verifyCode } = require('../utils/verificationCode');
const logger = require('../utils/logger');

// 生成唯一的5位数字UID
const generateUniqueUid = async () => {
  let uid;
  let exists = true;
  
  while (exists) {
    uid = Math.floor(10000 + Math.random() * 90000).toString();
    const existingUser = await User.findOne({ where: { uid } });
    exists = !!existingUser;
  }
  
  return uid;
};

const authController = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { username, email, password, nickname, verificationCode } = req.body;

      // 验证验证码
      const codeResult = verifyCode(email, verificationCode);
      if (!codeResult.valid) {
        return res.status(400).json({ message: codeResult.message });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          message: '用户名或邮箱已存在'
        });
      }

      const hashedPassword = await hashPassword(password);
      
      // 生成唯一的5位数字UID
      const uid = await generateUniqueUid();

      const user = await User.create({
        uid,
        username,
        email,
        password: hashedPassword,
        nickname: nickname || username
      });

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: user.id,
          uid: user.uid,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('注册错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '注册失败' });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('登录验证失败', { errors: errors.array() });
        return res.status(400).json({
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;
      
      if (!username || !password) {
        logger.warn('登录参数缺失', { username: !!username, password: !!password });
        return res.status(400).json({ message: '用户名和密码不能为空' });
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username }
          ]
        }
      });

      if (!user) {
        logger.warn('登录失败：用户不存在', { username });
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      if (user.status === 'banned') {
        logger.warn('登录失败：账号被封禁', { username: user.username });
        return res.status(403).json({ message: '账号已被封禁' });
      }

      if (user.status === 'inactive') {
        logger.warn('登录失败：账号未激活', { username: user.username });
        return res.status(403).json({ message: '账号未激活，请联系管理员处理' });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        logger.warn('登录失败：密码错误', { username: user.username });
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      await user.update({ last_login: new Date() });

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      logger.info('登录成功', { username: user.username, userId: user.id });

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          uid: user.uid,
          username: user.username,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
          bio: user.bio,
          level: user.level
        }
      });
    } catch (error) {
      logger.error('登录错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '登录失败', error: error.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            association: 'posts',
            attributes: ['id', 'title', 'status', 'created_at'],
            limit: 5,
            order: [['created_at', 'DESC']]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({ user });
    } catch (error) {
      logger.error('获取用户信息错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '获取用户信息失败' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { nickname, email, verificationCode, bio, website, github, weibo, cover_style } = req.body;
      const user = req.user;

      // 如果邮箱变更，需要验证验证码
      if (email && email !== user.email) {
        const { verifyCode } = require('../utils/verificationCode');
        const verificationResult = verifyCode(email, verificationCode);
        if (!verificationResult.valid) {
          return res.status(400).json({ message: verificationResult.message });
        }
      }

      await user.update({
        nickname: nickname || user.nickname,
        email: email !== undefined ? email : user.email,
        bio: bio !== undefined ? bio : user.bio,
        website: website !== undefined ? website : user.website,
        github: github !== undefined ? github : user.github,
        weibo: weibo !== undefined ? weibo : user.weibo,
        cover_style: cover_style !== undefined ? cover_style : user.cover_style
      });

      res.json({
        message: '资料更新成功',
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          bio: user.bio,
          website: user.website,
          github: user.github,
          weibo: user.weibo,
          avatar: user.avatar,
          cover_image: user.cover_image,
          cover_style: user.cover_style
        }
      });
    } catch (error) {
      logger.error('更新资料错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '更新资料失败' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = req.user;

      // 验证旧密码
      const isPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: '原密码错误' });
      }

      // 更新密码
      const hashedPassword = await hashPassword(newPassword);
      await user.update({ password: hashedPassword });

      res.json({ message: '密码修改成功' });
    } catch (error) {
      logger.error('修改密码错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '修改密码失败' });
    }
  },

  // 更新用户名
  updateUsername: async (req, res) => {
    try {
      const { username } = req.body;
      const user = req.user;

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 检查是否在7天内修改过用户名
      if (user.last_username_change && (Date.now() - user.last_username_change.getTime()) < 7 * 24 * 60 * 60 * 1000) {
        return res.status(400).json({ message: '用户名7天只能修改一次' });
      }

      // 更新用户名
      try {
        await user.update({
          username,
          last_username_change: new Date()
        });
      } catch (error) {
        // 如果数据库中没有last_username_change字段，只更新username
        await user.update({ username });
      }

      res.json({ message: '用户名修改成功' });
    } catch (error) {
      logger.error('修改用户名错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '修改用户名失败' });
    }
  },

  // 更新邮箱
  updateEmail: async (req, res) => {
    try {
      const { email, verificationCode } = req.body;
      const user = req.user;

      // 验证验证码
      const { verifyCode } = require('../utils/verificationCode');
      const verificationResult = verifyCode(email, verificationCode);
      if (!verificationResult.valid) {
        return res.status(400).json({ message: verificationResult.message });
      }

      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: '邮箱已存在' });
      }

      // 更新邮箱
      await user.update({ email });

      res.json({ message: '邮箱修改成功' });
    } catch (error) {
      logger.error('修改邮箱错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '修改邮箱失败' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      // 生成验证码
      const code = generateCode();
      saveCode(email, code);

      // 发送验证码邮件
      const { sendVerificationCode } = require('../config/email');
      await sendVerificationCode(email, code);

      logger.info('验证码已发送', { email, codeLength: code.length });

      res.json({ message: '验证码已发送到您的邮箱' });
    } catch (error) {
      logger.error('发送验证码错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '发送验证码失败' });
    }
  },

  verifyCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      const codeResult = verifyCode(email, code);
      if (!codeResult.valid) {
        return res.status(400).json({ message: codeResult.message });
      }

      // 生成重置密码的token
      const token = generateToken({ email }, '1h');

      res.json({ message: '验证码验证成功', token });
    } catch (error) {
      logger.error('验证验证码错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '验证验证码失败' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // 验证token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'token无效或已过期' });
      }

      const user = await User.findOne({ where: { email: decoded.email } });
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      await user.update({ password: hashedNewPassword });

      res.json({ message: '密码重置成功' });
    } catch (error) {
      logger.error('重置密码错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '重置密码失败' });
    }
  }
};

module.exports = authController;
