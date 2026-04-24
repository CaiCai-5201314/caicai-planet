const qiniu = require('qiniu');

const accessKey = 'f9dPEhmW7224jW1QwRsQO0WOtScuJTIEzjdQnR9h';
const secretKey = '8G0rgZGYkvORPXjuB9jhANqtoZT5VWlepgnDePwo';
const bucket = 'caicairask520';
const domain = 'https://img.caicaitask.click';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
const uploadToken = putPolicy.uploadToken(mac);

// 东南亚区域
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const key = 'test-asia-' + Date.now() + '.txt';
const buffer = Buffer.from('Hello Asia');

formUploader.put(uploadToken, key, buffer, putExtra, function(respErr, respBody, respInfo) {
  if (respErr) {
    console.log('失败:', respErr);
    return;
  }
  console.log('状态码:', respInfo.statusCode);
  if (respInfo.statusCode == 200) {
    console.log('✅ 上传成功! URL:', domain + '/' + key);
  } else {
    console.log('响应:', respBody);
  }
});
