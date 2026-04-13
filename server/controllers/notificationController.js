const { Notification, User } = require('../models');

const notificationController = {
  // 获取未读通知数量
  getUnreadCount: async (req, res) => {
    try {
      const { id } = req.user;
      
      const count = await Notification.count({
        where: { user_id: id, is_read: false }
      });

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      res.status(500).json({ success: false, message: '获取未读通知数量失败' });
    }
  },

  // 获取用户通知
  getUserNotifications: async (req, res) => {
    try {
      const { id } = req.user;
      
      const notifications = await Notification.findAll({
        where: { user_id: id },
        order: [['created_at', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        notifications
      });
    } catch (error) {
      console.error('获取通知失败:', error);
      res.status(500).json({ success: false, message: '获取通知失败' });
    }
  },

  // 标记通知为已读
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: '通知不存在' });
      }

      if (notification.user_id !== user_id) {
        return res.status(403).json({ success: false, message: '无权操作此通知' });
      }

      await notification.update({ is_read: true });

      res.json({ success: true, message: '通知已标记为已读' });
    } catch (error) {
      console.error('标记通知已读失败:', error);
      res.status(500).json({ success: false, message: '操作失败' });
    }
  },

  // 批量标记通知为已读
  markAllAsRead: async (req, res) => {
    try {
      const { id } = req.user;

      await Notification.update(
        { is_read: true },
        { where: { user_id: id, is_read: false } }
      );

      res.json({ success: true, message: '所有通知已标记为已读' });
    } catch (error) {
      console.error('批量标记通知已读失败:', error);
      res.status(500).json({ success: false, message: '操作失败' });
    }
  },

  // 创建通知（内部使用）
  createNotification: async (userId, type, content, relatedId = null) => {
    try {
      // 验证用户是否存在
      const user = await User.findByPk(userId);
      if (!user) {
        console.error('用户不存在，无法创建通知');
        return false;
      }

      // 根据通知类型检查用户设置
      let shouldCreate = false;
      
      switch (type) {
        case 'comment':
          shouldCreate = user.comment_notifications !== false;
          break;
        case 'like':
          shouldCreate = user.like_notifications !== false;
          break;
        case 'system':
        case 'admin':
          shouldCreate = user.system_notifications !== false;
          break;
        case 'article':
          // 文章相关通知，默认创建
          shouldCreate = true;
          break;
        default:
          shouldCreate = true;
      }

      if (!shouldCreate) {
        console.log(`用户 ${userId} 已关闭 ${type} 类型的通知，跳过创建`);
        return false;
      }

      await Notification.create({
        user_id: userId,
        type,
        content,
        related_id: relatedId
      });

      return true;
    } catch (error) {
      console.error('创建通知失败:', error);
      return false;
    }
  }
};

module.exports = notificationController;