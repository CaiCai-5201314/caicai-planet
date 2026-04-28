const { VirtualEvent, EventParticipant, User } = require('./models');

async function testFixedAPI() {
  try {
    // 测试获取活动参与者信息（使用正确的别名）
    const participants = await EventParticipant.findAll({
      where: { event_id: 6 },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'uid', 'username', 'email']
      }]
    });
    
    console.log('修复后查询成功！');
    console.log('参与者数量:', participants.length);
    console.log('参与者详情:', JSON.stringify(participants.map(p => ({
      id: p.id,
      user_id: p.User ? p.User.id : null,
      username: p.User ? p.User.username : '未知用户',
      email: p.User ? p.User.email : ''
    })), null, 2));
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFixedAPI();