const { User, OperationLog, Sequelize } = require('../models');
const { Op } = Sequelize;
const { hashPassword } = require('../utils/password');
const logger = require('../utils/logger');

const authorizationController = {
  // 测试接口
  test: async (req, res) => {
    try {
      console.log('Test endpoint called - User:', req.user);
      res.json({ message: '测试成功', user: req.user });
    } catch (error) {
      console.error('测试接口错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '测试失败' });
    }
  },
  // 创建子权限账号
  createSubAccount: async (req, res) => {
    try {
      const { username, email, password, nickname, permissions } = req.body;
      const parentId = req.user.id;

      // 验证参数
      if (!username || !email || !password) {
        return res.status(400).json({ message: '用户名、邮箱和密码不能为空' });
      }

      // 检查用户名和邮箱是否已存在
      let existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      let subAccount;
      if (existingUser) {
        // 如果用户已存在，检查是否已经是子权限账号
        if (existingUser.is_sub_account && existingUser.parent_account_id !== parentId) {
          return res.status(409).json({ message: '该用户已被其他管理员授权为子权限账号' });
        }
        
        // 更新已存在的用户为子权限账号
        const updateData = {
          role: 'sub_admin',
          is_sub_account: true,
          parent_account_id: parentId,
          permissions: permissions || { taskCenter: true }
        };
        
        // 如果提供了密码，更新密码
        if (password) {
          updateData.password = await hashPassword(password);
        }
        
        // 如果提供了昵称，更新昵称
        if (nickname) {
          updateData.nickname = nickname;
        }
        
        await existingUser.update(updateData);
        subAccount = existingUser;
      } else {
        // 如果用户不存在，创建新的子权限账号
        const hashedPassword = await hashPassword(password);

        // 生成唯一的5位数字UID
        const generateUniqueUid = async () => {
          for (let i = 0; i < 10; i++) { // 最多尝试10次
            const uid = Math.floor(10000 + Math.random() * 90000).toString();
            const existingUid = await User.findOne({ 
              where: { uid },
              attributes: ['id'] // 只查询id字段，提高性能
            });
            if (!existingUid) {
              return uid;
            }
          }
          // 如果10次都失败，使用时间戳的最后5位
          const timestampUid = Date.now().toString().slice(-5);
          return timestampUid;
        };

        const uid = await generateUniqueUid();

        // 创建子账号
        subAccount = await User.create({
          uid,
          username,
          email,
          password: hashedPassword,
          nickname: nickname || username,
          role: 'sub_admin',
          is_sub_account: true,
          parent_account_id: parentId,
          permissions: permissions || { taskCenter: true }
        });
      }

      // 记录操作日志
      await OperationLog.create({
        user_id: parentId,
        action: existingUser ? 'update_sub_account' : 'create_sub_account',
        resource: 'user',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: {
          sub_account_id: subAccount.id,
          username: subAccount.username,
          action: existingUser ? '授权已有用户为子权限账号' : '创建新的子权限账号'
        }
      });

      res.status(201).json({
        message: existingUser ? '子权限账号授权成功' : '子权限账号创建成功',
        subAccount: {
          id: subAccount.id,
          uid: subAccount.uid,
          username: subAccount.username,
          email: subAccount.email,
          nickname: subAccount.nickname,
          role: subAccount.role,
          is_sub_account: subAccount.is_sub_account,
          permissions: subAccount.permissions
        }
      });
    } catch (error) {
      console.error('创建子权限账号错误', error);
      console.error('错误堆栈:', error.stack);
      logger.error('创建子权限账号错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '创建子权限账号失败', error: error.message });
    }
  },

  // 获取子权限账号列表
  getSubAccounts: async (req, res) => {
    try {
      const parentId = req.user.id;

      const subAccounts = await User.findAll({
        where: {
          parent_account_id: parentId,
          is_sub_account: true
        },
        attributes: ['id', 'uid', 'username', 'email', 'nickname', 'role', 'status', 'permissions', 'created_at']
      });

      res.json({
        subAccounts
      });
    } catch (error) {
      logger.error('获取子权限账号列表错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '获取子权限账号列表失败' });
    }
  },

  // 更新子权限账号
  updateSubAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const { nickname, email, password, permissions, status } = req.body;
      const parentId = req.user.id;

      // 查找子账号
      const subAccount = await User.findOne({
        where: {
          id,
          parent_account_id: parentId,
          is_sub_account: true
        }
      });

      if (!subAccount) {
        return res.status(404).json({ message: '子权限账号不存在' });
      }

      // 准备更新数据
      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (email) updateData.email = email;
      if (password) updateData.password = await hashPassword(password);
      if (permissions) updateData.permissions = permissions;
      if (status) updateData.status = status;

      // 更新子账号
      await subAccount.update(updateData);

      // 记录操作日志
      await OperationLog.create({
        user_id: parentId,
        action: 'update_sub_account',
        resource: 'user',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: {
          sub_account_id: subAccount.id,
          username: subAccount.username,
          updated_fields: Object.keys(updateData)
        }
      });

      res.json({
        message: '子权限账号更新成功',
        subAccount: {
          id: subAccount.id,
          uid: subAccount.uid,
          username: subAccount.username,
          email: subAccount.email,
          nickname: subAccount.nickname,
          role: subAccount.role,
          status: subAccount.status,
          permissions: subAccount.permissions
        }
      });
    } catch (error) {
      logger.error('更新子权限账号错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '更新子权限账号失败' });
    }
  },

  // 降级子权限账号为普通用户
  deleteSubAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const parentId = req.user.id;

      // 查找子账号
      const subAccount = await User.findOne({
        where: {
          id,
          parent_account_id: parentId,
          is_sub_account: true
        }
      });

      if (!subAccount) {
        return res.status(404).json({ message: '子权限账号不存在' });
      }

      // 降级为普通用户
      await subAccount.update({
        role: 'user',
        is_sub_account: false,
        parent_account_id: null,
        permissions: {}
      });

      // 记录操作日志
      await OperationLog.create({
        user_id: parentId,
        action: 'downgrade_sub_account',
        resource: 'user',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: {
          sub_account_id: id,
          username: subAccount.username,
          action: '将子权限账号降级为普通用户'
        }
      });

      res.json({ message: '子权限账号已降级为普通用户' });
    } catch (error) {
      logger.error('降级子权限账号错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '降级子权限账号失败' });
    }
  },

  // 获取子权限账号操作日志
  getSubAccountLogs: async (req, res) => {
    try {
      const { id } = req.params;
      const parentId = req.user.id;

      // 验证子账号归属
      const subAccount = await User.findOne({
        where: {
          id,
          parent_account_id: parentId,
          is_sub_account: true
        }
      });

      if (!subAccount) {
        return res.status(404).json({ message: '子权限账号不存在' });
      }

      // 获取操作日志
      const logs = await OperationLog.findAll({
        where: {
          user_id: id
        },
        order: [['created_at', 'DESC']],
        limit: 100
      });

      res.json({
        logs
      });
    } catch (error) {
      logger.error('获取子权限账号操作日志错误', { error: error.message, stack: error.stack });
      res.status(500).json({ message: '获取操作日志失败' });
    }
  }
};

module.exports = authorizationController;