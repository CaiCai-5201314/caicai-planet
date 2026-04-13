const db = require('../models');
const Announcement = db.Announcement;

// 创建公告
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, level } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }
    
    const announcement = await Announcement.create({
      title,
      content,
      level: level || 'light',
      status: 'active'
    });
    
    res.status(201).json({ 
      success: true,
      message: '公告创建成功',
      data: announcement 
    });
  } catch (error) {
    console.error('创建公告失败:', error);
    res.status(500).json({ message: '创建公告失败' });
  }
};

// 获取公告列表
exports.getAnnouncements = async (req, res) => {
  try {
    const { status, level, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const where = {};
    if (status) where.status = status;
    if (level) where.level = level;
    
    const { count, rows } = await Announcement.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset
    });
    
    const totalPages = Math.ceil(count / limitNum);
    
    res.status(200).json({ 
      success: true,
      announcements: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages
      }
    });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    res.status(500).json({ message: '获取公告列表失败' });
  }
};

// 获取单个公告
exports.getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: '公告不存在' });
    }
    
    res.status(200).json({ 
      success: true,
      data: announcement 
    });
  } catch (error) {
    console.error('获取公告失败:', error);
    res.status(500).json({ message: '获取公告失败' });
  }
};

// 更新公告
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, level, status } = req.body;
    
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: '公告不存在' });
    }
    
    await announcement.update({
      title: title || announcement.title,
      content: content || announcement.content,
      level: level || announcement.level,
      status: status || announcement.status,
      updated_at: new Date()
    });
    
    res.status(200).json({ 
      success: true,
      message: '公告更新成功',
      data: announcement 
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    res.status(500).json({ message: '更新公告失败' });
  }
};

// 删除公告
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: '公告不存在' });
    }
    
    await announcement.destroy();
    
    res.status(200).json({ 
      success: true,
      message: '公告删除成功' 
    });
  } catch (error) {
    console.error('删除公告失败:', error);
    res.status(500).json({ message: '删除公告失败' });
  }
};

// 获取活跃的公告（前端使用）
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // 获取所有活跃公告
    const allAnnouncements = await Announcement.findAll({
      where: { status: 'active' },
      order: [['created_at', 'DESC']]
    });
    
    if (!userId) {
      // 未登录用户不返回任何公告
      return res.status(200).json({ 
        success: true,
        data: [] 
      });
    }
    
    // 获取用户已读的公告ID
    const readAnnouncements = await db.AnnouncementRead.findAll({
      where: { user_id: userId },
      attributes: ['announcement_id']
    });
    
    const readIds = readAnnouncements.map(item => item.announcement_id);
    
    // 为每个公告添加已读状态
    const announcementsWithReadStatus = allAnnouncements.map(ann => ({
      ...ann.toJSON(),
      is_read: readIds.includes(ann.id)
    }));
    
    res.status(200).json({ 
      success: true,
      data: announcementsWithReadStatus 
    });
  } catch (error) {
    console.error('获取活跃公告失败:', error);
    res.status(500).json({ message: '获取活跃公告失败' });
  }
};

// 标记公告为已读
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { announcementId } = req.body;
    
    if (!userId || !announcementId) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    // 检查公告是否存在
    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: '公告不存在' });
    }
    
    // 标记为已读（使用upsert避免重复）
    await db.AnnouncementRead.upsert({
      user_id: userId,
      announcement_id: announcementId,
      read_at: new Date()
    });
    
    res.status(200).json({ 
      success: true,
      message: '公告已标记为已读' 
    });
  } catch (error) {
    console.error('标记公告已读失败:', error);
    res.status(500).json({ message: '标记公告已读失败' });
  }
};