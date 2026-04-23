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

async function migrate() {
  try {
    console.log('开始迁移...');

    // 1. 创建 user_tasks 表
    console.log('\n1. 创建 user_tasks 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        task_id INT NOT NULL,
        status ENUM('accepted', 'completed', 'cancelled') DEFAULT 'accepted',
        acceptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_task (user_id, task_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('user_tasks 表创建成功');

    // 2. 修改 likes 表，添加 task_id 字段
    console.log('\n2. 修改 likes 表...');
    
    // 检查 task_id 字段是否已存在
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM likes WHERE Field = 'task_id'`
    );
    
    if (columns.length === 0) {
      // 修改 post_id 为可为 NULL
      await sequelize.query(`ALTER TABLE likes MODIFY COLUMN post_id INT NULL`);
      console.log('post_id 字段已修改为可为 NULL');
      
      // 添加 task_id 字段
      await sequelize.query(`ALTER TABLE likes ADD COLUMN task_id INT NULL AFTER post_id`);
      console.log('task_id 字段已添加');
      
      // 添加外键约束
      try {
        await sequelize.query(`
          ALTER TABLE likes ADD CONSTRAINT fk_likes_task 
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        `);
        console.log('外键约束已添加');
      } catch (e) {
        console.log('外键约束添加失败（可能已存在）:', e.message);
      }
    } else {
      console.log('task_id 字段已存在，跳过');
    }

    console.log('\n迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

migrate();
