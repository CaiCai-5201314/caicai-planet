const { User, CheckIn, ExpLog } = require('../models');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { generateCode, saveCode, verifyCode } = require('../utils/verificationCode');
const { verifyCaptcha } = require('../utils/imageCaptcha');
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

      const { username, email, password, nickname, verificationCode, captchaCode, captchaId } = req.body;

      // 验证图像验证码
      if (!captchaId || !captchaCode) {
        return res.status(400).json({ message: '请输入图像验证码' });
      }

      const captchaResult = verifyCaptcha(captchaId, captchaCode);
      if (!captchaResult.valid) {
        return res.status(400).json({ message: captchaResult.message });
      }

      // 验证邮箱验证码
      const codeResult = verifyCode(email, verificationCode, 'register');
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

      // 获取用户的IP地址
      console.log('=== 调试IP地址获取 ===');
      console.log('req.ip:', req.ip);
      console.log('req.connection?.remoteAddress:', req.connection?.remoteAddress);
      console.log('req.socket?.remoteAddress:', req.socket?.remoteAddress);
      console.log('req.headers:', req.headers);
      console.log('req.headers[\'x-forwarded-for\']:', req.headers['x-forwarded-for']);
      
      let registerIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
      if (req.headers['x-forwarded-for']) {
        registerIp = req.headers['x-forwarded-for'].split(',')[0].trim();
      }
      
      console.log('最终获取到的IP地址:', registerIp);
      console.log('=== 调试结束 ===');

      const user = await User.create({
        uid,
        username,
        email,
        password: hashedPassword,
        nickname: `用户${uid}`,
        register_ip: registerIp
      });

      const isAdmin = user.role === 'admin';
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      }, isAdmin);

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

      // 登录赠送10经验值（每天仅赠送一次）
      let expBonusResult = null;
      try {
        // 使用本地时间获取今天的日期，解决时区问题
        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todayStart = new Date(localToday + 'T00:00:00');
        const todayEnd = new Date(localToday + 'T23:59:59');
        
        // 检查今天是否已经赠送过登录经验值
        const existingExpLog = await ExpLog.findOne({
          where: {
            user_id: user.id,
            reason: '每日登录奖励',
            created_at: {
              [Op.gte]: todayStart,
              [Op.lte]: todayEnd
            }
          }
        });

        if (!existingExpLog) {
          // 赠送10经验值
          const expBefore = user.exp || 0;
          const expAfter = expBefore + 10;
          
          // 更新用户经验值
          await user.update({ exp: expAfter });
          
          // 记录经验值日志
          await ExpLog.create({
            user_id: user.id,
            exp_change: 10,
            exp_before: expBefore,
            exp_after: expAfter,
            reason: '每日登录奖励',
            reason_type: 'login'
          });

          expBonusResult = {
            success: true,
            exp_change: 10,
            exp_before: expBefore,
            exp_after: expAfter
          };
        } else {
          expBonusResult = {
            success: false,
            message: '今日已领取登录奖励'
          };
        }
      } catch (expError) {
        logger.error('赠送登录经验值错误', { error: expError.message, userId: user.id });
        expBonusResult = {
          success: false,
          message: '经验值赠送失败'
        };
      }

      const isAdmin = user.role === 'admin';
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      }, isAdmin);

      // 更新用户的当前token，实现单设备登录限制
      console.log('准备更新current_token:', token);
      try {
        await user.update({ current_token: token });
        console.log('更新current_token成功');
        logger.info('更新current_token成功', { username: user.username, userId: user.id });
      } catch (updateError) {
        console.log('更新current_token失败:', updateError.message);
        logger.error('更新current_token失败', { error: updateError.message, userId: user.id });
      }

      logger.info('登录成功', { username: user.username, userId: user.id });

      // 检查并执行自动打卡
      let checkInResult = null;
      try {
        // 使用本地时间获取今天的日期，解决时区问题
        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const existingCheckIn = await CheckIn.findOne({
          where: {
            user_id: user.id,
            check_in_date: localToday
          }
        });

        if (!existingCheckIn) {
          // 获取用户IP和用户代理
          let ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
          if (req.headers['x-forwarded-for']) {
            ipAddress = req.headers['x-forwarded-for'].split(',')[0].trim();
          }
          const userAgent = req.get('user-agent');

<<<<<<< HEAD
          // 获得10点经验值
          const expEarned = 10;
          
=======
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
          // 创建打卡记录
          const checkIn = await CheckIn.create({
            user_id: user.id,
            check_in_date: localToday,
            check_in_time: new Date(),
            status: 'success',
            ip_address: ipAddress,
<<<<<<< HEAD
            user_agent: userAgent,
            exp_earned: expEarned
          });
          
          // 更新用户经验值
          await user.update({ exp: (user.exp || 0) + expEarned });
=======
            user_agent: userAgent
          });
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222

          // 集成月球分规则系统 - 申请/发放月球分
          let moonPointResult = null;
          try {
            const { applyMoonPoints } = require('../services/moonPointService');
            moonPointResult = await applyMoonPoints(user.id, 'check_in', checkIn.id);
          } catch (moonPointError) {
            logger.error('发放月球分失败:', moonPointError);
            // 不影响打卡成功，只是月球分发放失败
          }

          // 不管是否收到过提醒，都显示打卡成功
          await user.update({ last_checkin_reminder: localToday });
          
          checkInResult = {
            success: true,
            checkIn: checkIn.toJSON(),
            moonPoint: moonPointResult
          };
        } else {
          // 不管是否收到过提醒，都显示已经打卡
          await user.update({ last_checkin_reminder: localToday });
          
          checkInResult = {
            success: false,
            message: '今天已经打卡过了'
          };
        }
      } catch (checkInError) {
        logger.error('自动打卡错误', { error: checkInError.message, userId: user.id });
        // 即使打卡失败，也显示错误信息
        // 使用本地时间获取今天的日期
        const today = new Date();
        const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        await user.update({ last_checkin_reminder: localToday });
        
        checkInResult = {
          success: false,
          message: '打卡失败'
        };
      }

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
          bio: user.bio,
          level: user.level,
          exp: user.exp
        },
        checkIn: checkInResult,
        expBonus: expBonusResult
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
      const userId = req.user.id;

      // 如果邮箱变更，需要验证验证码
      if (email && email !== req.user.email) {
        const { verifyCode } = require('../utils/verificationCode');
        const verificationResult = verifyCode(email, verificationCode);
        if (!verificationResult.valid) {
          return res.status(400).json({ message: verificationResult.message });
        }
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
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
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

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
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

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
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

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
      saveCode(email, code, 'forgotPassword');

      // 发送验证码邮件
      const { sendVerificationCode } = require('../config/email');
      await sendVerificationCode(email, code);

      logger.info('验证码已发送', { email, codeLength: code.length, type: 'forgotPassword' });

      res.json({ message: '验证码已发送到您的邮箱' });
    } catch (error) {
      logger.error('发送验证码错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '发送验证码失败' });
    }
  },

  verifyCode: async (req, res) => {
    try {
      const { email, code } = req.body;

      const codeResult = verifyCode(email, code, 'forgotPassword');
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
  },

  // 注销账号
  deleteAccount: async (req, res) => {
    try {
      console.log('注销账号请求接收');
      console.log('请求用户:', req.user);
      
      const userId = req.user.id;
      const userRole = req.user.role;

      console.log('用户ID:', userId);
      console.log('用户角色:', userRole);

      // 禁止管理员注销账号
      if (userRole === 'admin') {
        console.log('管理员账号不能注销');
        return res.status(403).json({ message: '管理员账号不能注销' });
      }

      // 使用User模型来删除用户，而不是使用req.user.destroy()方法
      await User.destroy({ where: { id: userId } });

      logger.info('账号注销成功', { username: req.user.username, userId: userId });

      res.json({ message: '账号注销成功' });
    } catch (error) {
      logger.error('注销账号错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '注销账号失败' });
    }
  }
};

module.exports = authController;
