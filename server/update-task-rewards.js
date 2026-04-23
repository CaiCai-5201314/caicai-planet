const db = require('./models');

async function updateTaskRewards() {
  try {
    console.log('开始更新任务积分...');
    
    // 获取所有任务
    const tasks = await db.Task.findAll();
    
    console.log(`找到 ${tasks.length} 个任务`);
    
    let updatedCount = 0;
    
    // 遍历任务并更新积分
    for (const task of tasks) {
      let newReward = task.reward; // 默认为当前积分
      
      // 根据难度设置新积分
      if (task.difficulty === 'easy') {
        newReward = 2;
      } else if (task.difficulty === 'medium') {
        newReward = 3;
      } else if (task.difficulty === 'hard') {
        newReward = 5;
      }
      
      // 如果积分需要更新
      if (task.reward !== newReward) {
        console.log(`更新任务 ${task.id} (${task.title})：难度 ${task.difficulty}，旧积分 ${task.reward} → 新积分 ${newReward}`);
        await task.update({ reward: newReward });
        updatedCount++;
      }
    }
    
    console.log(`\n更新完成！共更新了 ${updatedCount} 个任务的积分`);
    process.exit(0);
    
  } catch (error) {
    console.error('更新任务积分失败:', error);
    process.exit(1);
  }
}

updateTaskRewards();
