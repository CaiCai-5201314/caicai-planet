const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// 用户端接口 - 获取活跃广告（不需要登录）
router.get('/active', advertisementController.getActiveAdvertisements);

// 用户端接口 - 记录点击（不需要登录）
router.post('/:id/click', advertisementController.recordClick);

// 管理员接口
router.use(auth, adminMiddleware);

// 获取广告列表
router.get('/', advertisementController.getAdvertisements);

// 获取单个广告
router.get('/:id', advertisementController.getAdvertisement);

// 创建广告
router.post('/', advertisementController.createAdvertisement);

// 更新广告
router.put('/:id', advertisementController.updateAdvertisement);

// 删除广告
router.delete('/:id', advertisementController.deleteAdvertisement);

module.exports = router;
