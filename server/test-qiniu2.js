const qiniu = require('qiniu');
require('dotenv').config();

const mac = new qiniu.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({ scope: process.env.QINIU_BUCKET });
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const key = 'test-' + Date.now() + '.txt';
const buffer = Buffer.from('Hello Qiniu');

formUploader.put(uploadToken, key, buffer, putExtra, function(respErr, respBody, respInfo) {
  if (respErr) {
    console.log('失败:', respErr);
    return;
  }
  if (respInfo.statusCode == 200) {
    console.log('✅ 上传成功!');
    console.log('URL:', process.env.QINIU_DOMAIN + '/' + key);
  } else {
    console.log('失败，状态码:', respInfo.statusCode);
    console.log(respBody);
  }
});
