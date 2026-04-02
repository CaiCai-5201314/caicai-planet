const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/:type', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '请上传文件' });
  }

  const { type } = req.params;
  const fileUrl = `/uploads/${type}/${req.file.filename}`;

  res.json({
    message: '上传成功',
    url: fileUrl,
    filename: req.file.filename
  });
});

module.exports = router;
