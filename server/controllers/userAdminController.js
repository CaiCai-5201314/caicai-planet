const { User, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');
const { hashPassword } = require('../utils/password');

const userAdminController = {
  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status, role, sortBy, sortOrder, lastLoginFrom, lastLoginTo } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { nickname: { [Op.like]: `%${search}%` } },
          { register_ip: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (role) where.role = role;
      
      // 按最后登录时间筛选
      if (lastLoginFrom) {
        where.last_login = {
          ...where.last_login,
          [Op.gte]: new Date(lastLoginFrom)
        };
      }
      if (lastLoginTo) {
        where.last_login = {
          ...where.last_login,
          [Op.lte]: new Date(lastLoginTo)
        };
      }

      // 排序
      let order = [['created_at', 'DESC']];
      if (sortBy && sortOrder) {
        order = [[sortBy, sortOrder.toUpperCase()]];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({ message: '获取用户列表失败' });
    }
  },

  // 更新用户信息（昵称、邮箱、密码）
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { nickname, email, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (email !== undefined) updateData.email = email;
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await user.update(updateData);

      res.json({
        message: '用户信息更新成功',
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({ message: '更新用户信息失败' });
    }
  },

  // 更新用户头像
  updateUserAvatar: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: '请上传头像文件' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const avatar = `/uploads/avatars/${req.file.filename}`;
      await user.update({ avatar });

      res.json({
        message: '头像更新成功',
        avatar
      });
    } catch (error) {
      console.error('更新用户头像错误:', error);
      res.status(500).json({ message: '更新头像失败' });
    }
  },

  // 封禁/解封用户
  banUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { banned, reason, duration } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ status: banned ? 'banned' : 'active' });

      // 发送封禁邮件
      if (banned && reason && user.email) {
        try {
          const { transporterQQ, sendEmailWithSettings } = require('../config/email');
          const banEndDate = duration === -1 
            ? '永久' 
            : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN');
          
          const mailOptions = {
            from: `"菜菜星球" <${process.env.EMAIL_QQ_USER || 'caicaijiejie520@qq.com'}>`,
            to: user.email,
            subject: '菜菜星球 - 账号封禁通知',
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0;">菜菜星球</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">账号封禁通知</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #333; font-size: 16px;">亲爱的 ${user.nickname || user.username}：</p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 15px;">您的账号因以下原因被封禁：</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <p style="color: #333; font-size: 14px; line-height: 1.6;">${reason}</p>
                  </div>
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">封禁时长：<strong>${duration === -1 ? '永久' : `${duration}天`}</strong></p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">封禁结束时间：<strong>${banEndDate}</strong></p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">如有疑问，请联系管理员。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 10px;">此邮件为系统自动发送，请勿直接回复。</p>
                </div>
              </div>
            `
          };
          
          // 使用 sendEmailWithSettings 函数发送封禁邮件（类型为 'ban'，总是发送）
          await sendEmailWithSettings(user.id, mailOptions, 'ban');
          console.log('封禁邮件已发送');
        } catch (emailError) {
          console.error('发送封禁邮件失败:', emailError);
        }
      }

      // 发送封禁通知
      if (banned && reason) {
        const banEndDate = duration === -1 
          ? '永久' 
          : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN');
        const content = `您的账号因以下原因被封禁：${reason}，封禁时长：${duration === -1 ? '永久' : `${duration}天`}，封禁结束时间：${banEndDate}`;
        await createNotification(user.id, 'admin', content);
      }

      // 发送解封邮件
      if (!banned && user.email) {
        try {
          const { sendEmailWithSettings } = require('../config/email');
          
          const mailOptions = {
            from: `"菜菜星球" <${process.env.EMAIL_QQ_USER || 'caicaijiejie520@qq.com'}>`,
            to: user.email,
            subject: '菜菜星球 - 账号解封通知',
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0;">菜菜星球</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">账号解封通知</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #333; font-size: 16px;">亲爱的 ${user.nickname || user.username}：</p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 15px;">您的账号已被解封，现在可以正常使用菜菜星球的所有功能。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">如有疑问，请联系管理员。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 10px;">此邮件为系统自动发送，请勿直接回复。</p>
                </div>
              </div>
            `
          };
          
          // 使用 sendEmailWithSettings 函数发送解封邮件（类型为 'ban'，总是发送）
          await sendEmailWithSettings(user.id, mailOptions, 'ban');
          console.log('解封邮件已发送');
        } catch (emailError) {
          console.error('发送解封邮件失败:', emailError);
        }
      }

      // 发送解封通知
      if (!banned) {
        const content = '您的账号已被解封，现在可以正常使用菜菜星球的所有功能。';
        await createNotification(user.id, 'admin', content);
      }

      res.json({
        message: banned ? '用户已封禁' : '用户已解封',
        user: {
          id: user.id,
          username: user.username,
          status: user.status
        }
      });
    } catch (error) {
      console.error('封禁用户错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  // 禁言/解除禁言
  muteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { muted } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ is_muted: muted });

      // 发送禁言/解除禁言通知
      const content = muted ? '您的账号已被禁言，无法发送评论' : '您的禁言已解除，可以正常发送评论';
      await createNotification(user.id, 'admin', content);

      res.json({
        message: muted ? '用户已禁言' : '禁言已解除',
        user: {
          id: user.id,
          username: user.username,
          is_muted: user.is_muted
        }
      });
    } catch (error) {
      console.error('禁言用户错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  // 禁止/允许发布
  postBanUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { postBanned } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ is_post_banned: postBanned });

      // 发送禁止/允许发布通知
      const content = postBanned ? '您的账号已被禁止发布文章' : '您的账号已被允许发布文章';
      await createNotification(user.id, 'admin', content);

      res.json({
        message: postBanned ? '已禁止用户发布' : '已允许用户发布',
        user: {
          id: user.id,
          username: user.username,
          is_post_banned: user.is_post_banned
        }
      });
    } catch (error) {
      console.error('禁止发布错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (role) updateData.role = role;

      await user.update(updateData);

      res.json({
        message: '用户状态更新成功',
        user: {
          id: user.id,
          username: user.username,
          status: user.status,
          role: user.role
        }
      });
    } catch (error) {
      console.error('更新用户状态错误:', error);
      res.status(500).json({ message: '更新用户状态失败' });
    }
  },

  // 删除用户
  deleteUser: async (req, res) => {
    console.log('接收到删除用户请求:', req.params);
    try {
      const { id } = req.params;
      console.log('用户ID:', id, '类型:', typeof id);
      
      // 确保id是数字类型
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        console.log('无效的用户ID:', id);
        return res.status(400).json({ message: '无效的用户ID' });
      }

      // 查找用户
      console.log('开始查找用户...');
      const user = await User.findByPk(userId);
      if (!user) {
        console.log('用户不存在:', userId);
        return res.status(404).json({ message: '用户不存在' });
      }
      console.log('找到用户:', user.username, '角色:', user.role);

      // 禁止删除管理员账号
      if (user.role === 'admin') {
        console.log('不能删除管理员账号:', userId);
        return res.status(403).json({ message: '不能删除管理员账号' });
      }

      console.log('开始删除用户:', userId);
      const models = require('../models');
      console.log('模型加载完成');
      console.log('所有模型:', Object.keys(models));
      
      // 先删除与用户相关的所有记录
      console.log('删除用户相关的记录...');
      
      // 尝试删除所有可能的关联记录，使用try-catch处理每个删除操作
      try {
        if (models.Post) {
          await models.Post.destroy({ where: { author_id: userId } });
          console.log('用户帖子删除完成');
        }
      } catch (err) {
        console.error('删除用户帖子时出错:', err);
      }
      
      try {
        if (models.Comment) {
          await models.Comment.destroy({ where: { user_id: userId } });
          console.log('用户评论删除完成');
        }
      } catch (err) {
        console.error('删除用户评论时出错:', err);
      }
      
      try {
        if (models.FriendLink) {
          await models.FriendLink.destroy({ where: { user_id: userId } });
          console.log('用户友链删除完成');
        }
      } catch (err) {
        console.error('删除用户友链时出错:', err);
      }
      
      try {
        if (models.Like) {
          await models.Like.destroy({ where: { user_id: userId } });
          console.log('用户点赞删除完成');
        }
      } catch (err) {
        console.error('删除用户点赞时出错:', err);
      }
      
      try {
        if (models.Favorite) {
          await models.Favorite.destroy({ where: { user_id: userId } });
          console.log('用户收藏删除完成');
        }
      } catch (err) {
        console.error('删除用户收藏时出错:', err);
      }
      
      try {
        if (models.Task) {
          await models.Task.destroy({ where: { createdBy: userId } });
          console.log('用户创建的任务删除完成');
        }
      } catch (err) {
        console.error('删除用户任务时出错:', err);
      }
      
      try {
        if (models.UserTask) {
          await models.UserTask.destroy({ where: { user_id: userId } });
          console.log('用户任务关联删除完成');
        }
      } catch (err) {
        console.error('删除用户任务关联时出错:', err);
      }
      
      try {
        if (models.OperationLog) {
          await models.OperationLog.destroy({ where: { user_id: userId } });
          console.log('用户操作日志删除完成');
        }
      } catch (err) {
        console.error('删除用户操作日志时出错:', err);
      }
      
      try {
        if (models.Notification) {
          await models.Notification.destroy({ where: { user_id: userId } });
          console.log('用户通知删除完成');
        }
      } catch (err) {
        console.error('删除用户通知时出错:', err);
      }
      
      try {
        if (models.AnnouncementRead) {
          await models.AnnouncementRead.destroy({ where: { user_id: userId } });
          console.log('用户公告阅读记录删除完成');
        }
      } catch (err) {
        console.error('删除用户公告阅读记录时出错:', err);
      }
      
      try {
        if (models.CheckIn) {
          await models.CheckIn.destroy({ where: { user_id: userId } });
          console.log('用户打卡记录删除完成');
        }
      } catch (err) {
        console.error('删除用户打卡记录时出错:', err);
      }
      
      try {
        if (models.ExpLog) {
          await models.ExpLog.destroy({ where: { user_id: userId } });
          console.log('用户经验值日志删除完成');
        }
      } catch (err) {
        console.error('删除用户经验值日志时出错:', err);
      }
      
      try {
        if (models.UserLevel) {
          await models.UserLevel.destroy({ where: { user_id: userId } });
          console.log('用户等级记录删除完成');
        }
      } catch (err) {
        console.error('删除用户等级记录时出错:', err);
      }
      
      try {
        if (models.TaskProposal) {
          await models.TaskProposal.destroy({ where: { userId: userId } });
          console.log('用户任务提议删除完成');
        }
      } catch (err) {
        console.error('删除用户任务提议时出错:', err);
      }
      
      try {
        if (models.ErrorLog) {
          await models.ErrorLog.destroy({ where: { user_id: userId } });
          console.log('用户错误日志删除完成');
        }
      } catch (err) {
        console.error('删除用户错误日志时出错:', err);
      }
      
      console.log('用户相关记录删除完成');
      
      // 先清除用户的 moon_center_id，避免外键约束
      if (user.moon_center_id) {
        await user.update({ moon_center_id: null });
        console.log('已清除用户 moon_center_id');
      }
      
      // 清除任何可能引用该用户的 MoonCenter 记录
      try {
        if (models.MoonCenter) {
          await models.MoonCenter.update(
            { manager_id: null },
            { where: { manager_id: userId } }
          );
          console.log('已清除 MoonCenter 中的 manager_id 引用');
        }
      } catch (err) {
        console.error('清除 MoonCenter manager_id 引用时出错:', err);
      }

      // 删除用户本身
      console.log('删除用户本身...');
      await user.destroy();

      console.log('用户删除成功:', userId);
      res.json({ message: '用户删除成功' });
    } catch (error) {
      console.error('删除用户错误:', error);
      console.error('错误堆栈:', error.stack);
      res.status(500).json({ 
        message: '删除用户失败', 
        error: error.message 
      });
    }
  }
};

module.exports = userAdminController;