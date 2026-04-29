const db = require('../models');

async function queryRecords() {
  try {
    console.log('=== 查询打卡月球分记录 ===');
    const moonPointLogs = await db.MoonPointLog.findAll({
      where: { reason_type: 'check_in' },
      order: [['created_at', 'DESC']],
      limit: 20,
      attributes: ['user_id', 'points', 'reason', 'created_at']
    });
    
    console.log(`共找到 ${moonPointLogs.length} 条打卡月球分记录:`);
    moonPointLogs.forEach(log => {
      console.log(`用户ID: ${log.user_id} | 月球分: +${log.points} | 原因: ${log.reason} | 时间: ${log.created_at}`);
    });

    console.log('\n=== 查询登录经验值记录 ===');
    const loginExpLogs = await db.ExpLog.findAll({
      where: { reason_type: 'login' },
      order: [['created_at', 'DESC']],
      limit: 20,
      attributes: ['user_id', 'exp_change', 'reason', 'created_at']
    });
    
    console.log(`共找到 ${loginExpLogs.length} 条登录经验值记录:`);
    loginExpLogs.forEach(log => {
      console.log(`用户ID: ${log.user_id} | 经验值: +${log.exp_change} | 原因: ${log.reason} | 时间: ${log.created_at}`);
    });

    console.log('\n=== 查询打卡经验值记录 ===');
    const checkinExpLogs = await db.ExpLog.findAll({
      where: { reason_type: 'check_in' },
      order: [['created_at', 'DESC']],
      limit: 20,
      attributes: ['user_id', 'exp_change', 'reason', 'created_at']
    });
    
    console.log(`共找到 ${checkinExpLogs.length} 条打卡经验值记录:`);
    checkinExpLogs.forEach(log => {
      console.log(`用户ID: ${log.user_id} | 经验值: +${log.exp_change} | 原因: ${log.reason} | 时间: ${log.created_at}`);
    });

    console.log('\n=== 用户当前月球分和经验值 ===');
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'nickname', 'moon_points', 'exp']
    });
    
    users.forEach(user => {
      console.log(`用户ID: ${user.id} | 用户名: ${user.username} | 昵称: ${user.nickname} | 月球分: ${user.moon_points} | 经验值: ${user.exp}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

queryRecords();