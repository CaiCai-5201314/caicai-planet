const db = require('../models');
const UserLevel = db.UserLevel;

// 获取所有账号等级
exports.getAllLevels = async (req, res) => {
  try {
    const levels = await UserLevel.findAll({
      order: [['level', 'ASC']]
    });
    res.json({ levels });
  } catch (error) {
    console.error('获取账号等级列表失败:', error);
    res.status(500).json({ message: '获取账号等级列表失败' });
  }
};

// 创建新的账号等级
exports.createLevel = async (req, res) => {
  try {
    const { name, level, required_exp, color, description } = req.body;
    
    const existingLevel = await UserLevel.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { name },
          { level }
        ]
      }
    });
    
    if (existingLevel) {
      return res.status(400).json({ message: '等级名称或等级数字已存在' });
    }
    
    const newLevel = await UserLevel.create({
      name,
      level,
      required_exp,
      color,
      description
    });
    
    res.status(201).json({ level: newLevel });
  } catch (error) {
    console.error('创建账号等级失败:', error);
    res.status(500).json({ message: '创建账号等级失败' });
  }
};

// 更新账号等级
exports.updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, required_exp, color, description } = req.body;
    
    const levelToUpdate = await UserLevel.findByPk(id);
    if (!levelToUpdate) {
      return res.status(404).json({ message: '账号等级不存在' });
    }
    
    // 检查是否与其他等级冲突
    const existingLevel = await UserLevel.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { name },
          { level }
        ],
        id: { [db.Sequelize.Op.ne]: id }
      }
    });
    
    if (existingLevel) {
      return res.status(400).json({ message: '等级名称或等级数字已存在' });
    }
    
    await levelToUpdate.update({
      name,
      level,
      required_exp,
      color,
      description
    });
    
    res.json({ level: levelToUpdate });
  } catch (error) {
    console.error('更新账号等级失败:', error);
    res.status(500).json({ message: '更新账号等级失败' });
  }
};

// 删除账号等级
exports.deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const levelToDelete = await UserLevel.findByPk(id);
    if (!levelToDelete) {
      return res.status(404).json({ message: '账号等级不存在' });
    }
    
    await levelToDelete.destroy();
    
    res.json({ message: '账号等级删除成功' });
  } catch (error) {
    console.error('删除账号等级失败:', error);
    res.status(500).json({ message: '删除账号等级失败' });
  }
};

// 获取单个账号等级
exports.getLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const level = await UserLevel.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: '账号等级不存在' });
    }
    
    res.json({ level });
  } catch (error) {
    console.error('获取账号等级失败:', error);
    res.status(500).json({ message: '获取账号等级失败' });
  }
};
