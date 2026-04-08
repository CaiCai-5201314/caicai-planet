require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const friendLinkRoutes = require('./routes/friendLinks');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const verificationRoutes = require('./routes/verification');
const errorRoutes = require('./routes/error');
const notificationRoutes = require('./routes/notifications');
const errorTypeRoutes = require('./Question/routes/errorTypes');
const userTaskRoutes = require('./routes/userTasks');
const shortLinkRoutes = require('./routes/shortLinks');
const announcementRoutes = require('./routes/announcements');
const authorizationRoutes = require('./routes/authorization');
const adminController = require('./controllers/adminController');

const errorHandler = require('./middleware/errorHandler');
const { logOperation } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// 全局请求限制
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 15分钟
  max: 10000, // 每个IP最多100个请求
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录/注册请求限制（更严格）
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次登录尝试
  message: { message: '登录尝试次数过多，请15分钟后再试' },
  skipSuccessfulRequests: true, // 成功的请求不计数
});

// 配置 Helmet 安全头
//app.use(helmet({
//  contentSecurityPolicy: {
//    directives: {
//      defaultSrc: ["'self'"],
//      styleSrc: ["'self'", "'unsafe-inline'"],
//      scriptSrc: ["'self'"],
//      imgSrc: ["'self'", "data:", "blob:"],
//    },
//  },
//  crossOriginEmbedderPolicy: false,
//  hstS:false,
//}));

// 应用全局限制
app.use(globalLimiter);
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/friend-links', friendLinkRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
// 公告路由
app.use('/api', announcementRoutes);
app.use('/api/admin', logOperation, adminRoutes);
app.use('/api/admin', logOperation, errorTypeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/error', errorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user-tasks', logOperation, userTaskRoutes);
app.get('/api/site-configs', adminController.getSiteConfigs);

// 短链接路由
app.use('/api/short-links', shortLinkRoutes);
// 短链接重定向
app.use('/r', shortLinkRoutes);

// 授权中心路由
app.use('/api/authorization', authorizationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 404 处理
app.use('/api', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../client/dist')));

// 所有其他路由返回前端页面（支持前端路由）
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 错误处理中间件（必须放在所有路由的最后）
app.use(errorHandler);

const db = require('./models');

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('数据库连接成功');

    // 暂时禁用alter同步，避免索引数量超过限制
    await db.sequelize.sync({});
    
    // 手动添加所需字段
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN is_sub_account TINYINT(1) NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('is_sub_account字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN parent_account_id INT");
    } catch (error) {
      console.log('parent_account_id字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN permissions JSON");
    } catch (error) {
      console.log('permissions字段已存在');
    }
    console.log('数据库模型同步完成');


    console.log('正在启动服务器...');
    console.log(`尝试在端口 ${PORT} 上监听...`);
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器成功启动，运行在端口 ${PORT}`);
      console.log(`服务器地址: http://localhost:${PORT}`);
      console.log(`服务器地址: http://127.0.0.1:${PORT}`);
      
      // 测试服务器是否正常响应
      const http = require('http');
      const options = {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/health',
        method: 'GET'
      };
      
      const req = http.request(options, (res) => {
        console.log(`\n服务器自检响应状态码: ${res.statusCode}`);
        res.on('data', (d) => {
          console.log('服务器自检响应数据:');
          process.stdout.write(d);
        });
      });
      
      req.on('error', (e) => {
        console.error(`\n服务器自检失败: ${e.message}`);
      });
      
      req.end();
    });

    server.on('error', (error) => {
      console.error('服务器启动错误:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
