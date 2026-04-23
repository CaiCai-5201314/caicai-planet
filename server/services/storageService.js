const config = require('../config/storage');
const path = require('path');
const fs = require('fs');

class StorageService {
  constructor() {
    this.type = config.type;
    this.isProduction = process.env.NODE_ENV === 'production';

    if (this.type === 'qiniu' && this.isProduction) {
      const qiniu = require('qiniu');
      this.mac = new qiniu.auth.digest.Mac(config.qiniu.accessKey, config.qiniu.secretKey);
      this.bucketManager = new qiniu.rs.BucketManager(this.mac);
      this.bucket = config.qiniu.bucket;
      this.domain = config.qiniu.domain;
    }
  }

  async upload(file, folder) {
    if (this.type === 'qiniu' && this.isProduction) {
      return this.uploadToQiniu(file, folder);
    } else {
      return this.uploadToLocal(file, folder);
    }
  }

  async uploadToLocal(file, folder) {
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000000)}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    if (file.path) {
      fs.renameSync(file.path, filePath);
    } else {
      const buffer = Buffer.from(file.buffer);
      fs.writeFileSync(filePath, buffer);
    }

    return `/uploads/${folder}/${fileName}`;
  }

  async uploadToQiniu(file, folder) {
    if (!this.isProduction) {
      throw new Error('七牛云上传仅在生产环境可用');
    }

    const qiniu = require('qiniu');
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000000)}${path.extname(file.originalname)}`;
    const key = `${folder}/${fileName}`;

    const options = {
      scope: this.bucket,
      expires: 3600
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(this.mac);

    const formUploader = new qiniu.form_up.FormUploader();
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(token, key, file.path, putExtra, (err, body, info) => {
        if (err) {
          reject(err);
          return;
        }
        if (info.statusCode === 200) {
          resolve(`${this.domain}/${key}`);
        } else {
          reject(new Error(`上传失败: ${info.statusCode}`));
        }
      });
    });
  }

  async delete(url) {
    if (this.type === 'qiniu' && this.isProduction) {
      return this.deleteFromQiniu(url);
    } else {
      return this.deleteFromLocal(url);
    }
  }

  async deleteFromLocal(url) {
    const baseUrl = config.baseUrl || 'http://localhost:3002';
    const localPath = path.join(__dirname, '../../uploads', url.replace('/uploads/', ''));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  async deleteFromQiniu(url) {
    if (!this.isProduction) {
      throw new Error('七牛云删除仅在生产环境可用');
    }

    const key = url.replace(this.domain + '/', '');
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new StorageService();
