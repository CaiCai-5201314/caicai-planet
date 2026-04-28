const { sequelize } = require('./models/index');

async function modifyTable() {
  try {
    // 连接到数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 执行SQL命令修改表结构
    await sequelize.query('ALTER TABLE virtual_events MODIFY COLUMN description LONGTEXT NOT NULL;');
    console.log('修改表结构成功');

    // 关闭连接
    await sequelize.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('修改表结构失败:', error);
    // 关闭连接
    if (sequelize) {
      await sequelize.close();
    }
  }
}

modifyTable();
