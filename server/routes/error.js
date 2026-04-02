'use strict';

const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const { auth, adminOnly } = require('../middleware/auth');

// 公开路由 - 前端上报错误
router.post('/log', errorController.logError);

// 需要认证的路由
router.use(auth);

// 管理员路由
router.use(adminOnly);
router.get('/list', errorController.getErrors);
router.get('/stats', errorController.getErrorStats);
router.get('/:errorId', errorController.getErrorById);
router.delete('/:errorId', errorController.clearError);
router.delete('/clear/all', errorController.clearAllErrors);

module.exports = router;
