const { Product, User, MoonPointLog, PurchaseRecord, CDK, CDKUse, ExpLog, FileStorage } = require('../models');
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
      include: [{
        model: CDK,
        as: 'cdk',
        constraints: false
      }],
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
      include: [{
        model: CDK,
        as: 'cdk',
        constraints: false
      }],
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
    const product = await Product.findByPk(id, {
      include: [{
        model: CDK,
        as: 'cdk',
        constraints: false
      }]
    });
    
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
    const { name, description, price, stock, icon, category, cdk_id, cdk_reward_type } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      icon,
      category,
      cdk_id,
      cdk_reward_type
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
    const { name, description, price, stock, icon, category, cdk_id, cdk_reward_type } = req.body;
    
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
      category,
      cdk_id,
      cdk_reward_type
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

// 发放CDK奖励的辅助函数
const grantCDKRewards = async (user, cdk, transaction, productName) => {
  const rewards = typeof cdk.rewards === 'string' ? JSON.parse(cdk.rewards) : cdk.rewards;
  const rewardsReceived = {};
  const db = require('../models');
  
  if (rewards.moon_points && rewards.moon_points > 0) {
    user.moon_points = (user.moon_points || 0) + rewards.moon_points;
    rewardsReceived.moon_points = rewards.moon_points;
    
    await MoonPointLog.create({
      user_id: user.id,
      points: rewards.moon_points,
      reason_type: 'cdk',
      reason: `购买商品: ${productName}`,
      created_at: new Date()
    }, { transaction });
  }

  if (rewards.exp && rewards.exp > 0) {
    user.exp = (user.exp || 0) + rewards.exp;
    rewardsReceived.exp = rewards.exp;
    
    await ExpLog.create({
      user_id: user.id,
      exp_change: rewards.exp,
      reason_type: 'cdk',
      reason: `购买商品: ${productName}`,
      created_at: new Date()
    }, { transaction });
  }

  if (rewards.items && Array.isArray(rewards.items)) {
    rewardsReceived.items = rewards.items;
  }

  if (rewards.file_ids && Array.isArray(rewards.file_ids)) {
    const validFiles = await FileStorage.findAll({
      where: {
        id: rewards.file_ids,
        status: 'active'
      }
    });
    
    if (validFiles.length > 0) {
      rewardsReceived.file_ids = validFiles.map(f => f.id);
      rewardsReceived.files = validFiles.map(f => ({
        id: f.id,
        name: f.file_name,
        file_type: f.file_type,
        url: `/api/file-storage/download/${f.id}`
      }));
    }
  }

  if (rewards.fixed_files && Array.isArray(rewards.fixed_files)) {
    const validFiles = await FileStorage.findAll({
      where: {
        id: rewards.fixed_files,
        status: 'active'
      }
    });
    
    if (validFiles.length > 0) {
      if (!rewardsReceived.file_ids) rewardsReceived.file_ids = [];
      if (!rewardsReceived.files) rewardsReceived.files = [];
      
      validFiles.forEach(f => {
        if (!rewardsReceived.file_ids.includes(f.id)) {
          rewardsReceived.file_ids.push(f.id);
          rewardsReceived.files.push({
            id: f.id,
            name: f.file_name,
            file_type: f.file_type,
            url: `/api/file-storage/download/${f.id}`,
            from_fixed: true
          });
        }
      });
    }
  }

  if (cdk.pool_type === 'random' && cdk.pool_id) {
    let poolFiles = await FileStorage.findAll({
      where: {
        pool_id: cdk.pool_id,
        status: 'active'
      }
    });
    
    if (poolFiles.length > 0) {
      const randomCount = 1;
      const shuffled = poolFiles.sort(() => 0.5 - Math.random());
      const selectedFiles = shuffled.slice(0, Math.min(randomCount, poolFiles.length));
      
      if (!rewardsReceived.file_ids) rewardsReceived.file_ids = [];
      if (!rewardsReceived.files) rewardsReceived.files = [];
      
      selectedFiles.forEach(f => {
        if (!rewardsReceived.file_ids.includes(f.id)) {
          rewardsReceived.file_ids.push(f.id);
          rewardsReceived.files.push({
            id: f.id,
            name: f.file_name,
            file_type: f.file_type,
            url: `/api/file-storage/download/${f.id}`,
            from_pool: true
          });
        }
      });
    }
  }

  await user.save({ transaction });

  await cdk.update({ used_count: cdk.used_count + 1 }, { transaction });
  
  if (cdk.used_count >= cdk.total_count - 1) {
    await cdk.update({ status: 'inactive' }, { transaction });
  }

  await CDKUse.create({
    cdk_id: cdk.id,
    user_id: user.id,
    used_at: new Date()
  }, { transaction });

  return rewardsReceived;
};

// 购买商品
exports.purchaseProduct = async (req, res) => {
  try {
    console.log('=== 购买商品请求开始 ===');
    console.log('请求体:', req.body);
    console.log('用户ID:', req.user.id);
    
    const { product_id } = req.body;
    const user_id = req.user.id;
    
    // 先不使用事务，简化逻辑
    const product = await Product.findByPk(product_id);
    
    console.log('查询到的商品:', product?.toJSON());
    
    if (!product) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }
    
    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: '商品已售罄' });
    }
    
    const user = await User.findByPk(user_id);
    console.log('查询到的用户:', user?.toJSON());
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    if (user.moon_points < product.price) {
      return res.status(400).json({ success: false, message: '月球分不足' });
    }
    
    console.log('开始更新用户月球分...');
    await user.update({ moon_points: user.moon_points - product.price });
    console.log('用户月球分更新成功');
    
    console.log('开始更新商品库存...');
    await product.update({ stock: product.stock - 1 });
    console.log('商品库存更新成功');
    
    console.log('开始创建月球分日志...');
    await MoonPointLog.create({
      user_id: user.id,
      points: -product.price,
      reason: `购买商品: ${product.name}`,
      reason_type: 'shop_purchase',
      related_id: product.id
    });
    console.log('月球分日志创建成功');
    
    console.log('开始创建购买记录...');
    const purchaseRecord = await PurchaseRecord.create({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      cdk_id: product.cdk_id,
      status: 'completed'
    });
    console.log('购买记录创建成功');
    
    // 只返回CDK信息，不自动发放奖励，让用户手动去CDK兑换页面兑换
    const response = {
      success: true,
      message: '购买成功'
    };

    if (product.cdk_id) {
      const cdk = await CDK.findByPk(product.cdk_id);
      if (cdk) {
        response.cdk = {
          id: cdk.id,
          code: cdk.code,
          description: cdk.description,
          type: cdk.type
        };
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('购买商品失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '购买商品失败' });
  }
};

// 获取用户购买记录（包含使用状态和CDK奖励）
exports.getUserPurchaseRecords = async (req, res) => {
  try {
    const user_id = req.user.id;

    const records = await PurchaseRecord.findAll({
      where: { user_id },
      include: [{
        model: Product,
        as: 'product',
        include: [{
          model: CDK,
          as: 'cdk',
          constraints: false
        }]
      }],
      order: [['purchased_at', 'DESC']],
      attributes: ['id', 'product_id', 'product_name', 'price', 'status', 'purchased_at']
    });

    const { DiceUsage, CDKUse } = require('../models');
    let usedPurchaseIds = [];
    let usedCdkIds = [];
    
    try {
      const usages = await DiceUsage.findAll({
        where: { user_id },
        attributes: ['purchase_record_id']
      });
      usedPurchaseIds = usages.map(u => u.purchase_record_id);
    } catch (e) {
      console.warn('DiceUsage表可能不存在:', e.message);
    }
    
    try {
      const cdkUses = await CDKUse.findAll({
        where: { user_id },
        attributes: ['cdk_id']
      });
      usedCdkIds = cdkUses.map(u => u.cdk_id);
    } catch (e) {
      console.warn('CDKUse表查询失败:', e.message);
    }

    const recordsWithData = records.map(record => {
      const recordJSON = record.toJSON();
      const cdk = recordJSON.product?.cdk;
      
      // 检查CDK是否已被当前用户使用
      let isCdkUsed = false;
      if (cdk && cdk.id && usedCdkIds.includes(cdk.id)) {
        isCdkUsed = true;
      }

      // 优先使用CDK使用状态，其次使用原来的使用状态
      const finalUsed = isCdkUsed || usedPurchaseIds.includes(recordJSON.id);

      return {
        ...recordJSON,
        used: finalUsed,
        cdk: cdk
      };
    });

    res.status(200).json({ success: true, records: recordsWithData });
  } catch (error) {
    console.error('获取购买记录失败:', error);
    res.status(500).json({ success: false, message: '获取购买记录失败' });
  }
};
