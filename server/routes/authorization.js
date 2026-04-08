const express = require('express');
const router = express.Router();
const authorizationController = require('../controllers/authorizationController');
const { auth, adminOnly } = require('../middleware/auth');

// 授权中心路由
router.use((req, res, next) => {
  console.log('Authorization route - Token:', req.headers.authorization);
  next();
});
router.use(auth);
router.use((req, res, next) => {
  console.log('Authorization route - User:', req.user);
  next();
});
router.use(adminOnly);

// 测试接口
router.get('/test', authorizationController.test);

// 创建子权限账号
router.post('/sub-accounts', authorizationController.createSubAccount);

// 获取子权限账号列表
router.get('/sub-accounts', authorizationController.getSubAccounts);

// 更新子权限账号
router.put('/sub-accounts/:id', authorizationController.updateSubAccount);

// 删除子权限账号
router.delete('/sub-accounts/:id', authorizationController.deleteSubAccount);

// 获取子权限账号操作日志
router.get('/sub-accounts/:id/logs', authorizationController.getSubAccountLogs);

module.exports = router;