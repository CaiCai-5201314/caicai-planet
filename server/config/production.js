require('dotenv').config();

module.exports = {
  database: {
    host: process.env.PROD_DB_HOST || '127.0.0.1',
    port: process.env.PROD_DB_PORT || 3306,
    username: process.env.PROD_DB_USER || 'caicai_user',
    password: process.env.PROD_DB_PASSWORD || 'Kxy040715@qwer',
    database: process.env.PROD_DB_NAME || 'caicaitask520'
  },

  storage: {
    type: 'qiniu',
    qiniu: {
      accessKey: process.env.QINIU_ACCESS_KEY,
      secretKey: process.env.QINIU_SECRET_KEY,
      bucket: process.env.QINIU_BUCKET || 'caicairask520',
      domain: process.env.QINIU_DOMAIN || 'https://img.caicaitask.click'
    }
  },

  server: {
    port: process.env.PORT || 3002,
    host: '0.0.0.0'
  },

  env: 'production'
};
