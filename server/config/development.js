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
    type: 'local',
    uploadPath: '../uploads',
    baseUrl: process.env.LOCAL_BASE_URL || 'http://localhost:3002'
  },

  server: {
    port: process.env.PORT || 3002,
    host: 'localhost'
  },

  env: 'development'
};
