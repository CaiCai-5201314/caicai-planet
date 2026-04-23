const db = require('../models');
const User = db.User;
const MoonPointLog = db.MoonPointLog;
const Op = db.Sequelize.Op;

// 获取所有用户月球分信息（管理员）
exports.getAllUsersMoonPoints = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } },
        { uid: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'uid', 'username', 'nickname', 'avatar', 'moon_points', 'created_at'],
      order: [['moon_points', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户月球分列表失败:', error);
    res.status(500).json({ message: '获取用户月球分列表失败', error: error.message });
  }
};

// 获取所有月球分记录（管理员）
exports.getAllMoonPointLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id = '', reason_type = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (user_id) {
      where.user_id = user_id;
    }
    if (reason_type) {
      where.reason_type = reason_type;
    }

    const { count, rows: logs } = await MoonPointLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取月球分记录失败:', error);
    res.status(500).json({ message: '获取月球分记录失败', error: error.message });
  }
};

// 获取用户月球分信息
exports.getUserMoonPoints = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const user = await User.findByPk(user_id, {
      attributes: ['id', 'username', 'nickname', 'avatar', 'moon_points', 'moon_center_id']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('获取用户月球分信息失败:', error);
    res.status(500).json({ message: '获取用户月球分信息失败', error: error.message });
  }
};

// 获取用户月球分记录
exports.getUserMoonPointLogs = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { user_id };
    if (type) {
      where.reason_type = type;
    }
    
    const { count, rows } = await MoonPointLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      logs: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户月球分记录失败:', error);
    res.status(500).json({ message: '获取用户月球分记录失败', error: error.message });
  }
};

// 增加月球分
exports.addMoonPoints = async (req, res) => {
  try {
    const { user_id, points, reason, reason_type, related_id } = req.body;
    
    if (!user_id || !points || !reason) {
      return res.status(400).json({ message: '用户ID、分数和原因不能为空' });
    }
    
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 开启事务
    const transaction = await db.sequelize.transaction();
    
    try {
      // 更新用户月球分
      await user.update(
        { moon_points: user.moon_points + points },
        { transaction }
      );
      
      // 创建月球分记录
      await MoonPointLog.create({
        user_id,
        points,
        reason,
        reason_type: reason_type || 'other',
        related_id
      }, { transaction });
      
      await transaction.commit();
      
      res.json({ 
        message: '月球分增加成功', 
        user: { id: user.id, moon_points: user.moon_points + points }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('增加月球分失败:', error);
    res.status(500).json({ message: '增加月球分失败', error: error.message });
  }
};

// 减少月球分
exports.reduceMoonPoints = async (req, res) => {
  try {
    const { user_id, points, reason, reason_type, related_id } = req.body;
    
    if (!user_id || !points || !reason) {
      return res.status(400).json({ message: '用户ID、分数和原因不能为空' });
    }
    
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.moon_points < points) {
      return res.status(400).json({ message: '月球分不足' });
    }
    
    // 开启事务
    const transaction = await db.sequelize.transaction();
    
    try {
      // 更新用户月球分
      await user.update(
        { moon_points: user.moon_points - points },
        { transaction }
      );
      
      // 创建月球分记录
      await MoonPointLog.create({
        user_id,
        points: -points,
        reason,
        reason_type: reason_type || 'other',
        related_id
      }, { transaction });
      
      await transaction.commit();
      
      res.json({ 
        message: '月球分减少成功', 
        user: { id: user.id, moon_points: user.moon_points - points }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('减少月球分失败:', error);
    res.status(500).json({ message: '减少月球分失败', error: error.message });
  }
};

