const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { auth, optionalAuth, requirePermission } = require('../middleware/auth');

// 管理员路由
router.post('/admin/announcements', auth, requirePermission('announcementManagement'), announcementController.createAnnouncement);
router.get('/admin/announcements', auth, requirePermission('announcementManagement'), announcementController.getAnnouncements);
router.get('/admin/announcements/:id', auth, requirePermission('announcementManagement'), announcementController.getAnnouncement);
router.put('/admin/announcements/:id', auth, requirePermission('announcementManagement'), announcementController.updateAnnouncement);
router.delete('/admin/announcements/:id', auth, requirePermission('announcementManagement'), announcementController.deleteAnnouncement);

// 前端路由 - 使用optionalAuth中间件，允许未登录用户访问但会获取登录用户信息
router.get('/announcements', optionalAuth, announcementController.getActiveAnnouncements);

// 标记公告为已读（需要认证）
router.post('/announcements/mark-read', auth, announcementController.markAsRead);

module.exports = router;