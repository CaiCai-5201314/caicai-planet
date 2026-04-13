const db = require('../models');
const MoonCenter = db.MoonCenter;
const User = db.User;

// 获取所有月球分中心
exports.getAllMoonCenters = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    const { count, rows } = await MoonCenter.findAndCountAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      moonCenters: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取月球分中心列表失败:', error);
    res.status(500).json({ message: '获取月球分中心列表失败', error: error.message });
  }
};

// 获取单个月球分中心
exports.getMoonCenter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const moonCenter = await MoonCenter.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'nickname', 'avatar'] },
        { model: User, as: 'users', attributes: ['id', 'username', 'nickname', 'avatar', 'exp'] }
      ]
    });
    
    if (!moonCenter) {
      return res.status(404).json({ message: '月球分中心不存在' });
    }
    
    res.json({ moonCenter });
  } catch (error) {
    console.error('获取月球分中心失败:', error);
    res.status(500).json({ message: '获取月球分中心失败', error: error.message });
  }
};

// 创建月球分中心
exports.createMoonCenter = async (req, res) => {
  try {
    const { name, code, region, description, manager_id, max_users, resource_allocation, status, settings } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ message: '分中心名称和代码为必填项' });
    }
    
    const existingCode = await MoonCenter.findOne({ where: { code } });
    if (existingCode) {
      return res.status(400).json({ message: '分中心代码已存在' });
    }
    
    const moonCenter = await MoonCenter.create({
      name,
      code,
      region,
      description,
      manager_id,
      max_users: max_users || 1000,
      resource_allocation: resource_allocation || {},
      status: status || 'active',
      settings: settings || {}
    });
    
    const newMoonCenter = await MoonCenter.findByPk(moonCenter.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ]
    });
    
    res.status(201).json({ moonCenter: newMoonCenter });
  } catch (error) {
    console.error('创建月球分中心失败:', error);
    res.status(500).json({ message: '创建月球分中心失败', error: error.message });
  }
};

// 更新月球分中心
exports.updateMoonCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, region, description, manager_id, max_users, resource_allocation, status, settings } = req.body;
    
    const moonCenter = await MoonCenter.findByPk(id);
    if (!moonCenter) {
      return res.status(404).json({ message: '月球分中心不存在' });
    }
    
    if (code && code !== moonCenter.code) {
      const existingCode = await MoonCenter.findOne({ where: { code } });
      if (existingCode) {
        return res.status(400).json({ message: '分中心代码已存在' });
      }
    }
    
    await moonCenter.update({
      name: name || moonCenter.name,
      code: code || moonCenter.code,
      region: region !== undefined ? region : moonCenter.region,
      description: description !== undefined ? description : moonCenter.description,
      manager_id: manager_id !== undefined ? manager_id : moonCenter.manager_id,
      max_users: max_users !== undefined ? max_users : moonCenter.max_users,
      resource_allocation: resource_allocation !== undefined ? resource_allocation : moonCenter.resource_allocation,
      status: status || moonCenter.status,
      settings: settings !== undefined ? settings : moonCenter.settings
    });
    
    const updatedMoonCenter = await MoonCenter.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ]
    });
    
    res.json({ moonCenter: updatedMoonCenter });
  } catch (error) {
    console.error('更新月球分中心失败:', error);
    res.status(500).json({ message: '更新月球分中心失败', error: error.message });
  }
};

// 删除月球分中心
exports.deleteMoonCenter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const moonCenter = await MoonCenter.findByPk(id);
    if (!moonCenter) {
      return res.status(404).json({ message: '月球分中心不存在' });
    }
    
    const userCount = await User.count({ where: { moon_center_id: id } });
    if (userCount > 0) {
      return res.status(400).json({ message: '该分中心下还有用户，无法删除' });
    }
    
    await moonCenter.destroy();
    
    res.json({ message: '月球分中心删除成功' });
  } catch (error) {
    console.error('删除月球分中心失败:', error);
    res.status(500).json({ message: '删除月球分中心失败', error: error.message });
  }
};

// 获取月球分中心统计
exports.getMoonCenterStats = async (req, res) => {
  try {
    const totalCenters = await MoonCenter.count();
    const activeCenters = await MoonCenter.count({ where: { status: 'active' } });
    const inactiveCenters = await MoonCenter.count({ where: { status: 'inactive' } });
    const maintenanceCenters = await MoonCenter.count({ where: { status: 'maintenance' } });
    
    const allCenters = await MoonCenter.findAll({
      attributes: ['id', 'name', 'current_users', 'max_users']
    });
    
    const totalUsers = allCenters.reduce((sum, center) => sum + center.current_users, 0);
    const totalCapacity = allCenters.reduce((sum, center) => sum + center.max_users, 0);
    
    res.json({
      stats: {
        totalCenters,
        activeCenters,
        inactiveCenters,
        maintenanceCenters,
        totalUsers,
        totalCapacity
      }
    });
  } catch (error) {
    console.error('获取月球分中心统计失败:', error);
    res.status(500).json({ message: '获取月球分中心统计失败', error: error.message });
  }
};
