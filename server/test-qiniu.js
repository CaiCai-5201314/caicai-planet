const qiniu = require('qiniu');

// 从 .env 读取配置
require('dotenv').config();

const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
const domain = process.env.QINIU_DOMAIN;

console.log('AccessKey:', accessKey ? '已配置' : '未配置');
console.log('SecretKey:', secretKey ? '已配置' : '未配置');
console.log('Bucket:', bucket);
console.log('Domain:', domain);

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: bucket,
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

console.log('UploadToken:', uploadToken ? '生成成功' : '生成失败');

// 测试上传一个简单文件
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0; // 华东
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const key = 'test-' + Date.now() + '.txt';
const readableStream = require('stream').Readable.from(['Hello Qiniu']);

formUploader.putStream(uploadToken, key, readableStream, putExtra, function(respErr, respBody, respInfo) {
  if (respErr) {
    console.log('上传失败:', respErr);
    return;
  }
  if (respInfo.statusCode == 200) {
    console.log('上传成功!');
    console.log('文件URL:', domain + '/' + key);
    console.log('响应:', respBody);
  } else {
    console.log('上传失败，状态码:', respInfo.statusCode);
    console.log('响应:', respBody);
  }
});
