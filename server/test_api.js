const express = require('express');
const app = express();
const db = require('./models');
const { VirtualEvent, EventParticipant, User } = db;

// 模拟API调用
async function testGetEventParticipants(eventId) {
  try {
    console.log(`测试获取活动 ${eventId} 的参与者...`);
    
    const participants = await EventParticipant.findAll({
      where: { event_id: eventId },
      include: [{
        model: User,
        attributes: ['id', 'uid', 'username', 'email']
      }]
    });
    
    const formattedParticipants = participants.map(p => ({
      id: p.id,
      user_id: p.User ? p.User.id : null,
      user_uid: p.User ? p.User.uid : null,
      username: p.User ? p.User.username : '未知用户',
      email: p.User ? p.User.email : '',
      status: p.status,
      score: p.score,
      created_at: p.created_at
    }));
    
    console.log('查询结果:', JSON.stringify(formattedParticipants, null, 2));
    console.log('参与者数量:', formattedParticipants.length);
    
    return formattedParticipants;
  } catch (error) {
    console.error('API测试失败:', error);
    throw error;
  }
}

// 测试活动ID为6的参与者
testGetEventParticipants(6);