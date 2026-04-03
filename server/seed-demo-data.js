require('dotenv').config();
const { sequelize } = require('./models');
const seed = require('./seeders/demo-task-types');

async function runSeed() {
  try {
    console.log('开始创建演示数据...');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    await seed.up();
    
    console.log('演示数据创建完成！');
    process.exit(0);
  } catch (error) {
    console.error('创建演示数据失败:', error);
    process.exit(1);
  }
}

runSeed();
