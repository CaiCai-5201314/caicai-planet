const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../../middleware/auth');
const errorTypeController = require('../controllers/errorTypeController');

// 应用认证中间件
router.use(auth, adminOnly);

// 错误类型管理路由
router.get('/error-types', errorTypeController.getErrorTypes);
router.get('/error-types/:id', errorTypeController.getErrorTypeById);
router.post('/error-types', errorTypeController.createErrorType);
router.put('/error-types/:id', errorTypeController.updateErrorType);
router.delete('/error-types/:id', errorTypeController.deleteErrorType);
router.get('/error-types/:id/versions', errorTypeController.getErrorTypeVersions);
router.get('/error-type-categories', errorTypeController.getErrorTypeCategories);

module.exports = router;