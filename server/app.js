require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');


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
const emailStatsRoutes = require('./routes/emailStats');
const errorLogsRoutes = require('./routes/errorLogs');

const notificationRoutes = require('./routes/notifications');
const errorTypeRoutes = require('./Question/routes/errorTypes');
const userTaskRoutes = require('./routes/userTasks');
const shortLinkRoutes = require('./routes/shortLinks');
const announcementRoutes = require('./routes/announcements');
const authorizationRoutes = require('./routes/authorization');
const checkInRoutes = require('./routes/checkIn');
const moonCentersRouter = require('./routes/moonCenters');
const expManagementRoutes = require('./routes/expManagement');
const siteConfigAdminController = require('./controllers/siteConfigAdminController');
const advertisementRoutes = require('./routes/advertisements');

const errorHandler = require('./middleware/errorHandler');
const { logOperation } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// 信任代理，用于在云服务器环境中获取真实IP
app.set('trust proxy', true);

// 导入分享控制器
const shareController = require('./controllers/shareController');

// 全局请求限制 - 开发环境放宽限制
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 500, // 每个IP最多500个请求
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  // 配置keyGenerator以正确处理代理
  keyGenerator: (req) => {
    // 从X-Forwarded-For头获取真实IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
              req.ip || 
              req.connection?.remoteAddress || 
              req.socket?.remoteAddress || 
              'unknown';
    return ip;
  }
});

// 登录/注册请求限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次登录尝试
  message: { message: '登录尝试次数过多，请15分钟后再试' },
  skipSuccessfulRequests: true, // 成功的请求不计数
  // 配置keyGenerator以正确处理代理
  keyGenerator: (req) => {
    // 从X-Forwarded-For头获取真实IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
              req.ip || 
              req.connection?.remoteAddress || 
              req.socket?.remoteAddress || 
              'unknown';
    return ip;
  }
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
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由配置（已移除CSRF防护）
app.use('/api/auth', authLimiter, authRoutes);
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
app.use('/api/email', emailStatsRoutes);
app.use('/api/error', errorLogsRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/user-tasks', logOperation, userTaskRoutes);
app.use('/api/check-in', checkInRoutes);
app.use('/api/moon-centers', moonCentersRouter);
app.use('/api/exp-management', expManagementRoutes);
app.use('/api/advertisements', advertisementRoutes);

// 月球分路由
console.log('Loading moon points routes...');
try {
  const moonPointsRouter = require('./routes/moonPoints');
  console.log('Moon points routes loaded successfully!');
  app.use('/api/moon-points', moonPointsRouter);
} catch (error) {
  console.error('Error loading moon points routes:', error);
}

// 月球分审核路由
console.log('Loading moon point request routes...');
try {
  const moonPointRequestRouter = require('./routes/moonPointRequests');
  console.log('Moon point request routes loaded successfully!');
  app.use('/api/moon-points', moonPointRequestRouter);
} catch (error) {
  console.error('Error loading moon point request routes:', error);
}

// 月球分规则路由
console.log('Loading moon point rule routes...');
try {
  const moonPointRuleRouter = require('./routes/moonPointRules');
  console.log('Moon point rule routes loaded successfully!');
  app.use('/api/moon-point-rules', moonPointRuleRouter);
} catch (error) {
  console.error('Error loading moon point rule routes:', error);
}

app.get('/api/site-configs', siteConfigAdminController.getSiteConfigs);

// 短链接路由
app.use('/api/short-links', shortLinkRoutes);
// 短链接重定向
app.use('/r', shortLinkRoutes);

// 导入认证中间件
const { auth } = require('./middleware/auth');

// 外链接路由
app.get('/share/friend-link/:shareCode', auth, shareController.handleShareLinkClick);
// 短链接路由
app.get('/short/:shareCode', auth, shareController.handleShareLinkClick);
app.post('/api/share/friend-link/verify', shareController.verifyShareLink);

// 授权中心路由
app.use('/api/authorization', authorizationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 测试路由：直接测试月球分申请功能
const { applyMoonPoints } = require('./services/moonPointService');
app.get('/api/test-moon-point', async (req, res) => {
  console.log('[测试路由] 接收到测试请求');
  try {
    // 使用一个测试用户ID（假设您的用户ID是11）
    const testUserId = 11;
    console.log('[测试路由] 调用applyMoonPoints, 用户ID:', testUserId);
    
    const result = await applyMoonPoints(testUserId, 'create_post', 99999);
    console.log('[测试路由] 成功:', result);
    
    res.json({ 
      success: true, 
      message: '测试成功', 
      result: result 
    });
  } catch (error) {
    console.error('[测试路由] 失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '测试失败', 
      error: error.message 
    });
  }
});

// 测试路由：手动测试月球分衰减
const { decayAllUsersMoonPoints } = require('./services/moonPointDecayService');
app.get('/api/test-moon-point-decay', async (req, res) => {
  console.log('[测试路由] 接收到月球分衰减测试请求');
  try {
    const result = await decayAllUsersMoonPoints();
    console.log('[测试路由] 月球分衰减测试成功:', result);
    
    res.json({ 
      success: true, 
      message: '月球分衰减测试成功', 
      result: result 
    });
  } catch (error) {
    console.error('[测试路由] 月球分衰减测试失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '月球分衰减测试失败', 
      error: error.message 
    });
  }
});

// 测试路由：测试每日任务限制
const { canAcceptTask, getTodayAcceptedTaskCount, calculateUserLevel, getDailyTaskLimit } = require('./services/taskLimitService');
app.get('/api/test-task-limit/:userId', async (req, res) => {
  console.log('[测试路由] 接收到任务限制测试请求');
  try {
    const { userId } = req.params;
    const { User } = require('./models');
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const level = await calculateUserLevel(user.exp);
    const limit = getDailyTaskLimit(level);
    const currentCount = await getTodayAcceptedTaskCount(parseInt(userId));
    const canAccept = currentCount < limit;
    
    const result = {
      userId: parseInt(userId),
      username: user.username,
      exp: user.exp,
      level,
      limit,
      currentCount,
      canAccept,
      remaining: limit - currentCount
    };
    
    console.log('[测试路由] 任务限制测试成功:', result);
    
    res.json({ 
      success: true, 
      message: '任务限制测试成功', 
      result: result 
    });
  } catch (error) {
    console.error('[测试路由] 任务限制测试失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '任务限制测试失败', 
      error: error.message 
    });
  }
});

// 测试路由：重置用户今日任务接取记录（方便测试）
app.post('/api/test-reset-task-limit/:userId', async (req, res) => {
  console.log('[测试路由] 接收到重置任务限制请求');
  try {
    const { userId } = req.params;
    const { UserDailyTaskAccept } = require('./models');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deletedCount = await UserDailyTaskAccept.destroy({
      where: {
        user_id: parseInt(userId),
        date: today
      }
    });
    
    console.log('[测试路由] 任务限制重置成功，删除记录数:', deletedCount);
    
    res.json({ 
      success: true, 
      message: '任务限制重置成功', 
      deletedCount: deletedCount 
    });
  } catch (error) {
    console.error('[测试路由] 任务限制重置失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '任务限制重置失败', 
      error: error.message 
    });
  }
});

// 测试路由：同步用户今日已接取的任务到记录表
app.post('/api/test-sync-tasks/:userId', async (req, res) => {
  console.log('[测试路由] 接收到同步任务请求');
  try {
    const { userId } = req.params;
    const { UserTask, UserDailyTaskAccept } = require('./models');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 查询用户今天接取的所有任务
    const userTasks = await UserTask.findAll({
      where: {
        user_id: parseInt(userId),
        status: ['accepted', 'completed', 'cancelled', 'failed']
      }
    });
    
    // 筛选出今天接取的任务
    const todayTasks = userTasks.filter(task => {
      if (!task.acceptedAt) return false;
      const acceptedDate = new Date(task.acceptedAt);
      acceptedDate.setHours(0, 0, 0, 0);
      return acceptedDate.getTime() === today.getTime();
    });
    
    console.log('[测试路由] 找到今日任务数:', todayTasks.length);
    
    // 同步到记录表
    let syncedCount = 0;
    for (const userTask of todayTasks) {
      try {
        await UserDailyTaskAccept.create({
          user_id: parseInt(userId),
          task_id: userTask.task_id,
          date: today
        });
        syncedCount++;
      } catch (error) {
        // 忽略重复记录错误
        if (error.name !== 'SequelizeUniqueConstraintError') {
          console.error('[测试路由] 同步任务失败:', error);
        }
      }
    }
    
    console.log('[测试路由] 同步成功，数量:', syncedCount);
    
    res.json({ 
      success: true, 
      message: '任务同步成功', 
      totalTodayTasks: todayTasks.length,
      syncedCount: syncedCount 
    });
  } catch (error) {
    console.error('[测试路由] 任务同步失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '任务同步失败', 
      error: error.message 
    });
  }
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
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN register_ip VARCHAR(50)");
    } catch (error) {
      console.log('register_ip字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN email_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('email_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN push_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('push_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN comment_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('comment_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN like_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('like_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN system_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('system_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN profile_visibility ENUM('public', 'followers', 'private') NOT NULL DEFAULT 'public'");
    } catch (error) {
      console.log('profile_visibility字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN show_email TINYINT(1) NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('show_email字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN show_activity TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('show_activity字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN theme ENUM('light', 'dark') NOT NULL DEFAULT 'light'");
    } catch (error) {
      console.log('theme字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN current_token VARCHAR(255)");
    } catch (error) {
      console.log('current_token字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'zh-CN'");
    } catch (error) {
      console.log('language字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN badge_notifications TINYINT(1) NOT NULL DEFAULT 1");
    } catch (error) {
      console.log('badge_notifications字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN exp INT NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('exp字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN last_checkin_reminder DATE");
    } catch (error) {
      console.log('last_checkin_reminder字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE check_ins ADD COLUMN exp_earned INT NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('exp_earned字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE exp_logs MODIFY COLUMN reason_type ENUM('check_in', 'task', 'post', 'comment', 'like', 'admin', 'login', 'other') NOT NULL DEFAULT 'other'");
    } catch (error) {
      console.log('reason_type枚举更新完成或已存在');
    }
    // 为经验值等级表添加加成字段
    try {
      await db.sequelize.query("ALTER TABLE exp_levels ADD COLUMN point_bonus INT NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('point_bonus字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE exp_levels ADD COLUMN moon_points_bonus INT NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('moon_points_bonus字段已存在');
    }
    
    // 为用户表添加月球分中心字段
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN moon_center_id INT");
    } catch (error) {
      console.log('moon_center_id字段已存在');
    }
    // 为用户表添加月球分字段
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN moon_points INT NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('moon_points字段已存在');
    }
    // 为友链表添加外链接相关字段
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_code VARCHAR(50) UNIQUE");
    } catch (error) {
      console.log('share_code字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_password VARCHAR(50)");
    } catch (error) {
      console.log('share_password字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_clicks INT DEFAULT 0");
    } catch (error) {
      console.log('share_clicks字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_limit INT");
    } catch (error) {
      console.log('share_limit字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_expires_at DATETIME");
    } catch (error) {
      console.log('share_expires_at字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE friend_links ADD COLUMN share_created_at DATETIME");
    } catch (error) {
      console.log('share_created_at字段已存在');
    }
    // 为tasks表添加suggestedTime字段
    try {
      await db.sequelize.query("ALTER TABLE tasks ADD COLUMN suggestedTime VARCHAR(100)");
    } catch (error) {
      console.log('suggestedTime字段已存在');
    }
    // 为tasks表添加items字段
    try {
      await db.sequelize.query("ALTER TABLE tasks ADD COLUMN items TEXT");
    } catch (error) {
      console.log('items字段已存在');
    }
    // 为task_proposals表添加suggestedTime字段
    try {
      await db.sequelize.query("ALTER TABLE task_proposals ADD COLUMN suggestedTime VARCHAR(100)");
    } catch (error) {
      console.log('task_proposals suggestedTime字段已存在');
    }
    // 为task_proposals表添加items字段
    try {
      await db.sequelize.query("ALTER TABLE task_proposals ADD COLUMN items TEXT");
    } catch (error) {
      console.log('task_proposals items字段已存在');
    }
    // 修改moon_point_requests表的reason_type字段从ENUM改为STRING
    try {
      await db.sequelize.query("ALTER TABLE moon_point_requests MODIFY COLUMN reason_type VARCHAR(50) NOT NULL DEFAULT 'other'");
    } catch (error) {
      console.log('moon_point_requests reason_type字段已修改');
    }
    // 创建user_daily_posts表（用户每日发布记录）
    try {
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_daily_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          post_id INT NOT NULL,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_post_date (user_id, post_id, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('user_daily_posts表创建成功');
    } catch (error) {
      console.log('user_daily_posts表已存在');
    }
    // 创建广告位表
    try {
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS advertisements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          position VARCHAR(100) NOT NULL,
          content TEXT,
          image_url VARCHAR(500),
          link_url VARCHAR(500),
          status ENUM('draft', 'testing', 'published') NOT NULL DEFAULT 'draft',
          start_time DATETIME,
          end_time DATETIME,
          priority INT NOT NULL DEFAULT 0,
          clicks INT NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_position (position),
          INDEX idx_status (status),
          INDEX idx_priority (priority)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('advertisements表创建成功');
    } catch (error) {
      console.log('advertisements表已存在');
    }
    // 修改moon_point_logs表的reason_type字段从ENUM改为STRING
    try {
      await db.sequelize.query("ALTER TABLE moon_point_logs MODIFY COLUMN reason_type VARCHAR(50) NOT NULL DEFAULT 'other'");
    } catch (error) {
      console.log('moon_point_logs reason_type字段已修改');
    }
    
    // 修改月球分相关字段为DECIMAL(10,1)类型
    try {
      await db.sequelize.query("ALTER TABLE users MODIFY COLUMN moon_points DECIMAL(10,1) NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('users moon_points字段已修改或已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE moon_point_logs MODIFY COLUMN points DECIMAL(10,1) NOT NULL");
    } catch (error) {
      console.log('moon_point_logs points字段已修改或已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE moon_point_requests MODIFY COLUMN points DECIMAL(10,1) NOT NULL");
    } catch (error) {
      console.log('moon_point_requests points字段已修改或已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE moon_point_rules MODIFY COLUMN base_points DECIMAL(10,1) NOT NULL DEFAULT 0");
    } catch (error) {
      console.log('moon_point_rules base_points字段已修改或已存在');
    }
    
    // 添加任务相关字段
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN task_ban_end_time DATETIME");
    } catch (error) {
      console.log('task_ban_end_time字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN current_task_id INT");
    } catch (error) {
      console.log('current_task_id字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE users ADD COLUMN last_moon_point_decay_at DATETIME");
    } catch (error) {
      console.log('last_moon_point_decay_at字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE tasks ADD COLUMN proposalUserId INT");
    } catch (error) {
      console.log('proposalUserId字段已存在');
    }
    try {
      await db.sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_daily_task_accepts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          task_id INT NOT NULL,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_task_date (user_id, task_id, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('user_daily_task_accepts表创建成功');
    } catch (error) {
      console.log('user_daily_task_accepts表已存在');
    }
    
    // 修改user_tasks表，添加新字段
    try {
      await db.sequelize.query("ALTER TABLE user_tasks MODIFY COLUMN status ENUM('accepted', 'completed', 'cancelled', 'failed') NOT NULL DEFAULT 'accepted'");
    } catch (error) {
      console.log('user_tasks status字段已修改或已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE user_tasks ADD COLUMN failedAt DATETIME");
    } catch (error) {
      console.log('failedAt字段已存在');
    }
    try {
      await db.sequelize.query("ALTER TABLE user_tasks ADD COLUMN moon_point_request_id INT");
    } catch (error) {
      console.log('moon_point_request_id字段已存在');
    }
    
    console.log('数据库模型同步完成');

    // 自动初始化默认月球分规则
    const MoonPointRule = db.MoonPointRule;
    const defaultRules = [
      {
        name: '每日打卡',
        reason_type: 'check_in',
        base_points: 10,
        need_approval: false,
        daily_limit: 1,
        description: '用户每日打卡自动获得10月球分，无需审核'
      },
      {
        name: '分享文章',
        reason_type: 'share_post',
        base_points: 5,
        need_approval: true,
        daily_limit: 1,
        description: '用户分享文章获得5月球分，需要审核'
      },
      {
        name: '创作文章',
        reason_type: 'create_post',
        base_points: 10,
        need_approval: true,
        daily_limit: 1,
        description: '用户创作文章获得10月球分，需要审核'
      },
      {
        name: '完成简单任务',
        reason_type: 'complete_task_easy',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户完成简单任务获得2月球分，需要审核'
      },
      {
        name: '完成中等任务',
        reason_type: 'complete_task_medium',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户完成中等任务获得3月球分，需要审核'
      },
      {
        name: '完成困难任务',
        reason_type: 'complete_task_hard',
        base_points: 5,
        need_approval: true,
        daily_limit: null,
        description: '用户完成困难任务获得5月球分，需要审核'
      },
      {
        name: '投稿简单任务',
        reason_type: 'submit_task_easy',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿简单任务获得2月球分，需要审核'
      },
      {
        name: '投稿中等任务',
        reason_type: 'submit_task_medium',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿中等任务获得3月球分，需要审核'
      },
      {
        name: '投稿困难任务',
        reason_type: 'submit_task_hard',
        base_points: 5,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿困难任务获得5月球分，需要审核'
      },
      {
        name: '投稿被完成-简单',
        reason_type: 'task_completed_easy',
        base_points: 1,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的简单任务被完成获得1月球分，需要审核'
      },
      {
        name: '投稿被完成-中等',
        reason_type: 'task_completed_medium',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的中等任务被完成获得2月球分，需要审核'
      },
      {
        name: '投稿被完成-困难',
        reason_type: 'task_completed_hard',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的困难任务被完成获得3月球分，需要审核'
      }
    ];

    for (const ruleData of defaultRules) {
      const [rule, created] = await MoonPointRule.findOrCreate({
        where: { reason_type: ruleData.reason_type },
        defaults: ruleData
      });
      if (created) {
        console.log(`创建月球分规则: ${ruleData.name}`);
      }
    }

    // 启动定时任务
    const setupCronJobs = require('./cronJobs');
    setupCronJobs();

    console.log('正在启动服务器...');
    console.log(`尝试在端口 ${PORT} 上监听...`);
    
    // 监听未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('未捕获的异常:', error);
    });
    
    // 监听未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未处理的Promise拒绝:', reason);
    });
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器成功启动，运行在端口 ${PORT}`);
      console.log(`服务器地址: http://localhost:${PORT}`);
      console.log(`服务器地址: http://127.0.0.1:${PORT}`);
      console.log('服务器启动完成，等待请求...');
      
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
          console.log('\n服务器自检成功，服务运行正常！');
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
    
    // 监听服务器关闭事件
    server.on('close', () => {
      console.log('服务器已关闭');
    });
    
    // 监听连接事件
    server.on('connection', (socket) => {
      console.log('新的连接:', socket.remoteAddress, socket.remotePort);
      socket.on('close', () => {
        console.log('连接关闭:', socket.remoteAddress, socket.remotePort);
      });
      socket.on('error', (error) => {
        console.error('连接错误:', error);
      });
    });
    
    // 监听进程终止事件
    process.on('SIGINT', () => {
      console.log('收到终止信号，正在关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('收到终止信号，正在关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();
