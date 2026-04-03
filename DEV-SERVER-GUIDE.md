# 开发服务器持久化运行指南

## 问题描述
Vite 开发服务器在一段时间没有活动后会自动关闭，需要手动重新启动。

## 解决方案

### 方案一：使用 PM2（推荐）

PM2 是一个进程管理器，可以确保开发服务器持续运行，即使崩溃也会自动重启。

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 使用启动脚本（最简单）

双击运行项目根目录下的 `start-dev.bat` 文件，脚本会自动：
- 检查并安装 PM2
- 启动后端服务器
- 启动前端开发服务器
- 保存配置以便开机自启

#### 3. 手动启动

```bash
# 启动后端服务器
pm2 start ecosystem.config.js --only caicai-planet-server

# 启动前端开发服务器
pm2 start ecosystem.config.js --only caicai-planet-client

# 保存配置
pm2 save
```

#### 4. 常用命令

```bash
# 查看所有服务状态
pm2 status

# 查看日志
pm2 logs

# 只查看前端日志
pm2 logs caicai-planet-client

# 重启前端
pm2 restart caicai-planet-client

# 重启后端
pm2 restart caicai-planet-server

# 停止前端
pm2 stop caicai-planet-client

# 停止后端
pm2 stop caicai-planet-server

# 停止所有
pm2 stop all

# 删除所有进程
pm2 delete all
```

#### 5. 设置开机自启

```bash
# 生成开机启动脚本
pm2 startup

# 保存当前配置
pm2 save
```

### 方案二：使用 PowerShell 脚本保持活跃

如果不想使用 PM2，可以创建一个 PowerShell 脚本来定期发送请求保持服务器活跃。

创建 `keep-alive.ps1`：

```powershell
while ($true) {
    try {
        Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -TimeoutSec 5 | Out-Null
        Write-Host "$(Get-Date) - 服务器活跃" -ForegroundColor Green
    } catch {
        Write-Host "$(Get-Date) - 服务器无响应，可能需要重启" -ForegroundColor Red
    }
    # 每30秒检查一次
    Start-Sleep -Seconds 30
}
```

运行脚本：
```powershell
.\keep-alive.ps1
```

### 方案三：修改 Vite 配置

在 `client/vite.config.js` 中添加服务器保持活跃的配置：

```javascript
export default {
  server: {
    // 保持连接活跃
    keepAlive: true,
    // 增加超时时间
    timeout: 60000,
    // 允许外部访问
    host: true,
    // 端口
    port: 3000,
    // 严格端口
    strictPort: true,
    // 自动打开浏览器
    open: false,
    // 热更新配置
    hmr: {
      // 保持连接
      timeout: 5000,
      // 客户端端口
      clientPort: 3000
    }
  }
}
```

### 方案四：使用 Windows 计划任务

1. 打开任务计划程序
2. 创建基本任务
3. 设置触发器为"当特定用户登录时"
4. 设置操作为"启动程序"
5. 程序路径选择 `start-dev.bat`

## 推荐方案

**推荐使用方案一（PM2）**，因为：
- 自动重启崩溃的服务
- 支持开机自启
- 有完善的日志管理
- 可以监控资源使用情况
- 配置简单，一次设置永久使用

## 故障排除

### 端口被占用

```bash
# 查看端口占用
netstat -ano | findstr :3000

# 结束进程（将 <PID> 替换为实际的进程ID）
taskkill /PID <PID> /F
```

### PM2 启动失败

```bash
# 清除 PM2 配置
pm2 delete all
pm2 save

# 重新启动
pm2 start ecosystem.config.js
```

### 前端无法连接后端

检查 `client/src/services/api.js` 中的 `baseURL` 是否正确：
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3003/api'
});
```

## 访问地址

- 前端开发服务器：http://localhost:3000
- 后端 API 服务器：http://localhost:3003
