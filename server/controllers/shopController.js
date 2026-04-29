const { Product, User, MoonPointLog, PurchaseRecord } = require('../models');
const { Op } = require('sequelize');

// 获取商品列表（公共接口，只返回显示状态的商品）
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where = {
      status: 'active'
    };
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    
    const products = await Product.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
};

// 获取所有商品（管理员接口，包括隐藏的商品）
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    
    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    
    const products = await Product.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
};

// 获取单个商品
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('获取商品失败:', error);
    res.status(500).json({ success: false, message: '获取商品失败' });
  }
};

// 创建商品
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, icon, category } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      icon,
      category
    });
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({ success: false, message: '创建商品失败' });
  }
};

// 更新商品
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, icon, category } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    await product.update({
      name,
      description,
      price,
      stock,
      icon,
      category
    });
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({ success: false, message: '更新商品失败' });
  }
};

// 删除商品
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    await product.destroy();
    
    res.status(200).json({ success: true, message: '商品删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({ success: false, message: '删除商品失败' });
  }
};

// 切换商品状态（显示/隐藏）
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    await product.update({ status });
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('切换商品状态失败:', error);
    res.status(500).json({ success: false, message: '切换商品状态失败' });
  }
};

// 购买商品
exports.purchaseProduct = async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;
    
    // 查找商品
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    // 检查库存
    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: '商品已售罄' });
    }
    
    // 查找用户
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 检查月球分
    if (user.moon_points < product.price) {
      return res.status(400).json({ success: false, message: '月球分不足' });
    }
    
    // 开始事务
    const transaction = await Product.sequelize.transaction();
    
    try {
      // 扣除用户月球分
      await user.update(
        { moon_points: user.moon_points - product.price },
        { transaction }
      );
      
      // 减少商品库存
      await product.update(
        { stock: product.stock - 1 },
        { transaction }
      );
      
      // 记录购买记录
      await MoonPointLog.create({
        user_id: user.id,
        points: -product.price,
        reason: `购买商品: ${product.name}`,
        reason_type: 'shop_purchase',
        related_id: product.id
      }, { transaction });
      
      // 创建购买记录
      await PurchaseRecord.create({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        status: 'completed'
      }, { transaction });
      
      // 提交事务
      await transaction.commit();
      
      res.status(200).json({ success: true, message: '购买成功' });
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('购买商品失败:', error);
    res.status(500).json({ success: false, message: '购买商品失败' });
  }
};

// 获取用户购买记录（包含使用状态）
exports.getUserPurchaseRecords = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const records = await PurchaseRecord.findAll({
      where: { user_id },
      order: [['purchased_at', 'DESC']],
      attributes: ['id', 'product_id', 'product_name', 'price', 'status', 'purchased_at']
    });
    
    // 查询已使用的骰子记录
    const { DiceUsage } = require('../models');
    let usedPurchaseIds = [];
    try {
      const usages = await DiceUsage.findAll({
        where: { user_id },
        attributes: ['purchase_record_id']
      });
      usedPurchaseIds = usages.map(u => u.purchase_record_id);
    } catch (e) {
      console.warn('DiceUsage表可能不存在:', e.message);
    }
    
    // 添加使用状态到每条记录
    const recordsWithUsedStatus = records.map(record => ({
      ...record.toJSON(),
      used: usedPurchaseIds.includes(record.id)
    }));
    
    res.status(200).json({ success: true, records: recordsWithUsedStatus });
  } catch (error) {
    console.error('获取购买记录失败:', error);
    res.status(500).json({ success: false, message: '获取购买记录失败' });
  }
};