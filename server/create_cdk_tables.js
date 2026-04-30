const db = require('./models');

async function createTables() {
  try {
    console.log('正在创建CDK相关数据库表...');
    
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS cdks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(50) UNIQUE NOT NULL COMMENT 'CDK码',
        type ENUM('single', 'batch', 'vip') NOT NULL DEFAULT 'single' COMMENT '类型：单码/批次/专属',
        batch_code VARCHAR(50) COMMENT '批次码（批次CDK共用）',
        rewards JSON NOT NULL COMMENT '奖励内容 {"moon_points":100, "exp":50, "items":[...]}',
        total_count INT NOT NULL DEFAULT 1 COMMENT '总数量',
        used_count INT NOT NULL DEFAULT 0 COMMENT '已使用数量',
        expire_at DATETIME COMMENT '过期时间',
        min_level INT DEFAULT 0 COMMENT '最低等级限制',
        min_moon_points DECIMAL(10,1) DEFAULT 0 COMMENT '最低月球分限制',
        max_use_per_user INT NOT NULL DEFAULT 1 COMMENT '每人最多使用次数',
        status ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active' COMMENT '状态',
        description TEXT COMMENT '描述说明',
        created_by INT COMMENT '创建者ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cdk_code (code),
        INDEX idx_cdk_batch (batch_code),
        INDEX idx_cdk_status (status),
        INDEX idx_cdk_expire (expire_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDK兑换码表';
    `);
    console.log('✅ cdks表创建成功');
    
    await db.sequelize.query(`
      CREATE TABLE IF NOT EXISTS cdk_uses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cdk_id INT NOT NULL COMMENT 'CDK ID',
        user_id INT NOT NULL COMMENT '用户ID',
        rewards_received JSON NOT NULL COMMENT '实际获得的奖励',
        used_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
        INDEX idx_cdk_use_cdk (cdk_id),
        INDEX idx_cdk_use_user (user_id),
        INDEX idx_cdk_use_time (used_at),
        UNIQUE KEY unique_user_cdk (user_id, cdk_id),
        CONSTRAINT fk_cdk_use_cdk FOREIGN KEY (cdk_id) REFERENCES cdks(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDK使用记录表';
    `);
    console.log('✅ cdk_uses表创建成功');
    
    console.log('\n🎉 CDK数据库表创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    process.exit(1);
  }
}

createTables();