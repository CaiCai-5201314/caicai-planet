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
const adminController = require('./controllers/adminController');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: '请求过于频繁，请稍后再试' }
});

app.use(helmet());
// 未上线前暂时移除限制
// app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/error', errorRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/site-configs', adminController.getSiteConfigs);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(errorHandler);

// API 404 处理
app.use('/api', (req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 所有其他路由返回前端页面（支持前端路由）
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const db = require('./models');

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('数据库连接成功');

    await db.sequelize.sync({ alter: false });
    console.log('数据库模型同步完成');

    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
