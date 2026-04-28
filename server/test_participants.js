const { EventParticipant } = require('./models');

async function checkParticipants() {
  try {
    const participants = await EventParticipant.findAll();
    console.log('参与者记录:', JSON.stringify(participants, null, 2));
    console.log('参与者数量:', participants.length);
  } catch (error) {
    console.error('查询失败:', error);
  }
}

checkParticipants();