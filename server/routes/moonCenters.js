const express = require('express');
const router = express.Router();
const moonCenterController = require('../controllers/moonCenterController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// 管理员端路由
router.get('/', auth, adminMiddleware, moonCenterController.getAllMoonCenters);
router.get('/stats', auth, adminMiddleware, moonCenterController.getMoonCenterStats);
router.get('/:id', auth, adminMiddleware, moonCenterController.getMoonCenter);
router.post('/', auth, adminMiddleware, moonCenterController.createMoonCenter);
router.put('/:id', auth, adminMiddleware, moonCenterController.updateMoonCenter);
router.delete('/:id', auth, adminMiddleware, moonCenterController.deleteMoonCenter);

module.exports = router;
