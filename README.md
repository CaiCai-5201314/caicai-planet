# 菜菜星球 (Caicai Planet)

一个充满创意与分享的技术社区网站。

## 技术栈

- **前端**: React 18.2.0 + Vite + Tailwind CSS
- **后端**: Node.js 18.x + Express
- **数据库**: MySQL 8.0.36
- **ORM**: Sequelize 6.37.0
- **身份验证**: JWT (jsonwebtoken 9.0.2)
- **进程管理**: PM2 5.3.0
- **反向代理**: Nginx 1.24.0

## 项目结构

```
caicai-planet/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── Login_Management/   # 登录注册模块
│   │   ├── Admin_Management/   # 后台管理模块
│   │   ├── store/         # 状态管理 (Zustand)
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   └── public/            # 静态资源
├── server/                # 后端项目
│   ├── controllers/       # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── middleware/        # 中间件
│   ├── migrations/        # 数据库迁移
│   └── config/            # 配置文件
├── uploads/               # 文件上传目录
│   ├── avatars/          # 用户头像
│   ├── posts/            # 文章图片
│   └── covers/           # 用户封面
└── nginx.conf            # Nginx 配置
```

## 数据库配置

- 数据库连接名: xxxxxx
- 主机: localhost
- 端口: 3306
- 用户名: xxxx
- 密码: xxxx

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
cd server
npm install

# 前端依赖
cd ../client
npm install
```

### 2. 配置数据库

确保 MySQL 服务已启动，并创建数据库:

```sql
CREATE DATABASE caicaitask520 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 运行数据库迁移

```bash
cd server
npm run migrate
```

### 4. 启动开发服务器

```bash
# 启动后端 (端口 3001)
cd server
npm run dev

# 启动前端 (端口 3000)
cd client
npm run dev
```

### 5. 生产部署

```bash
# 构建前端
cd client
npm run build

# 使用 PM2 启动后端
cd ..
pm start
```

## 功能特性

- ✅ 用户注册/登录 (JWT 认证)
- ✅ 个人主页 (资料展示、文章列表)
- ✅ 社区文章 (发布、浏览、点赞、收藏、评论)
- ✅ 友链系统 (申请、审核、展示)
- ✅ 后台管理 (用户管理、数据统计)
- ✅ 响应式设计
- ✅ Markdown 文章支持

## API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 用户相关
- `GET /api/users/profile/:username` - 获取用户资料
- `GET /api/users/:username/posts` - 获取用户文章

### 文章相关
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 发布文章 (需登录)
- `POST /api/posts/:id/like` - 点赞文章 (需登录)

### 评论相关
- `GET /api/comments?post_id=:id` - 获取评论
- `POST /api/comments` - 发表评论 (需登录)

### 友链相关
- `GET /api/friend-links` - 获取友链列表
- `POST /api/friend-links/apply` - 申请友链

## 许可证

MIT
