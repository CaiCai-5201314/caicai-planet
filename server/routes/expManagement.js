const express = require('express');
const router = express.Router();
const expManagementController = require('../controllers/expManagementController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// 经验值等级管理
router.get('/levels', auth, expManagementController.getAllExpLevels);
router.get('/levels/:id', auth, adminMiddleware, expManagementController.getExpLevel);
router.post('/levels', auth, adminMiddleware, expManagementController.createExpLevel);
router.put('/levels/:id', auth, adminMiddleware, expManagementController.updateExpLevel);
router.delete('/levels/:id', auth, adminMiddleware, expManagementController.deleteExpLevel);

// 经验值记录管理
router.get('/logs', auth, expManagementController.getExpLogs);
router.post('/adjust', auth, adminMiddleware, expManagementController.adjustUserExp);

// 经验值统计
router.get('/stats', auth, adminMiddleware, expManagementController.getExpStats);

module.exports = router;
