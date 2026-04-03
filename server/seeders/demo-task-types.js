const { TaskType, TaskTopic } = require('../models');

module.exports = {
  up: async () => {
    // 创建男版专区类型
    const maleSports = await TaskType.create({
      name: '运动挑战',
      description: '参与各种运动挑战，提升身体素质',
      gender: 'male',
      sortOrder: 1,
      isActive: true
    });
    
    const maleTech = await TaskType.create({
      name: '科技探索',
      description: '探索最新科技产品和技术',
      gender: 'male',
      sortOrder: 2,
      isActive: true
    });

    // 创建女版专区类型
    const femaleBeauty = await TaskType.create({
      name: '美容护肤',
      description: '分享美容护肤心得，参与护肤挑战',
      gender: 'female',
      sortOrder: 1,
      isActive: true
    });
    
    const femaleCrafts = await TaskType.create({
      name: '创意手工',
      description: '展示手工制作作品，参与创意挑战',
      gender: 'female',
      sortOrder: 2,
      isActive: true
    });

    // 创建通用类型
    const generalDaily = await TaskType.create({
      name: '日常任务',
      description: '日常小挑战，轻松完成',
      gender: 'both',
      sortOrder: 0,
      isActive: true
    });

    // 添加话题
    await TaskTopic.bulkCreate([
      // 运动挑战话题
      { taskTypeId: maleSports.id, name: '跑步打卡', description: '每天跑步打卡，记录里程', sortOrder: 1, isActive: true },
      { taskTypeId: maleSports.id, name: '力量训练', description: '健身力量训练挑战', sortOrder: 2, isActive: true },
      { taskTypeId: maleSports.id, name: '户外活动', description: '登山、骑行等户外活动', sortOrder: 3, isActive: true },
      
      // 科技探索话题
      { taskTypeId: maleTech.id, name: '数码评测', description: '评测最新数码产品', sortOrder: 1, isActive: true },
      { taskTypeId: maleTech.id, name: '编程学习', description: '学习编程技术和分享', sortOrder: 2, isActive: true },
      { taskTypeId: maleTech.id, name: '游戏攻略', description: '分享游戏心得和攻略', sortOrder: 3, isActive: true },
      
      // 美容护肤话题
      { taskTypeId: femaleBeauty.id, name: '护肤心得', description: '分享护肤经验和技巧', sortOrder: 1, isActive: true },
      { taskTypeId: femaleBeauty.id, name: '化妆教程', description: '分享化妆技巧和教程', sortOrder: 2, isActive: true },
      { taskTypeId: femaleBeauty.id, name: '产品推荐', description: '推荐好用的美妆产品', sortOrder: 3, isActive: true },
      
      // 创意手工话题
      { taskTypeId: femaleCrafts.id, name: 'DIY制作', description: '手工DIY制作分享', sortOrder: 1, isActive: true },
      { taskTypeId: femaleCrafts.id, name: '编织作品', description: '编织作品展示和教程', sortOrder: 2, isActive: true },
      { taskTypeId: femaleCrafts.id, name: '绘画创作', description: '绘画作品分享', sortOrder: 3, isActive: true },
      
      // 日常任务话题
      { taskTypeId: generalDaily.id, name: '阅读打卡', description: '每天阅读打卡', sortOrder: 1, isActive: true },
      { taskTypeId: generalDaily.id, name: '早起挑战', description: '早起打卡挑战', sortOrder: 2, isActive: true },
      { taskTypeId: generalDaily.id, name: '健康饮食', description: '健康饮食记录', sortOrder: 3, isActive: true }
    ]);

    console.log('演示任务类型和话题已创建');
  },

  down: async () => {
    await TaskTopic.destroy({ where: {} });
    await TaskType.destroy({ where: {} });
  }
};
