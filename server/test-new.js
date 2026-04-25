const qiniu = require('qiniu');

const accessKey = 'Re3CnnattXF_9GpZWGOBPuPypvhpHyOvy7kMArO6';
const secretKey = '-yuyMU_LJtdfFTG9uscqej8Z-0MhS7J5x4ZzRc71';
const bucket = 'caicairask520';
const domain = 'https://img.caicaitask.click';

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_as0;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const key = 'test-new-' + Date.now() + '.txt';
const buffer = Buffer.from('Hello New Key');

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
