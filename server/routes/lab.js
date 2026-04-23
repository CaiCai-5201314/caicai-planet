const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// 虚拟活动相关路由
router.get('/events', labController.getEvents);
router.get('/events/:id', labController.getEventById);
router.post('/events', auth, adminMiddleware, labController.createEvent);
router.put('/events/:id', auth, adminMiddleware, labController.updateEvent);
router.delete('/events/:id', auth, adminMiddleware, labController.deleteEvent);
router.post('/events/:id/participate', auth, labController.participateEvent);
router.get('/users/:user_id/events', auth, labController.getUserEvents);

// 成就相关路由
router.get('/achievements', labController.getAchievements);
router.get('/users/:user_id/achievements', auth, labController.getUserAchievements);
router.post('/achievements', auth, adminMiddleware, labController.createAchievement);
router.put('/achievements/:id', auth, adminMiddleware, labController.updateAchievement);
router.delete('/achievements/:id', auth, adminMiddleware, labController.deleteAchievement);

// 用户偏好设置相关路由
router.get('/users/:user_id/preferences', auth, labController.getUserPreferences);
router.put('/users/:user_id/preferences', auth, labController.updateUserPreferences);

// QA相关路由
router.get('/qa', labController.getQa);
router.post('/qa', auth, adminMiddleware, labController.createQa);
router.put('/qa/:id', auth, adminMiddleware, labController.updateQa);
router.delete('/qa/:id', auth, adminMiddleware, labController.deleteQa);

module.exports = router;
