const { sequelize } = require('./models');

async function addStatusColumn() {
  try {
    console.log('正在为 products 表添加 status 字段...');
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
    `);
    console.log('status 字段添加成功！');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('status 字段已存在，无需重复添加');
    } else {
      console.error('添加字段失败:', error);
    }
  }
}

addStatusColumn();