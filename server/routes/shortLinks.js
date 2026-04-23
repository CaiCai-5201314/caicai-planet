const express = require('express');
const router = express.Router();
const shortLinkController = require('../controllers/shortLinkController');
const { optionalAuth } = require('../middleware/auth');

// 健康检查
router.get('/health', shortLinkController.healthCheck);

// 生成短链接（可选认证，未登录用户也能生成，但只有登录用户才能获得奖励）
router.post('/generate', optionalAuth, shortLinkController.generateShortLink);

// 重定向短链接（不需要认证）
router.get('/:code', shortLinkController.redirectShortLink);

module.exports = router;