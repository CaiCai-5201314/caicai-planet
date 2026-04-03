@echo off
chcp 65001 >nul
echo ==========================================
echo    菜菜星球开发服务器启动脚本
echo ==========================================
echo.

:: 检查是否安装了PM2
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo [提示] PM2 未安装，正在安装...
    npm install -g pm2
    if errorlevel 1 (
        echo [错误] PM2 安装失败，请手动安装: npm install -g pm2
        pause
        exit /b 1
    )
    echo [成功] PM2 安装完成
)

echo.
echo [1/3] 正在启动后端服务器...
pm2 start ecosystem.config.js --only caicai-planet-server

echo.
echo [2/3] 正在启动前端开发服务器...
pm2 start ecosystem.config.js --only caicai-planet-client

echo.
echo [3/3] 保存PM2配置...
pm2 save

echo.
echo ==========================================
echo    所有服务已启动！
echo ==========================================
echo.
echo 访问地址:
echo   - 前端: http://localhost:3000
echo   - 后端: http://localhost:3003
echo.
echo 常用命令:
echo   - 查看状态: pm2 status
echo   - 查看日志: pm2 logs
echo   - 重启前端: pm2 restart caicai-planet-client
echo   - 重启后端: pm2 restart caicai-planet-server
echo   - 停止所有: pm2 stop all
echo.
echo 按任意键查看PM2状态...
pause >nul

pm2 status

echo.
echo 按任意键退出...
pause >nul
