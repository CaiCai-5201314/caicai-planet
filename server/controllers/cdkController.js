const db = require('../models');
const { CDK, CDKUse, User, ExpLog, MoonPointLog, FileStorage, Sequelize } = db;
const { sequelize } = db;
const { Op } = Sequelize;
const fs = require('fs');
const path = require('path');

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const generateBatchCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code + Date.now().toString(36).toUpperCase();
};

exports.generateCDK = async (req, res) => {
  let transaction;
  try {
    console.log('=== CDK Generate Controller Called ===');
    console.log('User:', req.user?.id, req.user?.username);
    console.log('Body:', JSON.stringify(req.body));
    
    transaction = await sequelize.transaction();
    
    const { 
      type = 'single', 
      count = 1, 
      rewards, 
      pool_info,
      selected_files,
      expire_at,
      min_level = 0,
      min_moon_points = 0,
      max_use_per_user = 1,
      description = ''
    } = req.body;

    console.log('Parsed params:', { type, count, rewards, expire_at, min_level, min_moon_points, max_use_per_user, description });

    if (!rewards) {
      return res.status(400).json({ success: false, message: '奖励内容不能为空' });
    }

    if (type === 'single' && count !== 1) {
      return res.status(400).json({ success: false, message: '单码类型只能生成1个' });
    }

    const batchCode = type === 'batch' ? generateBatchCode() : null;
    const createdBy = req.user?.id || null;
    const codes = [];

    console.log('Starting to generate', count, 'CDK codes...');

    for (let i = 0; i < count; i++) {
      let code;
      do {
        code = generateCode();
      } while (await CDK.findOne({ where: { code }, transaction }));

      console.log('Creating CDK:', code);

      let rewardsData;
      try {
        rewardsData = typeof rewards === 'string' ? JSON.parse(rewards) : rewards;
        console.log('Rewards data after parsing:', JSON.stringify(rewardsData));
      } catch (e) {
        console.error('Failed to parse rewards:', e);
        throw new Error('Invalid rewards format: must be valid JSON');
      }
      
      const cdkData = {
        code: code,
        type: type,
        batch_code: batchCode,
        rewards: typeof rewardsData === 'string' ? rewardsData : JSON.stringify(rewardsData),
        total_count: type === 'batch' ? parseInt(count) : 1,
        used_count: 0,
        status: 'active',
        max_use_per_user: parseInt(max_use_per_user) || 1
      };

      if (pool_info && pool_info.type && pool_info.pool_id) {
        cdkData.pool_type = pool_info.type;
        cdkData.pool_id = pool_info.pool_id;
        
        const pool = await db.Pool.findByPk(pool_info.pool_id);
        if (pool) {
          cdkData.rewards = JSON.stringify({
            ...rewardsData,
            random_pool: {
              id: pool.id,
              name: pool.name,
              type: pool.type,
              random_count: pool.random_count
            }
          });
        }
        console.log('Pool info added:', pool_info);
      }

      if (selected_files && Array.isArray(selected_files) && selected_files.length > 0) {
        const fileIds = selected_files.map(id => parseInt(id)).filter(id => !isNaN(id));
        cdkData.pool_type = 'fixed';
        cdkData.pool_id = null;
        cdkData.rewards = JSON.stringify({
          ...rewardsData,
          fixed_files: fileIds
        });
        console.log('Fixed files added:', fileIds);
      }

      if (expire_at) {
        cdkData.expire_at = new Date(expire_at);
        console.log('Expire at:', cdkData.expire_at);
      }

      if (min_level !== undefined && min_level !== null) {
        cdkData.min_level = parseInt(min_level) || 0;
      }

      if (min_moon_points !== undefined && min_moon_points !== null) {
        cdkData.min_moon_points = parseFloat(min_moon_points) || 0;
      }

      if (description) {
        cdkData.description = description;
      }

      if (createdBy) {
        cdkData.created_by = createdBy;
      }

      console.log('CDK data to create:', JSON.stringify(cdkData));

      const cdk = await CDK.create(cdkData, { transaction });

      console.log('CDK created successfully:', cdk.id);

      codes.push({
        id: cdk.id,
        code: cdk.code,
        type: cdk.type,
        rewards: cdk.rewards,
        expire_at: cdk.expire_at
      });
    }

    await transaction.commit();
    console.log('CDK generation completed successfully, created:', codes.length);

    res.status(200).json({
      success: true,
      message: `成功生成${count}个CDK`,
      codes,
      batch_code: batchCode
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('=== 生成CDK失败详情 ===');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ success: false, message: '生成CDK失败: ' + error.message });
  }
};

exports.getCDKList = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status, 
      code, 
      batch_code,
      start_date,
      end_date
    } = req.query;

    const where = {};
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (code) where.code = { [Op.like]: `%${code}%` };
    if (batch_code) where.batch_code = batch_code;
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.created_at) where.created_at = {};
      where.created_at[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await CDK.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: CDKUse,
        as: 'uses',
        attributes: ['id', 'user_id', 'used_at']
      }]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取CDK列表失败:', error);
    res.status(500).json({ success: false, message: '获取CDK列表失败' });
  }
};

exports.getCDKById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cdk = await CDK.findByPk(id, {
      include: [{
        model: CDKUse,
        as: 'uses',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }]
      }]
    });

    if (!cdk) {
      return res.status(404).json({ success: false, message: 'CDK不存在' });
    }

    res.status(200).json({ success: true, data: cdk });
  } catch (error) {
    console.error('获取CDK详情失败:', error);
    res.status(500).json({ success: false, message: '获取CDK详情失败' });
  }
};

exports.updateCDK = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, expire_at, description, min_level, min_moon_points, max_use_per_user } = req.body;

    const cdk = await CDK.findByPk(id, { transaction });
    if (!cdk) {
      return res.status(404).json({ success: false, message: 'CDK不存在' });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (expire_at !== undefined) updates.expire_at = expire_at ? new Date(expire_at) : null;
    if (description !== undefined) updates.description = description;
    if (min_level !== undefined) updates.min_level = min_level;
    if (min_moon_points !== undefined) updates.min_moon_points = min_moon_points;
    if (max_use_per_user !== undefined) updates.max_use_per_user = max_use_per_user;

    await cdk.update(updates, { transaction });
    await transaction.commit();

    res.status(200).json({ success: true, message: 'CDK更新成功', data: cdk });
  } catch (error) {
    await transaction.rollback();
    console.error('更新CDK失败:', error);
    res.status(500).json({ success: false, message: '更新CDK失败' });
  }
};

exports.deleteCDK = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const cdk = await CDK.findByPk(id, { transaction });
    if (!cdk) {
      return res.status(404).json({ success: false, message: 'CDK不存在' });
    }

    await CDKUse.destroy({ where: { cdk_id: id }, transaction });
    await cdk.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ success: true, message: 'CDK删除成功' });
  } catch (error) {
    await transaction.rollback();
    console.error('删除CDK失败:', error);
    res.status(500).json({ success: false, message: '删除CDK失败' });
  }
};

exports.exchangeCDK = async (req, res) => {
  let transaction;
  try {
    console.log('=== CDK兑换请求开始 ===');
    console.log('用户ID:', req.user?.id);
    console.log('请求体:', JSON.stringify(req.body));
    
    transaction = await sequelize.transaction();
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ success: false, message: '请输入CDK码' });
    }

    console.log('步骤1: 查询CDK...');
    const cdk = await CDK.findOne({ 
      where: { code: code.toUpperCase().trim() },
      transaction 
    });
    console.log('步骤1完成: CDK查询结果:', cdk ? `ID: ${cdk.id}, 状态: ${cdk.status}` : 'null');

    if (!cdk) {
      return res.status(404).json({ success: false, message: 'CDK不存在' });
    }

    if (cdk.status !== 'active') {
      return res.status(400).json({ success: false, message: 'CDK已失效' });
    }

    if (cdk.expire_at && new Date() > cdk.expire_at) {
      await cdk.update({ status: 'expired' }, { transaction });
      return res.status(400).json({ success: false, message: 'CDK已过期' });
    }

    if (cdk.used_count >= cdk.total_count) {
      await cdk.update({ status: 'inactive' }, { transaction });
      return res.status(400).json({ success: false, message: 'CDK已用完' });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    if (cdk.min_level > 0 && (user.level || 0) < cdk.min_level) {
      return res.status(400).json({ success: false, message: `需要等级${cdk.min_level}才能兑换` });
    }

    if (cdk.min_moon_points > 0 && (user.moon_points || 0) < cdk.min_moon_points) {
      return res.status(400).json({ success: false, message: `需要${cdk.min_moon_points}月球分才能兑换` });
    }

    const userUseCount = await CDKUse.count({
      where: { user_id: userId, cdk_id: cdk.id },
      transaction
    });

    if (userUseCount >= cdk.max_use_per_user) {
      return res.status(400).json({ success: false, message: '您已达到使用次数上限' });
    }

    const rewards = typeof cdk.rewards === 'string' ? JSON.parse(cdk.rewards) : cdk.rewards;
    const rewardsReceived = {};

    if (rewards.moon_points && rewards.moon_points > 0) {
      user.moon_points = (user.moon_points || 0) + rewards.moon_points;
      rewardsReceived.moon_points = rewards.moon_points;
      
      await MoonPointLog.create({
        user_id: userId,
        points: rewards.moon_points,
        reason_type: 'cdk',
        reason: `兑换CDK: ${cdk.code}`,
        created_at: new Date()
      }, { transaction });
    }

    if (rewards.exp && rewards.exp > 0) {
      user.exp = (user.exp || 0) + rewards.exp;
      rewardsReceived.exp = rewards.exp;
      
      await ExpLog.create({
        user_id: userId,
        exp_change: rewards.exp,
        reason_type: 'cdk',
        reason: `兑换CDK: ${cdk.code}`,
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

    const cdkUseRecord = await CDKUse.create({
      cdk_id: cdk.id,
      user_id: userId,
      rewards_received: JSON.stringify(rewardsReceived)
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: '兑换成功',
      rewards: rewardsReceived,
      record_id: cdkUseRecord.id
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('=== CDK兑换错误详情 ===');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('用户ID:', req.user?.id);
    console.error('CDK码:', code);
    res.status(500).json({ success: false, message: '兑换失败，请稍后重试' });
  }
};

exports.downloadCDKFile = async (req, res) => {
  try {
    const { record_id, file_index } = req.params;
    const userId = req.user.id;

    const record = await CDKUse.findByPk(record_id);
    
    if (!record) {
      return res.status(404).json({ success: false, message: '兑换记录不存在' });
    }

    if (record.user_id !== userId) {
      return res.status(403).json({ success: false, message: '无权访问此文件' });
    }

    const rewardsReceived = JSON.parse(record.rewards_received);
    
    if (!rewardsReceived.files || !rewardsReceived.files[file_index]) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    const fileInfo = rewardsReceived.files[file_index];
    
    if (!fileInfo.url) {
      return res.status(404).json({ success: false, message: '文件链接不存在' });
    }

    const fileId = fileInfo.url.match(/\/download\/(\d+)/)?.[1];
    
    if (!fileId) {
      return res.status(404).json({ success: false, message: '无法解析文件ID' });
    }

    const file = await FileStorage.findByPk(fileId);
    
    if (!file || file.status !== 'active') {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    if (file.local_path && fs.existsSync(file.local_path)) {
      const ext = path.extname(file.local_path).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.file_name)}"`);
      
      const fileStream = fs.createReadStream(file.local_path);
      fileStream.pipe(res);
      return;
    }

    if (file.qiniu_url) {
      res.redirect(file.qiniu_url);
      return;
    }

    res.status(404).json({ success: false, message: '文件不存在' });
  } catch (error) {
    console.error('下载CDK文件失败:', error);
    res.status(500).json({ success: false, message: '下载失败，请稍后重试' });
  }
};

exports.getCDKUseRecords = async (req, res) => {
  try {
    const { page = 1, limit = 20, user_id, cdk_id, start_date, end_date } = req.query;

    const where = {};
    if (user_id) where.user_id = user_id;
    if (cdk_id) where.cdk_id = cdk_id;
    if (start_date) where.used_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.used_at) where.used_at = {};
      where.used_at[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await CDKUse.findAndCountAll({
      where,
      order: [['used_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: CDK,
          as: 'cdk',
          attributes: ['id', 'code', 'type', 'rewards']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取兑换记录失败:', error);
    res.status(500).json({ success: false, message: '获取兑换记录失败' });
  }
};

exports.getCDKStatistics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const where = {};
    if (start_date) where.created_at = { [Op.gte]: new Date(start_date) };
    if (end_date) {
      if (!where.created_at) where.created_at = {};
      where.created_at[Op.lte] = new Date(end_date);
    }

    const totalCDK = await CDK.count({ where });
    const activeCDK = await CDK.count({ where: { ...where, status: 'active' } });
    const usedCDK = await CDKUse.count();

    const batchStats = await CDK.findAll({
      where: { ...where, type: 'batch' },
      attributes: [
        'batch_code',
        [sequelize.fn('SUM', sequelize.col('total_count')), 'total'],
        [sequelize.fn('SUM', sequelize.col('used_count')), 'used']
      ],
      group: ['batch_code']
    });

    const recentUses = await CDKUse.findAll({
      order: [['used_at', 'DESC']],
      limit: 10,
      include: [
        { model: CDK, as: 'cdk', attributes: ['code', 'type'] },
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    const totalRewards = await CDKUse.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.cast(Sequelize.literal("rewards_received->>'$.moon_points'"), 'DECIMAL(10,1)')), 'total_moon_points'],
        [sequelize.fn('SUM', sequelize.cast(Sequelize.literal("rewards_received->>'$.exp'"), 'SIGNED')), 'total_exp']
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        totalCDK,
        activeCDK,
        usedCDK,
        usageRate: totalCDK > 0 ? ((usedCDK / totalCDK) * 100).toFixed(2) : 0,
        batchStats,
        recentUses,
        totalRewards: totalRewards[0] || { total_moon_points: 0, total_exp: 0 }
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
};

exports.getMyCDKRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await CDKUse.findAndCountAll({
      where: { user_id: userId },
      order: [['used_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: CDK,
        as: 'cdk',
        attributes: ['id', 'code', 'type', 'description']
      }]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取我的兑换记录失败:', error);
    res.status(500).json({ success: false, message: '获取兑换记录失败' });
  }
};