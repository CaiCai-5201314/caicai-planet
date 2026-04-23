#!/bin/bash
# 用法: bash switch.sh maintenance | bash switch.sh normal

MODE=$1
PROJECT_DIR="/opt/caicai-planet"

# 检查 Nginx 配置文件路径
if [ -d "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu 系统
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    SITE_CONF="$NGINX_CONF_DIR/caicai.conf"
elif [ -d "/etc/nginx/conf.d" ]; then
    # CentOS/RHEL 系统
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    SITE_CONF="$NGINX_CONF_DIR/caicai.conf"
elif [ -d "/opt/1panel/apps/openresty/openresty/nginx/conf.d" ]; then
    # 1Panel OpenResty
    NGINX_CONF_DIR="/opt/1panel/apps/openresty/openresty/nginx/conf.d"
    SITE_CONF="$NGINX_CONF_DIR/caicai.conf"
else
    echo "❌ 找不到 Nginx 配置目录"
    exit 1
fi

echo "🔍 检测到 Nginx 配置目录: $NGINX_CONF_DIR"

if [ "$MODE" == "maintenance" ]; then
    echo "🔧 切换到维护模式..."
    # 备份当前配置
    if [ -f "$SITE_CONF" ]; then
        cp "$SITE_CONF" "$PROJECT_DIR/nginx.conf.bak" 2>/dev/null
        echo "📁 已备份当前配置到 $PROJECT_DIR/nginx.conf.bak"
    else
        echo "⚠️  当前配置文件不存在，将直接复制维护配置"
    fi
    # 复制维护配置
    cp "$PROJECT_DIR/nginx.maintenance.conf" "$SITE_CONF"
    echo "📄 已复制维护配置到 $SITE_CONF"
    
elif [ "$MODE" == "normal" ]; then
    echo "✅ 切换到正常模式..."
    # 恢复配置
    if [ -f "$PROJECT_DIR/nginx.conf.bak" ]; then
        cp "$PROJECT_DIR/nginx.conf.bak" "$SITE_CONF"
        echo "📁 已从备份恢复配置"
    else
        cp "$PROJECT_DIR/nginx.conf" "$SITE_CONF"
        echo "📄 已复制默认配置"
    fi
    
else
    echo "❌ 用法: $0 maintenance|normal"
    exit 1
fi

# 测试并重载 Nginx
echo "🔄 重载 Nginx..."

# 尝试不同的 Nginx 命令路径
NGINX_CMD=""
for cmd in nginx /usr/sbin/nginx /usr/local/nginx/sbin/nginx; do
    if command -v "$cmd" > /dev/null; then
        NGINX_CMD="$cmd"
        break
    fi
done

if [ -z "$NGINX_CMD" ]; then
    echo "❌ 找不到 Nginx 命令"
    # 尝试使用 service 或 systemctl 重启
    if command -v service > /dev/null; then
        echo "🔄 尝试使用 service 重启 Nginx..."
        service nginx restart
    elif command -v systemctl > /dev/null; then
        echo "🔄 尝试使用 systemctl 重启 Nginx..."
        systemctl restart nginx
    else
        echo "❌ 无法重启 Nginx，请手动重启"
        exit 1
    fi
else
    echo "📌 使用 Nginx 命令: $NGINX_CMD"
    "$NGINX_CMD" -t && "$NGINX_CMD" -s reload
fi

if [ $? -eq 0 ]; then
    echo "✅ 已切换至【$MODE】模式"
else
    echo "❌ Nginx 配置测试失败，已回退"
    # 回退逻辑
    if [ -f "$PROJECT_DIR/nginx.conf.bak" ]; then
        cp "$PROJECT_DIR/nginx.conf.bak" "$SITE_CONF"
        if [ -n "$NGINX_CMD" ]; then
            "$NGINX_CMD" -s reload
        elif command -v service > /dev/null; then
            service nginx restart
        elif command -v systemctl > /dev/null; then
            systemctl restart nginx
        fi
    fi
    exit 1
fi
