const express = require('express');
const router = express.Router();
const shortLinkController = require('../controllers/shortLinkController');

// 生成短链接
router.post('/generate', shortLinkController.generateShortLink);

// 重定向短链接
router.get('/:code', shortLinkController.redirectShortLink);

module.exports = router;