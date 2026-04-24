const path = require('path');
const fs = require('fs');

class StorageService {
  constructor() {
    // 不再在构造函数中固定配置，而是在方法中动态获取
  }

  // 动态获取当前配置
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return require(`../config/${env}`);
  }

  // 动态获取七牛云配置
  getQiniuConfig() {
    const config = this.getCurrentConfig();
    return config.storage.qiniu;
  }

  // 检查是否为生产环境
  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  // 检查是否使用七牛云存储
  useQiniu() {
    try {
      const config = this.getCurrentConfig();
      console.log('当前存储配置:', { type: config.storage.type, qiniu: config.storage.qiniu ? '配置存在' : '配置不存在' });
      // 允许在开发环境下测试七牛云上传
      const useQiniu = config.storage.type === 'qiniu';
      console.log('是否使用七牛云存储:', useQiniu);
      return useQiniu;
    } catch (error) {
      console.error('检查七牛云配置时出错:', error);
      return false;
    }
  }

  async upload(file, folder) {
    try {
      console.log('开始上传文件:', { originalname: file.originalname, size: file.size, path: file.path });
      console.log('文件夹:', folder);
      
      // 1. 先存储到本地
      console.log('存储到本地...');
      const localUrl = this.uploadToLocal(file, folder);
      console.log('本地存储上传成功，URL:', localUrl);
      
      // 2. 尝试上传到七牛云
      console.log('上传到七牛云...');
      try {
        const qiniuUrl = await this.uploadToQiniu(file, folder);
        console.log('七牛云上传成功，URL:', qiniuUrl);
        // 返回七牛云 URL
        return qiniuUrl;
      } catch (qiniuError) {
        console.error('七牛云上传失败，返回本地存储 URL:', qiniuError);
        // 七牛云上传失败，返回本地存储 URL
        return localUrl;
      }
    } catch (error) {
      console.error('上传文件时出错:', error);
      // 回退到本地存储
      try {
        const localUrl = this.uploadToLocal(file, folder);
        console.log('本地存储上传成功，URL:', localUrl);
        return localUrl;
      } catch (localError) {
        console.error('本地存储上传失败:', localError);
        throw new Error('文件上传失败');
      }
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
    // 移除生产环境检查，允许在开发环境下测试
    console.log('开始七牛云上传...');
    console.log('文件信息:', { originalname: file.originalname, size: file.size, path: file.path, buffer: file.buffer ? '存在' : '不存在' });

    try {
      const qiniu = require('qiniu');
      const qiniuConfig = this.getQiniuConfig();
      console.log('七牛云配置:', { 
        bucket: qiniuConfig.bucket, 
        domain: qiniuConfig.domain,
        accessKey: qiniuConfig.accessKey ? '***' + qiniuConfig.accessKey.slice(-4) : 'null',
        secretKey: qiniuConfig.secretKey ? '***' + qiniuConfig.secretKey.slice(-4) : 'null'
      });

      // 检查七牛云配置是否完整
      if (!qiniuConfig.accessKey || !qiniuConfig.secretKey || !qiniuConfig.bucket || !qiniuConfig.domain) {
        console.error('七牛云配置不完整，使用本地存储');
        throw new Error('七牛云配置不完整');
      }

      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000000)}${path.extname(file.originalname)}`;
      const key = `${folder}/${fileName}`;
      console.log('上传路径:', key);

      try {
        const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
        const options = {
          scope: qiniuConfig.bucket,
          expires: 3600
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const token = putPolicy.uploadToken(mac);
        console.log('生成上传令牌成功');

        // 配置东南亚区域
        const config = new qiniu.conf.Config();
        // 东南亚区域
        config.zone = qiniu.zone.Zone_as0;

        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();

        if (file.path && fs.existsSync(file.path)) {
          // 使用文件路径上传
          console.log('使用文件路径上传:', file.path);
          return new Promise((resolve, reject) => {
            formUploader.putFile(token, key, file.path, putExtra, (err, body, info) => {
              if (err) {
                console.error('七牛云上传错误:', err);
                reject(err);
                return;
              }
              console.log('七牛云上传响应:', { statusCode: info.statusCode, body });
              if (info.statusCode === 200) {
                const url = `${qiniuConfig.domain}/${key}`;
                console.log('七牛云上传成功:', url);
                resolve(url);
              } else {
                const error = new Error(`上传失败: ${info.statusCode}, 响应: ${JSON.stringify(body)}`);
                console.error('七牛云上传失败:', error);
                reject(error);
              }
            });
          });
        } else if (file.buffer) {
          // 使用文件缓冲区上传
          console.log('使用文件缓冲区上传');
          return new Promise((resolve, reject) => {
            formUploader.put(token, key, file.buffer, putExtra, (err, body, info) => {
              if (err) {
                console.error('七牛云上传错误:', err);
                reject(err);
                return;
              }
              console.log('七牛云上传响应:', { statusCode: info.statusCode, body });
              if (info.statusCode === 200) {
                const url = `${qiniuConfig.domain}/${key}`;
                console.log('七牛云上传成功:', url);
                resolve(url);
              } else {
                const error = new Error(`上传失败: ${info.statusCode}, 响应: ${JSON.stringify(body)}`);
                console.error('七牛云上传失败:', error);
                reject(error);
              }
            });
          });
        } else {
          console.error('文件路径和缓冲区都不存在，使用本地存储');
          throw new Error('文件路径和缓冲区都不存在');
        }
      } catch (qiniuError) {
        console.error('七牛云 SDK 错误:', qiniuError);
        throw qiniuError;
      }
    } catch (error) {
      console.error('七牛云上传过程错误:', error);
      throw error;
    }
  }

  async delete(url) {
    if (this.useQiniu()) {
      return this.deleteFromQiniu(url);
    } else {
      return this.deleteFromLocal(url);
    }
  }

  async deleteFromLocal(url) {
    const config = this.getCurrentConfig();
    const baseUrl = config.storage.baseUrl || 'http://localhost:3002';
    const localPath = path.join(__dirname, '../../uploads', url.replace('/uploads/', ''));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }

  async deleteFromQiniu(url) {
    // 移除生产环境检查，允许在开发环境下测试

    const qiniu = require('qiniu');
    const qiniuConfig = this.getQiniuConfig();
    const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
    
    // 配置东南亚区域
    const config = new qiniu.conf.Config();
    // 东南亚区域
    config.zone = qiniu.zone.Zone_as0;
    
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    const key = url.replace(qiniuConfig.domain + '/', '');
    return new Promise((resolve, reject) => {
      bucketManager.delete(qiniuConfig.bucket, key, (err, respBody, respInfo) => {
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
