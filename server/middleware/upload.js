const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

console.log('UPLOAD_PATH:', UPLOAD_PATH);
console.log('MAX_FILE_SIZE:', MAX_FILE_SIZE);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = 'posts';
    
    // 检查请求路径或字段名来确定文件类型
    const fullPath = req.path || req.originalUrl || '';
    console.log('Request path:', fullPath);
    console.log('Request files:', req.files);
    console.log('Request file:', req.file);
    
    // 检查字段名
    if (file.fieldname === 'avatar') {
      type = 'avatars';
    } else if (file.fieldname === 'cover') {
      type = 'covers';
    } else if (fullPath.includes('avatar') || fullPath.includes('avatars')) {
      type = 'avatars';
    } else if (fullPath.includes('cover') || fullPath.includes('covers')) {
      type = 'covers';
    } else {
      type = req.params.type || 'posts';
    }
    
    const dest = path.join(UPLOAD_PATH, type);
    console.log('Destination:', dest);
    
    if (!fs.existsSync(dest)) {
      console.log('Creating directory:', dest);
      try {
        fs.mkdirSync(dest, { recursive: true });
        console.log('Directory created successfully');
      } catch (error) {
        console.error('Error creating directory:', error);
        return cb(error);
      }
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  console.log('File mimetype:', file.mimetype);
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)');
    console.error('File type not allowed:', file.mimetype);
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = upload;
