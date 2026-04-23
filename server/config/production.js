require('dotenv').config();

module.exports = {
  database: {
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT || 3306,
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME
  },

  storage: {
    type: 'qiniu',
    qiniu: {
      accessKey: process.env.QINIU_ACCESS_KEY,
      secretKey: process.env.QINIU_SECRET_KEY,
      bucket: process.env.QINIU_BUCKET || 'caicaimars520',
      domain: process.env.QINIU_DOMAIN || 'https://img.caicaistack.click'
    }
  },

  server: {
    port: process.env.PORT || 3002,
    host: '0.0.0.0'
  },

  env: 'production'
};
