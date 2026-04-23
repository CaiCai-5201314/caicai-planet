const express = require('express');
const router = express.Router();
const moonPointRuleController = require('../controllers/moonPointRuleController');
const { auth } = require('../middleware/auth');

console.log('Moon point rules routes loaded successfully!');

// 公开路由
router.get('/', moonPointRuleController.getAllMoonPointRules);
router.get('/:id', moonPointRuleController.getMoonPointRule);

// 用户申请月球分路由
router.post('/apply', moonPointRuleController.applyMoonPoints);

// 管理员路由
router.post('/admin', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRuleController.createMoonPointRule);

router.put('/admin/:id', auth, (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRuleController.updateMoonPointRule);

router.delete('/admin/:id', auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRuleController.deleteMoonPointRule);

router.post('/admin/initialize', auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '权限不足' });
  }
  next();
}, moonPointRuleController.initializeDefaultRules);

module.exports = router;
