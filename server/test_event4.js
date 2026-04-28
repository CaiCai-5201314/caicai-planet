const { EventParticipant, VirtualEvent } = require('./models');

async function checkEventParticipants() {
  try {
    // 检查活动ID为4的参与者
    const participants4 = await EventParticipant.findAll({
      where: { event_id: 4 }
    });
    console.log('活动ID为4的参与者:', JSON.stringify(participants4, null, 2));
    console.log('活动ID为4的参与者数量:', participants4.length);

    // 获取活动列表
    const events = await VirtualEvent.findAll({
      attributes: ['id', 'title']
    });
    console.log('\n活动列表:', JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('查询失败:', error);
  }
}

checkEventParticipants();