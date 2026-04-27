const db = require('../models');
const { VirtualEvent, EventParticipant, Achievement, UserAchievement, UserPreference, User, MoonPointLog, QA } = db;
const sequelize = db.sequelize;

// 虚拟活动相关功能
exports.getEvents = async (req, res) => {
  try {
    const events = await VirtualEvent.findAll({
      order: [['start_time', 'ASC']]
    });
    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('获取虚拟活动失败:', error);
    res.status(500).json({ success: false, message: '获取虚拟活动失败' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await VirtualEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error('获取活动详情失败:', error);
    res.status(500).json({ success: false, message: '获取活动详情失败' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, start_time, end_time, reward_type, reward_value } = req.body;
    
    const event = await VirtualEvent.create({
      title,
      description,
      start_time,
      end_time,
      status: new Date(start_time) > new Date() ? 'upcoming' : (new Date(end_time) < new Date() ? 'ended' : 'active'),
      reward_type,
      reward_value
    });
    
    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('创建虚拟活动失败:', error);
    res.status(500).json({ success: false, message: '创建虚拟活动失败' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_time, end_time, reward_type, reward_value } = req.body;
    
    const event = await VirtualEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    
    const status = new Date(start_time) > new Date() ? 'upcoming' : (new Date(end_time) < new Date() ? 'ended' : 'active');
    
    await event.update({
      title,
      description,
      start_time,
      end_time,
      status,
      reward_type,
      reward_value
    });
    
    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error('更新虚拟活动失败:', error);
    res.status(500).json({ success: false, message: '更新虚拟活动失败' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await VirtualEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      // 先删除相关的参与记录
      await EventParticipant.destroy({
        where: { event_id: id }
      }, { transaction });
      
      // 再删除活动
      await event.destroy({ transaction });
      
      // 提交事务
      await transaction.commit();
      
      res.status(200).json({ success: true, message: '活动删除成功' });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('删除虚拟活动失败:', error);
    res.status(500).json({ success: false, message: '删除虚拟活动失败' });
  }
};

exports.participateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    const event = await VirtualEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    
    // 检查是否已经参与
    const existingParticipant = await EventParticipant.findOne({
      where: { user_id, event_id: id }
    });
    
    if (existingParticipant) {
      return res.status(400).json({ success: false, message: '已经参与过此活动' });
    }
    
    // 创建参与记录
    const participant = await EventParticipant.create({
      user_id,
      event_id: id,
      status: 'registered',
      score: 0
    });
    
    res.status(201).json({ success: true, participant, message: '参与活动成功，请实际提交后等待管理员审核发放月球分' });
  } catch (error) {
    console.error('参与活动失败:', error);
    res.status(500).json({ success: false, message: '参与活动失败' });
  }
};

exports.getUserEvents = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const participants = await EventParticipant.findAll({
      where: { user_id },
      include: [{ model: VirtualEvent, as: 'event' }]
    });
    
    res.status(200).json({ success: true, participants });
  } catch (error) {
    console.error('获取用户活动失败:', error);
    res.status(500).json({ success: false, message: '获取用户活动失败' });
  }
};

// 成就相关功能
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll();
    res.status(200).json({ success: true, achievements });
  } catch (error) {
    console.error('获取成就失败:', error);
    res.status(500).json({ success: false, message: '获取成就失败' });
  }
};

exports.getUserAchievements = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const userAchievements = await UserAchievement.findAll({
      where: { user_id },
      include: [{ model: Achievement, as: 'achievement' }]
    });
    
    res.status(200).json({ success: true, userAchievements });
  } catch (error) {
    console.error('获取用户成就失败:', error);
    res.status(500).json({ success: false, message: '获取用户成就失败' });
  }
};

exports.createAchievement = async (req, res) => {
  try {
    const { name, description, icon, condition_type, condition_value, reward_points } = req.body;
    
    const achievement = await Achievement.create({
      name,
      description,
      icon,
      condition_type,
      condition_value,
      reward_points
    });
    
    res.status(201).json({ success: true, achievement });
  } catch (error) {
    console.error('创建成就失败:', error);
    res.status(500).json({ success: false, message: '创建成就失败' });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, condition_type, condition_value, reward_points } = req.body;
    
    const achievement = await Achievement.findByPk(id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: '成就不存在' });
    }
    
    await achievement.update({
      name,
      description,
      icon,
      condition_type,
      condition_value,
      reward_points
    });
    
    res.status(200).json({ success: true, achievement });
  } catch (error) {
    console.error('更新成就失败:', error);
    res.status(500).json({ success: false, message: '更新成就失败' });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const achievement = await Achievement.findByPk(id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: '成就不存在' });
    }
    
    await achievement.destroy();
    res.status(200).json({ success: true, message: '成就删除成功' });
  } catch (error) {
    console.error('删除成就失败:', error);
    res.status(500).json({ success: false, message: '删除成就失败' });
  }
};

// 用户偏好设置相关功能
exports.getUserPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    let preferences = await UserPreference.findOne({ where: { user_id } });
    
    if (!preferences) {
      // 如果没有设置，创建默认设置
      preferences = await UserPreference.create({
        user_id,
        theme: 'light',
        layout: 'default'
      });
    }
    
    res.status(200).json({ success: true, preferences });
  } catch (error) {
    console.error('获取用户偏好设置失败:', error);
    res.status(500).json({ success: false, message: '获取用户偏好设置失败' });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { theme, layout } = req.body;
    
    let preferences = await UserPreference.findOne({ where: { user_id } });
    
    if (!preferences) {
      // 如果没有设置，创建新设置
      preferences = await UserPreference.create({
        user_id,
        theme,
        layout
      });
    } else {
      // 更新现有设置
      await preferences.update({ theme, layout });
    }
    
    res.status(200).json({ success: true, preferences });
  } catch (error) {
    console.error('更新用户偏好设置失败:', error);
    res.status(500).json({ success: false, message: '更新用户偏好设置失败' });
  }
};

// QA相关功能
exports.getQa = async (req, res) => {
  try {
    const qa = await QA.findAll();
    res.status(200).json({ success: true, qa });
  } catch (error) {
    console.error('获取常见问题失败:', error);
    res.status(500).json({ success: false, message: '获取常见问题失败' });
  }
};

exports.createQa = async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    const qa = await QA.create({
      question,
      answer
    });
    
    res.status(201).json({ success: true, qa });
  } catch (error) {
    console.error('创建常见问题失败:', error);
    res.status(500).json({ success: false, message: '创建常见问题失败' });
  }
};

exports.updateQa = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    
    const qa = await QA.findByPk(id);
    if (!qa) {
      return res.status(404).json({ success: false, message: '常见问题不存在' });
    }
    
    await qa.update({
      question,
      answer
    });
    
    res.status(200).json({ success: true, qa });
  } catch (error) {
    console.error('更新常见问题失败:', error);
    res.status(500).json({ success: false, message: '更新常见问题失败' });
  }
};

exports.deleteQa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const qa = await Qa.findByPk(id);
    if (!qa) {
      return res.status(404).json({ success: false, message: '问题不存在' });
    }
    
    await qa.destroy();
    res.status(200).json({ success: true, message: '问题删除成功' });
  } catch (error) {
    console.error('删除问题失败:', error);
    res.status(500).json({ success: false, message: '删除问题失败' });
  }
};

exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    
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
    
    res.status(200).json({ success: true, participants: formattedParticipants });
  } catch (error) {
    console.error('获取活动参与者失败:', error);
    res.status(500).json({ success: false, message: '获取活动参与者失败' });
  }
};

// 实验室设置相关功能
let labSettings = {
  labEnabled: true,
  eventMaxParticipants: 100,
  achievementThreshold: 5,
  rewardMultiplier: 1.0,
  customMessage: '欢迎来到星球实验室！',
  // 骰子游戏设置
  diceEnabled: true,
  diceMaxRollsPerHour: 1,
  diceSuccessReward: 0,
  diceSuccessMessage: '恭喜你！投中了 {value} 点，允许做你想做的事情！',
  diceFailureMessage: '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！'
};

// 骰子游戏记录
let diceRecords = [];

exports.getSettings = async (req, res) => {
  try {
    res.status(200).json({ success: true, settings: labSettings });
  } catch (error) {
    console.error('获取实验室设置失败:', error);
    res.status(500).json({ success: false, message: '获取实验室设置失败' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { labEnabled, eventMaxParticipants, achievementThreshold, rewardMultiplier, customMessage, diceEnabled, diceMaxRollsPerHour, diceSuccessReward, diceSuccessMessage, diceFailureMessage } = req.body;
    
    labSettings = {
      labEnabled: labEnabled !== undefined ? labEnabled : labSettings.labEnabled,
      eventMaxParticipants: eventMaxParticipants !== undefined ? eventMaxParticipants : labSettings.eventMaxParticipants,
      achievementThreshold: achievementThreshold !== undefined ? achievementThreshold : labSettings.achievementThreshold,
      rewardMultiplier: rewardMultiplier !== undefined ? rewardMultiplier : labSettings.rewardMultiplier,
      customMessage: customMessage !== undefined ? customMessage : labSettings.customMessage,
      // 骰子游戏设置
      diceEnabled: diceEnabled !== undefined ? diceEnabled : labSettings.diceEnabled,
      diceMaxRollsPerHour: diceMaxRollsPerHour !== undefined ? diceMaxRollsPerHour : labSettings.diceMaxRollsPerHour,
      diceSuccessReward: diceSuccessReward !== undefined ? diceSuccessReward : labSettings.diceSuccessReward,
      diceSuccessMessage: diceSuccessMessage !== undefined ? diceSuccessMessage : labSettings.diceSuccessMessage,
      diceFailureMessage: diceFailureMessage !== undefined ? diceFailureMessage : labSettings.diceFailureMessage
    };
    
    res.status(200).json({ success: true, settings: labSettings, message: '设置更新成功' });
  } catch (error) {
    console.error('更新实验室设置失败:', error);
    res.status(500).json({ success: false, message: '更新实验室设置失败' });
  }
};

// 骰子游戏记录相关功能
exports.saveDiceRecord = async (req, res) => {
  try {
    const { user_id, username, difficulty, target_numbers, result, success, success_message } = req.body;
    
    const record = {
      id: Date.now(),
      user_id,
      username,
      difficulty,
      target_numbers,
      result,
      success,
      success_message,
      created_at: new Date().toISOString()
    };
    
    diceRecords.unshift(record); // 添加到数组开头，最新的记录在前面
    
    // 限制记录数量，只保留最近1000条
    if (diceRecords.length > 1000) {
      diceRecords = diceRecords.slice(0, 1000);
    }
    
    res.status(201).json({ success: true, record });
  } catch (error) {
    console.error('保存骰子游戏记录失败:', error);
    res.status(500).json({ success: false, message: '保存骰子游戏记录失败' });
  }
};

exports.getDiceRecords = async (req, res) => {
  try {
    res.status(200).json({ success: true, records: diceRecords });
  } catch (error) {
    console.error('获取骰子游戏记录失败:', error);
    res.status(500).json({ success: false, message: '获取骰子游戏记录失败' });
  }
};
