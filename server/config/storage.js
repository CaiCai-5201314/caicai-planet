require('dotenv').config();
const path = require('path');

const fs = require('fs');

const localStoragePath = path.join(__dirname, '../uploads');
if (!fs.existsSync(localStoragePath)) {
  console.log('创建上传目录:', localStoragePath);
  fs.mkdirSync(localStoragePath, { recursive: true });
}

module.exports = {
  localStoragePath: localStoragePath,
  maxFileSize: 10 * 1024 * 1024,
  qiniu: {
    accessKey: process.env.QINIU_ACCESS_KEY || '',
    secretKey: process.env.QINIU_SECRET_KEY || '',
    bucket: process.env.QINIU_BUCKET || '',
    domain: process.env.QINIU_DOMAIN || ''
  }
};