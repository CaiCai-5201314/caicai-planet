'use strict';

const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const { auth, requirePermission } = require('../middleware/auth');

// 公开路由 - 前端上报错误
router.post('/log', errorController.logError);

// 需要认证的路由
router.use(auth);

// 错误管理路由 - 需要 errorManagement 权限
router.get('/list', requirePermission('errorManagement'), errorController.getErrors);
router.get('/stats', requirePermission('errorManagement'), errorController.getErrorStats);
router.get('/:errorId', requirePermission('errorManagement'), errorController.getErrorById);
router.delete('/:errorId', requirePermission('errorManagement'), errorController.clearError);
router.delete('/clear/all', requirePermission('errorManagement'), errorController.clearAllErrors);

module.exports = router;
