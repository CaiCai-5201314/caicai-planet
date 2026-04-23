#!/bin/bash
# 用法: bash switch.sh maintenance | bash switch.sh normal

MODE=$1
PROJECT_DIR="/opt/caicai-planet"
NGINX_CONF_DIR="/opt/1panel/apps/openresty/openresty/nginx/conf.d"
SITE_CONF="$NGINX_CONF_DIR/caicai.conf"

if [ "$MODE" == "maintenance" ]; then
    echo "🔧 切换到维护模式..."
    # 备份当前配置
    cp $SITE_CONF $PROJECT_DIR/nginx.conf.bak 2>/dev/null
    # 复制维护配置
    cp $PROJECT_DIR/nginx.maintenance.conf $SITE_CONF
    
elif [ "$MODE" == "normal" ]; then
    echo "✅ 切换到正常模式..."
    # 恢复配置
    if [ -f $PROJECT_DIR/nginx.conf.bak ]; then
        cp $PROJECT_DIR/nginx.conf.bak $SITE_CONF
    else
        cp $PROJECT_DIR/nginx.conf $SITE_CONF
    fi
    
else
    echo "❌ 用法: $0 maintenance|normal"
    exit 1
fi

# 测试并重载 Nginx
echo "🔄 重载 Nginx..."
nginx -t && nginx -s reload

if [ $? -eq 0 ]; then
    echo "✅ 已切换至【$MODE】模式"
else
    echo "❌ Nginx 配置测试失败，已回退"
    # 回退逻辑
    if [ -f $PROJECT_DIR/nginx.conf.bak ]; then
        cp $PROJECT_DIR/nginx.conf.bak $SITE_CONF
        nginx -s reload
    fi
    exit 1
fi
