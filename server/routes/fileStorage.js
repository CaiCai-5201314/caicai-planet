const express = require('express');
const router = express.Router();
const fileStorageController = require('../controllers/fileStorageController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storageConfig = require('../config/storage');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log('创建目录:', dirPath);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(storageConfig.localStoragePath);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDirectoryExists(storageConfig.localStoragePath);
    cb(null, storageConfig.localStoragePath);
  },
  filename: function (req, file, cb) {
    cb(null, `temp-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: storageConfig.maxFileSize },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型，只支持PDF、PNG、JPG格式'));
    }
  }
});

const handleUploadError = (err, req, res, next) => {
  console.error('文件上传错误:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: '文件大小超过限制' });
    }
    return res.status(400).json({ success: false, message: '文件上传失败: ' + err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

router.post('/upload', 
  auth, 
  adminMiddleware, 
  upload.single('file'), 
  handleUploadError,
  fileStorageController.uploadFile
);

router.get('/', auth, adminMiddleware, fileStorageController.getFiles);
router.get('/:id', auth, adminMiddleware, fileStorageController.getFileById);
router.get('/download/:id', auth, fileStorageController.serveFile);
router.delete('/:id', auth, adminMiddleware, fileStorageController.deleteFile);

module.exports = router;
