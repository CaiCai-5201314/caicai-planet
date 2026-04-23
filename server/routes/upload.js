const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const storageService = require('../services/storageService');

router.post('/:type', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传文件' });
    }

    const { type } = req.params;
    const fileUrl = await storageService.upload(req.file, type);

    console.log(`[${process.env.NODE_ENV || 'development'}] 文件上传成功:`, {
      type,
      url: fileUrl,
      storageType: storageService.type
    });

    res.json({
      message: '上传成功',
      url: fileUrl,
      filename: req.file.originalname,
      storageType: storageService.type
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ message: '上传失败', error: error.message });
  }
});

module.exports = router;
