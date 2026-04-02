const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { verifyCode } = require('../utils/verificationCode');

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
      console.error('注册错误:', error);
      res.status(500).json({ message: '注册失败' });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username }
          ]
        }
      });

      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ message: '账号已被封禁' });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      await user.update({ last_login: new Date() });

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

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
          bio: user.bio,
          level: user.level
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '登录失败' });
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
      console.error('获取用户信息错误:', error);
      res.status(500).json({ message: '获取用户信息失败' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { nickname, bio, website, github, weibo } = req.body;
      const user = req.user;

      await user.update({
        nickname: nickname || user.nickname,
        bio: bio !== undefined ? bio : user.bio,
        website: website !== undefined ? website : user.website,
        github: github !== undefined ? github : user.github,
        weibo: weibo !== undefined ? weibo : user.weibo
      });

      res.json({
        message: '资料更新成功',
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          bio: user.bio,
          website: user.website,
          github: user.github,
          weibo: user.weibo,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('更新资料错误:', error);
      res.status(500).json({ message: '更新资料失败' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      const isOldPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: '原密码错误' });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      await user.update({ password: hashedNewPassword });

      res.json({ message: '密码修改成功' });
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({ message: '修改密码失败' });
    }
  }
};

module.exports = authController;
