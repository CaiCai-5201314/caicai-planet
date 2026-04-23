const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// 获取未读通知数量
router.get('/unread-count', auth, notificationController.getUnreadCount);

// 获取用户通知
router.get('/', auth, notificationController.getUserNotifications);

// 标记通知为已读
router.put('/:id/read', auth, notificationController.markAsRead);

// 批量标记通知为已读
router.put('/read-all', auth, notificationController.markAllAsRead);

module.exports = router;