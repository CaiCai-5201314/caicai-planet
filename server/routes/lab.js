const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { auth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// 虚拟活动相关路由
router.get('/events', labController.getEvents);
router.get('/events/:id', labController.getEventById);
router.post('/events', auth, adminOnly, labController.createEvent);
router.put('/events/:id', auth, adminOnly, labController.updateEvent);
router.delete('/events/:id', auth, adminOnly, labController.deleteEvent);
router.post('/events/:id/participate', auth, labController.participateEvent);
router.get('/events/:eventId/participants', auth, adminOnly, labController.getEventParticipants);
router.get('/users/:user_id/events', auth, labController.getUserEvents);

// 成就相关路由
router.get('/achievements', labController.getAchievements);
router.get('/users/:user_id/achievements', auth, labController.getUserAchievements);
router.post('/achievements', auth, adminOnly, labController.createAchievement);
router.put('/achievements/:id', auth, adminOnly, labController.updateAchievement);
router.delete('/achievements/:id', auth, adminOnly, labController.deleteAchievement);

// 用户偏好设置相关路由
router.get('/users/:user_id/preferences', auth, labController.getUserPreferences);
router.put('/users/:user_id/preferences', auth, labController.updateUserPreferences);

// 常见问题相关路由
router.get('/qa', labController.getQa);
router.post('/qa', auth, adminOnly, labController.createQa);
router.put('/qa/:id', auth, adminOnly, labController.updateQa);
router.delete('/qa/:id', auth, adminOnly, labController.deleteQa);

// 实验室设置相关路由
router.get('/settings', labController.getSettings);
router.put('/settings', auth, adminOnly, labController.updateSettings);

// 骰子游戏记录相关路由
router.post('/dice/records', auth, labController.saveDiceRecord);
router.get('/dice/records', auth, adminOnly, labController.getDiceRecords);

module.exports = router;
