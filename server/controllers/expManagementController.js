const db = require('../models');
const ExpLevel = db.ExpLevel;
const ExpLog = db.ExpLog;
const User = db.User;

// ==================== 经验值等级管理 ====================

// 获取所有经验值等级
exports.getAllExpLevels = async (req, res) => {
  try {
    const levels = await ExpLevel.findAll({
      order: [['level', 'ASC']]
    });
    
    res.json({ levels });
  } catch (error) {
    console.error('获取经验值等级列表失败:', error);
    res.status(500).json({ message: '获取经验值等级列表失败', error: error.message });
  }
};

// 获取单个经验值等级
exports.getExpLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await ExpLevel.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: '经验值等级不存在' });
    }
    
    res.json({ level });
  } catch (error) {
    console.error('获取经验值等级失败:', error);
    res.status(500).json({ message: '获取经验值等级失败', error: error.message });
  }
};

// 创建经验值等级
exports.createExpLevel = async (req, res) => {
  try {
    const { level, name, min_exp, max_exp, icon, color, privileges, description, point_bonus, moon_points_bonus, is_active } = req.body;
    
    if (!level || !name || min_exp === undefined) {
      return res.status(400).json({ message: '等级、名称和最低经验值为必填项' });
    }
    
    const existingLevel = await ExpLevel.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { level },
          { name }
        ]
      }
    });
    
    if (existingLevel) {
      return res.status(400).json({ message: '等级编号或等级名称已存在' });
    }
    
    const newLevel = await ExpLevel.create({
      level,
      name,
      min_exp,
      max_exp,
      icon,
      color: color || '#8b5cf6',
      privileges: privileges || {},
      description,
      point_bonus: point_bonus || 0,
      moon_points_bonus: moon_points_bonus || 0,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json({ level: newLevel });
  } catch (error) {
    console.error('创建经验值等级失败:', error);
    res.status(500).json({ message: '创建经验值等级失败', error: error.message });
  }
};

// 更新经验值等级
exports.updateExpLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, name, min_exp, max_exp, icon, color, privileges, description, point_bonus, moon_points_bonus, is_active } = req.body;
    
    const levelToUpdate = await ExpLevel.findByPk(id);
    if (!levelToUpdate) {
      return res.status(404).json({ message: '经验值等级不存在' });
    }
    
    if (level || name) {
      const existingLevel = await ExpLevel.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            level ? { level } : null,
            name ? { name } : null
          ].filter(Boolean),
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      
      if (existingLevel) {
        return res.status(400).json({ message: '等级编号或等级名称已存在' });
      }
    }
    
    await levelToUpdate.update({
      level: level !== undefined ? level : levelToUpdate.level,
      name: name !== undefined ? name : levelToUpdate.name,
      min_exp: min_exp !== undefined ? min_exp : levelToUpdate.min_exp,
      max_exp: max_exp !== undefined ? max_exp : levelToUpdate.max_exp,
      icon: icon !== undefined ? icon : levelToUpdate.icon,
      color: color !== undefined ? color : levelToUpdate.color,
      privileges: privileges !== undefined ? privileges : levelToUpdate.privileges,
      description: description !== undefined ? description : levelToUpdate.description,
      point_bonus: point_bonus !== undefined ? point_bonus : levelToUpdate.point_bonus,
      moon_points_bonus: moon_points_bonus !== undefined ? moon_points_bonus : levelToUpdate.moon_points_bonus,
      is_active: is_active !== undefined ? is_active : levelToUpdate.is_active
    });
    
    res.json({ level: levelToUpdate });
  } catch (error) {
    console.error('更新经验值等级失败:', error);
    res.status(500).json({ message: '更新经验值等级失败', error: error.message });
  }
};

// 删除经验值等级
exports.deleteExpLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const levelToDelete = await ExpLevel.findByPk(id);
    if (!levelToDelete) {
      return res.status(404).json({ message: '经验值等级不存在' });
    }
    
    await levelToDelete.destroy();
    
    res.json({ message: '经验值等级删除成功' });
  } catch (error) {
    console.error('删除经验值等级失败:', error);
    res.status(500).json({ message: '删除经验值等级失败', error: error.message });
  }
};

// ==================== 经验值记录管理 ====================

// 获取经验值记录列表
exports.getExpLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, reason_type, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    // 如果不是管理员，只能查看自己的经验记录
    if (req.user.role !== 'admin') {
      where.user_id = req.user.id;
    } else if (user_id) {
      where.user_id = user_id;
    }
    
    if (reason_type) {
      where.reason_type = reason_type;
    }
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at[db.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.created_at[db.Sequelize.Op.lte] = new Date(end_date);
      }
    }
    
    const { count, rows } = await ExpLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'uid', 'username', 'nickname', 'avatar'] },
        { model: User, as: 'operator', attributes: ['id', 'uid', 'username', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      expLogs: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取经验值记录失败:', error);
    res.status(500).json({ message: '获取经验值记录失败', error: error.message });
  }
};

// 手动调整用户经验值
exports.adjustUserExp = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { user_id, exp_change, reason, remark } = req.body;
    const operator_id = req.user?.id;
    
    if (!user_id || exp_change === undefined || !reason) {
      await transaction.rollback();
      return res.status(400).json({ message: '用户ID、经验值变化和原因为必填项' });
    }
    
    const user = await User.findByPk(user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: '用户不存在' });
    }
    
    const exp_before = user.exp || 0;
    const exp_after = Math.max(0, exp_before + exp_change);
    
    await user.update({ exp: exp_after }, { transaction });
    
    const expLog = await ExpLog.create({
      user_id,
      exp_change,
      exp_before,
      exp_after,
      reason,
      reason_type: 'admin',
      operator_id,
      remark
    }, { transaction });
    
    await transaction.commit();
    
    const newExpLog = await ExpLog.findByPk(expLog.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'uid', 'username', 'nickname', 'avatar'] },
        { model: User, as: 'operator', attributes: ['id', 'uid', 'username', 'nickname'] }
      ]
    });
    
    res.status(201).json({ expLog: newExpLog, user: { id: user.id, exp: exp_after } });
  } catch (error) {
    await transaction.rollback();
    console.error('调整用户经验值失败:', error);
    res.status(500).json({ message: '调整用户经验值失败', error: error.message });
  }
};

// 获取经验值统计
exports.getExpStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalExp = await User.sum('exp') || 0;
    const avgExp = totalUsers > 0 ? Math.round(totalExp / totalUsers) : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayExpLogs = await ExpLog.findAll({
      where: {
        created_at: {
          [db.Sequelize.Op.gte]: today,
          [db.Sequelize.Op.lt]: tomorrow
        }
      }
    });
    
    const todayExpChange = todayExpLogs.reduce((sum, log) => sum + log.exp_change, 0);
    const todayActiveUsers = new Set(todayExpLogs.map(log => log.user_id)).size;
    
    const levelStats = await ExpLevel.findAll({
      where: { is_active: true },
      attributes: ['id', 'level', 'name', 'min_exp', 'max_exp'],
      include: [{
        model: User,
        as: 'levelUsers',
        attributes: ['id']
      }]
    });
    
    const levelDistribution = levelStats.map(level => ({
      level: level.level,
      name: level.name,
      userCount: level.levelUsers ? level.levelUsers.length : 0
    }));
    
    res.json({
      stats: {
        totalUsers,
        totalExp,
        avgExp,
        todayExpChange,
        todayActiveUsers,
        levelDistribution
      }
    });
  } catch (error) {
    console.error('获取经验值统计失败:', error);
    res.status(500).json({ message: '获取经验值统计失败', error: error.message });
  }
};
