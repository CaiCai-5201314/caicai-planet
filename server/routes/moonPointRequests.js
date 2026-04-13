const express = require('express');
const router = express.Router();
const moonPointRequestController = require('../controllers/moonPointRequestController');
const { auth } = require('../middleware/auth');

console.log('Moon point request routes loaded successfully!');

// 管理员路由
router.get('/admin/requests', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRequestController.getMoonPointRequests);

router.post('/admin/requests/:id/approve', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRequestController.approveMoonPointRequest);

// 用户路由
router.get('/users/:user_id/requests', auth, moonPointRequestController.getUserMoonPointRequests);

// 创建申请
router.post('/requests', auth, moonPointRequestController.createMoonPointRequest);

module.exports = router;
