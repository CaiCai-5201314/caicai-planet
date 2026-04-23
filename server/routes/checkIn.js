const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// 用户端路由
router.get('/status', auth, checkInController.checkTodayStatus);
router.post('/checkin', auth, checkInController.performCheckIn);
router.get('/my-checkins', auth, checkInController.getUserCheckIns);

// 管理员端路由
router.get('/all', auth, adminMiddleware, checkInController.getAllCheckIns);
router.get('/stats', auth, adminMiddleware, checkInController.getCheckInStats);

module.exports = router;
