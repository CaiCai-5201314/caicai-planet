const express = require('express');
const router = express.Router();
const errorLogController = require('../controllers/errorLogController');
const { auth, adminOnly } = require('../middleware/auth');

// 错误日志管理路由
// 所有路由都需要管理员权限
router.use(auth, adminOnly);

// 获取错误日志列表
router.get('/logs', errorLogController.getErrorLogs);

// 获取错误日志详情
router.get('/logs/:id', errorLogController.getErrorLogById);

// 获取错误统计数据
router.get('/statistics', errorLogController.getErrorStatistics);

// 清除错误日志
router.post('/logs/clear', errorLogController.clearErrorLogs);

// 标记错误为已处理
router.patch('/logs/:id/handled', errorLogController.markErrorAsHandled);

module.exports = router;