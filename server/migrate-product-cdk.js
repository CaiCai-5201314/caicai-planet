const fs = require('fs');
const path = require('path');

const db = require('./models');
const sequelize = db.sequelize;

const runMigration = async () => {
  console.log('=== 开始执行商品表CDK关联字段迁移 ===');
  
  try {
    const [results] = await sequelize.query(`
      SHOW COLUMNS FROM products LIKE 'cdk_id'
    `);
    
    if (results.length === 0) {
      console.log('添加 cdk_id 字段...');
      await sequelize.query(`
        ALTER TABLE products ADD COLUMN cdk_id INT NULL COMMENT '关联的CDK ID' AFTER status
      `);
      console.log('✓ cdk_id 字段添加成功');
    } else {
      console.log('✓ cdk_id 字段已存在，跳过');
    }
    
    const [results2] = await sequelize.query(`
      SHOW COLUMNS FROM products LIKE 'cdk_reward_type'
    `);
    
    if (results2.length === 0) {
      console.log('添加 cdk_reward_type 字段...');
      await sequelize.query(`
        ALTER TABLE products ADD COLUMN cdk_reward_type ENUM('direct', 'on_purchase') DEFAULT 'on_purchase' NULL COMMENT 'CDK奖励发放方式' AFTER cdk_id
      `);
      console.log('✓ cdk_reward_type 字段添加成功');
    } else {
      console.log('✓ cdk_reward_type 字段已存在，跳过');
    }
    
    console.log('=== 迁移完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    console.error('错误详情:', error.message);
    process.exit(1);
  }
};

runMigration();
