require('dotenv').config();

module.exports = {
  database: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 3306,
    username: process.env.DEV_DB_USER || 'root',
    password: process.env.DEV_DB_PASSWORD || '123456',
    database: process.env.DEV_DB_NAME || 'caicaitask520'
  },

  storage: {
    type: 'qiniu',
    qiniu: {
      accessKey: process.env.QINIU_ACCESS_KEY,
      secretKey: process.env.QINIU_SECRET_KEY,
      bucket: process.env.QINIU_BUCKET || 'caicaimars520',
      domain: process.env.QINIU_DOMAIN || 'https://img.caicaitask.click'
    }
  },

  server: {
    port: process.env.PORT || 3002,
    host: 'localhost'
  },

  env: 'development'
};
