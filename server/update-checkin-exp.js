const db = require('./models');

async function updateCheckinExp() {
  try {
    console.log('开始更新打卡记录的经验值...');
    
    // 获取所有打卡记录
    const checkIns = await db.CheckIn.findAll();
    
    console.log(`找到 ${checkIns.length} 个打卡记录`);
    
    let updatedCount = 0;
    
    // 遍历打卡记录并更新经验值
    for (const checkIn of checkIns) {
      if (checkIn.exp_earned === 0) {
        console.log(`更新打卡记录 ${checkIn.id}：exp_earned 从 0 → 10`);
        await checkIn.update({ exp_earned: 10 });
        updatedCount++;
      }
    }
    
    console.log(`\n更新完成！共更新了 ${updatedCount} 个打卡记录的经验值`);
    process.exit(0);
    
  } catch (error) {
    console.error('更新打卡记录经验值失败:', error);
    process.exit(1);
  }
}

updateCheckinExp();
