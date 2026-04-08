const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'caicaitask520',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixCommentFields() {
  try {
    console.log('开始修复 comments 表字段...');
    
    // 修改 post_id 字段为可为 NULL
    await sequelize.query(
      `ALTER TABLE comments MODIFY COLUMN post_id INT NULL`
    );
    console.log('post_id 字段已修改为可为 NULL');
    
    // 确认 task_id 字段也是可为 NULL
    await sequelize.query(
      `ALTER TABLE comments MODIFY COLUMN task_id INT NULL`
    );
    console.log('task_id 字段已修改为可为 NULL');
    
    console.log('修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('修复失败:', error.message);
    process.exit(1);
  }
}

fixCommentFields();
