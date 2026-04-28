const { VirtualEvent, EventParticipant } = require('./models');

async function debugEventsAndParticipants() {
  try {
    // 获取所有活动
    const events = await VirtualEvent.findAll({
      attributes: ['id', 'title', 'status']
    });
    console.log('=== 活动列表 ===');
    events.forEach(event => {
      console.log(`活动ID: ${event.id}, 标题: ${event.title}, 状态: ${event.status}`);
    });

    // 获取所有参与者记录
    const participants = await EventParticipant.findAll({
      attributes: ['id', 'user_id', 'event_id', 'status']
    });
    console.log('\n=== 参与者记录 ===');
    participants.forEach(p => {
      console.log(`参与者ID: ${p.id}, 用户ID: ${p.user_id}, 活动ID: ${p.event_id}, 状态: ${p.status}`);
    });

    // 检查每个活动的参与者数量
    console.log('\n=== 每个活动的参与者数量 ===');
    for (const event of events) {
      const count = await EventParticipant.count({
        where: { event_id: event.id }
      });
      console.log(`活动ID: ${event.id}, 标题: ${event.title}, 参与者数量: ${count}`);
    }
  } catch (error) {
    console.error('查询失败:', error);
  }
}

debugEventsAndParticipants();