const db = require('../models');
const { FileStorage, User } = db;
const storageConfig = require('../config/storage');
const { compressFile } = require('../utils/compressor');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

let qiniu = null;
let mac = null;
let bucketManager = null;

if (storageConfig.qiniu.accessKey && storageConfig.qiniu.secretKey && storageConfig.qiniu.bucket) {
  try {
    qiniu = require('qiniu');
    mac = new qiniu.auth.digest.Mac(storageConfig.qiniu.accessKey, storageConfig.qiniu.secretKey);
    const config = new qiniu.conf.Config();
    if (qiniu.region && qiniu.region.z0) {
      config.region = qiniu.region.z0;
    } else {
      config.region = 'z0';
    }
    bucketManager = new qiniu.rs.BucketManager(mac, config);
  } catch (error) {
    console.error('七牛云SDK初始化失败:', error);
    qiniu = null;
    mac = null;
    bucketManager = null;
  }
}

exports.uploadFile = async (req, res) => {
  console.log('=== 文件上传请求开始 ===');
  console.log('请求方法:', req.method);
  console.log('请求路径:', req.path);
  console.log('请求文件:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  } : '无文件');
  console.log('请求体:', req.body);
  console.log('用户信息:', req.user ? `${req.user.id} - ${req.user.username}` : '未认证');
  
  try {
    if (!req.user) {
      console.error('上传失败：用户未认证');
      return res.status(401).json({ success: false, message: '用户未登录' });
    }
    
    if (!req.file) {
      console.error('上传失败：没有文件');
      return res.status(400).json({ success: false, message: '请选择要上传的文件' });
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.error('上传失败：文件类型不允许', req.file.mimetype);
      return res.status(400).json({ success: false, message: '只支持PDF、PNG、JPG格式的文件' });
    }

    let originalName = req.file.originalname;
    try {
      if (Buffer.isBuffer(originalName)) {
        originalName = iconv.decode(originalName, 'utf-8');
      } else if (typeof originalName === 'string') {
        const buffer = Buffer.from(originalName, 'binary');
        originalName = iconv.decode(buffer, 'utf-8');
      }
    } catch (e) {
      console.log('文件名编码转换失败，使用原始名称:', e);
    }

    console.log('处理后的文件名:', originalName);
    console.log('自定义文件名:', req.body.file_name);
    console.log('req.body内容:', JSON.stringify(req.body));
    console.log('req.body.file_name类型:', typeof req.body.file_name);
    console.log('req.body.file_name是否存在:', !!req.body.file_name);
    console.log('req.body.file_name是否为空:', req.body.file_name === '');
    console.log('req.body.file_name.trim():', req.body.file_name ? req.body.file_name.trim() : 'undefined');

    const fileExtension = path.extname(originalName);
    
    let fileNameWithoutExt = originalName.replace(new RegExp(`${fileExtension}$`), '');
    
    if (req.body.file_name && req.body.file_name.trim()) {
      fileNameWithoutExt = req.body.file_name.trim();
      console.log(`使用自定义文件名: ${fileNameWithoutExt}`);
    } else {
      console.log('未使用自定义文件名，使用原文件名:', fileNameWithoutExt);
    }
    
    let compressedFileName;
    if (fileNameWithoutExt.length > 8) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomName = '';
      for (let i = 0; i < 8; i++) {
        randomName += chars[Math.floor(Math.random() * chars.length)];
      }
      compressedFileName = `${randomName}${fileExtension}`;
      console.log(`文件名长度(${fileNameWithoutExt.length})超过8个字符，自动生成随机文件名: ${compressedFileName}`);
    } else {
      compressedFileName = `${fileNameWithoutExt}${fileExtension}`;
      console.log(`文件名长度(${fileNameWithoutExt.length})未超过8个字符，使用指定文件名: ${compressedFileName}`);
    }
    const compressedFilePath = path.join(storageConfig.localStoragePath, compressedFileName);

    console.log('压缩文件路径:', compressedFilePath);

    if (!fs.existsSync(storageConfig.localStoragePath)) {
      console.log('创建存储目录:', storageConfig.localStoragePath);
      fs.mkdirSync(storageConfig.localStoragePath, { recursive: true });
    }

    console.log('开始压缩文件...');
    const compressSuccess = await compressFile(req.file.path, compressedFilePath);
    if (!compressSuccess) {
      console.error('文件压缩失败');
      return res.status(500).json({ success: false, message: '文件压缩失败' });
    }
    console.log('文件压缩成功');

    const compressedStats = fs.statSync(compressedFilePath);
    const compressedSize = compressedStats.size;
    console.log('压缩后文件大小:', compressedSize);

    let qiniuKey = null;
    let qiniuUrl = null;
    
    if (qiniu && mac && storageConfig.qiniu.bucket && storageConfig.qiniu.domain) {
      try {
        console.log('开始上传到七牛云...');
        qiniuKey = `compressed/${compressedFileName}`;
        const options = {
          scope: storageConfig.qiniu.bucket,
          key: qiniuKey
        };

        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        const qiniuConfig = new qiniu.conf.Config();
        if (qiniu.region && qiniu.region.z0) {
          qiniuConfig.region = qiniu.region.z0;
        } else {
          qiniuConfig.region = 'z0';
        }

        const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
        const putExtra = new qiniu.form_up.PutExtra();

        await new Promise((resolve) => {
          formUploader.putFile(uploadToken, qiniuKey, compressedFilePath, putExtra, (err, body, info) => {
            if (err || info.statusCode !== 200) {
              console.error('七牛云上传失败:', err || info);
              qiniuKey = null;
              qiniuUrl = null;
            } else {
              qiniuUrl = `${storageConfig.qiniu.domain}/${qiniuKey}`;
              console.log('七牛云上传成功:', qiniuUrl);
            }
            resolve();
          });
        });
      } catch (qiniuError) {
        console.error('七牛云上传异常:', qiniuError);
        qiniuKey = null;
        qiniuUrl = null;
      }
    } else {
      console.log('七牛云配置不完整，跳过七牛云上传');
    }

    console.log('开始保存文件记录到数据库...');
    const fileStorage = await FileStorage.create({
      file_name: compressedFileName,
      original_name: originalName,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      compressed_size: compressedSize,
      local_path: compressedFilePath,
      qiniu_key: qiniuKey,
      qiniu_url: qiniuUrl,
      description: req.body.description || '',
      created_by: req.user.id
    });
    console.log('文件记录保存成功:', fileStorage.id);

    setTimeout(() => {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('临时文件已删除:', req.file.path);
        }
      } catch (e) {
        console.log('临时文件清理失败（可能已被占用）:', e.message);
      }
    }, 100);

    res.status(200).json({
      success: true,
      message: '文件上传成功',
      data: fileStorage,
      compression: {
        originalSize: req.file.size,
        compressedSize: compressedSize,
        ratio: ((1 - compressedSize / req.file.size) * 100).toFixed(1) + '%'
      }
    });
  } catch (error) {
    console.error('=== 文件上传异常 ===');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('请求文件:', req.file ? req.file.originalname : '无文件');
    console.error('用户信息:', req.user ? `${req.user.id} - ${req.user.username}` : '未认证');
    
    // 清理临时文件
    setTimeout(() => {
      if (req.file && req.file.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('已清理临时文件:', req.file.path);
          }
        } catch (cleanupError) {
          console.log('清理临时文件失败（可能已被占用）:', cleanupError.message);
        }
      }
    }, 100);
    
    res.status(500).json({ 
      success: false, 
      message: '文件上传失败: ' + error.message,
      error: error.message
    });
  }
};

exports.getFiles = async (req, res) => {
  console.log('=== getFiles API Called ===');
  console.log('User:', req.user ? `${req.user.id} - ${req.user.username}` : 'Not authenticated');
  console.log('Query:', req.query);
  
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log('About to query FileStorage...');
    const result = await FileStorage.findAndCountAll({
      where: { status: 'active' },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });
    console.log('Query completed successfully, found:', result.count, 'files');

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: '获取文件列表失败', error: error.message });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileStorage.findByPk(id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
    });

    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    res.status(200).json({ success: true, data: file });
  } catch (error) {
    console.error('获取文件失败:', error);
    res.status(500).json({ success: false, message: '获取文件失败' });
  }
};

exports.serveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileStorage.findByPk(id);

    if (!file || file.status !== 'active') {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (file.local_path && fs.existsSync(file.local_path)) {
      const ext = path.extname(file.local_path).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_name)}"`);
      
      const fileStream = fs.createReadStream(file.local_path);
      fileStream.pipe(res);
      return;
    }

    if (file.qiniu_url) {
      res.redirect(file.qiniu_url);
      return;
    }

    res.status(404).json({ success: false, message: '文件不存在' });
  } catch (error) {
    console.error('文件服务异常:', error);
    res.status(500).json({ success: false, message: '文件服务异常' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FileStorage.findByPk(id);

    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (file.local_path && fs.existsSync(file.local_path)) {
      fs.unlinkSync(file.local_path);
    }

    if (file.qiniu_key && bucketManager && storageConfig.qiniu.bucket) {
      bucketManager.delete(storageConfig.qiniu.bucket, file.qiniu_key, (err) => {
        if (err) console.error('删除七牛云文件失败:', err);
      });
    }

    await file.update({ status: 'deleted' });
    await file.destroy();

    res.status(200).json({ success: true, message: '文件删除成功' });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ success: false, message: '删除文件失败' });
  }
};