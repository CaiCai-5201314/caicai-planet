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

async function addTaskIdToComments() {
  try {
    console.log('开始添加 task_id 字段到 comments 表...');
    
    // 检查 task_id 字段是否已存在
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM comments WHERE Field = 'task_id'`
    );
    
    if (columns.length > 0) {
      console.log('task_id 字段已存在，跳过添加');
    } else {
      // 添加 task_id 字段
      await sequelize.query(
        `ALTER TABLE comments ADD COLUMN task_id INT NULL AFTER post_id`
      );
      console.log('task_id 字段添加成功');
      
      // 添加外键约束（可选）
      try {
        await sequelize.query(
          `ALTER TABLE comments ADD CONSTRAINT fk_comments_task 
           FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE`
        );
        console.log('外键约束添加成功');
      } catch (fkError) {
        console.log('外键约束添加失败（可能已存在或tasks表不存在）:', fkError.message);
      }
    }
    
    console.log('迁移完成！');
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

addTaskIdToComments();
