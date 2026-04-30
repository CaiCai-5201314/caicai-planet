const db = require('../models');
const { Pool, FileStorage } = db;

exports.createPool = async (req, res) => {
  try {
    const { name, type, description, random_count } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: '请提供池名称和类型' });
    }

    const existingPool = await Pool.findOne({ where: { name } });
    if (existingPool) {
      return res.status(400).json({ success: false, message: '池名称已存在' });
    }

    const pool = await Pool.create({
      name,
      type,
      description,
      random_count: type === 'random' ? (random_count || 1) : 1
    });

    res.status(200).json({ success: true, message: '池创建成功', data: pool });
  } catch (error) {
    console.error('创建池失败:', error);
    res.status(500).json({ success: false, message: '创建池失败' });
  }
};

exports.getPools = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await Pool.findAndCountAll({
      where: { status: 'active' },
      include: [{ model: FileStorage, as: 'files', where: { status: 'active' }, required: false }],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    console.error('获取池列表失败:', error);
    res.status(500).json({ success: false, message: '获取池列表失败' });
  }
};

exports.getPoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await Pool.findByPk(id, {
      include: [{ model: FileStorage, as: 'files', where: { status: 'active' } }]
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    res.status(200).json({ success: true, data: pool });
  } catch (error) {
    console.error('获取池失败:', error);
    res.status(500).json({ success: false, message: '获取池失败' });
  }
};

exports.updatePool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, random_count, status } = req.body;

    const pool = await Pool.findByPk(id);
    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    if (name && name !== pool.name) {
      const existingPool = await Pool.findOne({ where: { name } });
      if (existingPool) {
        return res.status(400).json({ success: false, message: '池名称已存在' });
      }
    }

    await pool.update({
      name: name || pool.name,
      type: type || pool.type,
      description: description || pool.description,
      random_count: type === 'random' ? (random_count || pool.random_count) : pool.random_count,
      status: status || pool.status
    });

    res.status(200).json({ success: true, message: '池更新成功', data: pool });
  } catch (error) {
    console.error('更新池失败:', error);
    res.status(500).json({ success: false, message: '更新池失败' });
  }
};

exports.deletePool = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await Pool.findByPk(id);

    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    await FileStorage.update({ pool_id: null }, { where: { pool_id: id } });
    await pool.update({ status: 'inactive' });
    await pool.destroy();

    res.status(200).json({ success: true, message: '池删除成功' });
  } catch (error) {
    console.error('删除池失败:', error);
    res.status(500).json({ success: false, message: '删除池失败' });
  }
};

exports.addFilesToPool = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_ids } = req.body;

    const pool = await Pool.findByPk(id);
    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    await FileStorage.update(
      { pool_id: id },
      { where: { id: file_ids, status: 'active' } }
    );

    res.status(200).json({ success: true, message: '文件添加成功' });
  } catch (error) {
    console.error('添加文件到池失败:', error);
    res.status(500).json({ success: false, message: '添加文件到池失败' });
  }
};

exports.removeFilesFromPool = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_ids } = req.body;

    const pool = await Pool.findByPk(id);
    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    await FileStorage.update(
      { pool_id: null },
      { where: { id: file_ids, pool_id: id } }
    );

    res.status(200).json({ success: true, message: '文件移除成功' });
  } catch (error) {
    console.error('从池移除文件失败:', error);
    res.status(500).json({ success: false, message: '从池移除文件失败' });
  }
};

exports.drawFromPool = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await Pool.findByPk(id, {
      include: [{ model: FileStorage, as: 'files', where: { status: 'active' } }]
    });

    if (!pool) {
      return res.status(404).json({ success: false, message: '池不存在' });
    }

    let selectedFiles = [];
    const poolFiles = pool.files || [];

    if (pool.type === 'fixed') {
      selectedFiles = poolFiles;
    } else {
      const count = Math.min(pool.random_count, poolFiles.length);
      const shuffled = [...poolFiles].sort(() => 0.5 - Math.random());
      selectedFiles = shuffled.slice(0, count);
    }

    res.status(200).json({
      success: true,
      data: {
        pool_id: pool.id,
        pool_name: pool.name,
        pool_type: pool.type,
        selected_files: selectedFiles
      }
    });
  } catch (error) {
    console.error('从池抽取文件失败:', error);
    res.status(500).json({ success: false, message: '从池抽取文件失败' });
  }
};