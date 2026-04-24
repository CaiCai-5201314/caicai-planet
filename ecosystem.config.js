module.exports = {
  apps: [
    {
      name: 'caicai-planet-server',
      script: './server/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PROD_DB_HOST: '127.0.0.1',
        PROD_DB_PORT: 3306,
        PROD_DB_USER: 'caicai_user',
        PROD_DB_PASSWORD: 'Kxy040715@qwer',
        PROD_DB_NAME: 'caicaitask520',
        QINIU_BUCKET: 'caicairask520',
        QINIU_DOMAIN: 'https://img.caicaitask.click',
        JWT_SECRET: 'caicaistack_jwt_secret_key_2026',
        JWT_EXPIRES_IN: '7d'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true
    },
    {
      name: 'caicai-planet-client',
      script: './node_modules/.bin/vite',
      args: '--port 3000',
      cwd: './client',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/client-error.log',
      out_file: './logs/client-out.log',
      log_file: './logs/client-combined.log',
      time: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
};
