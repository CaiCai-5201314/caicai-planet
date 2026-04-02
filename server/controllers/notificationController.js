const { Notification, User } = require('../models');

const notificationController = {
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