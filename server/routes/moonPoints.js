const express = require('express');
const router = express.Router();
const moonPointsController = require('../controllers/moonPointsController');
const { auth } = require('../middleware/auth');

console.log('Moon points routes loaded successfully!');

// 测试路由
router.get('/test', (req, res) => {
  res.json({ message: 'Moon points test route works!' });
});

// 用户月球分相关路由
router.get('/users/:user_id', auth, moonPointsController.getUserMoonPoints);
router.get('/users/:user_id/logs', auth, moonPointsController.getUserMoonPointLogs);

// 管理员路由
router.get('/admin/users', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointsController.getAllUsersMoonPoints);

router.get('/admin/logs', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointsController.getAllMoonPointLogs);

router.post('/admin/add', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointsController.addMoonPoints);

router.post('/admin/reduce', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointsController.reduceMoonPoints);

module.exports = router;