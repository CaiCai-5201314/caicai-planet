const { Advertisement, sequelize } = require('../models');
const { Op } = require('sequelize');

// 获取广告列表（管理员）
exports.getAdvertisements = async (req, res) => {
  try {
    const { position, status } = req.query;
    
    const where = {};
    if (position) where.position = position;
    if (status) where.status = status;
    
    const advertisements = await Advertisement.findAll({
      where,
      order: [
        ['priority', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      advertisements
    });
  } catch (error) {
    console.error('获取广告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取广告列表失败'
    });
  }
};

// 获取单个广告
exports.getAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const advertisement = await Advertisement.findByPk(id);
    
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }
    
    res.json({
      success: true,
      advertisement
    });
  } catch (error) {
    console.error('获取广告失败:', error);
    res.status(500).json({
      success: false,
      message: '获取广告失败'
    });
  }
};

// 创建广告
exports.createAdvertisement = async (req, res) => {
  try {
    const {
      title,
      position,
      content,
      image_url,
      link_url,
      status,
      start_time,
      end_time,
      priority
    } = req.body;
    
    if (!title || !position) {
      return res.status(400).json({
        success: false,
        message: '标题和位置不能为空'
      });
    }
    
    const advertisement = await Advertisement.create({
      title,
      position,
      content,
      image_url,
      link_url,
      status: status || 'draft',
      start_time: start_time && start_time !== '' ? start_time : null,
      end_time: end_time && end_time !== '' ? end_time : null,
      priority: priority || 0
    });
    
    res.json({
      success: true,
      advertisement,
      message: '广告创建成功'
    });
  } catch (error) {
    console.error('创建广告失败:', error);
    res.status(500).json({
      success: false,
      message: '创建广告失败'
    });
  }
};

// 更新广告
exports.updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      position,
      content,
      image_url,
      link_url,
      status,
      start_time,
      end_time,
      priority
    } = req.body;
    
    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }
    
    await advertisement.update({
      title: title || advertisement.title,
      position: position || advertisement.position,
      content: content !== undefined ? content : advertisement.content,
      image_url: image_url !== undefined ? image_url : advertisement.image_url,
      link_url: link_url !== undefined ? link_url : advertisement.link_url,
      status: status !== undefined ? status : advertisement.status,
      start_time: start_time && start_time !== '' ? start_time : advertisement.start_time,
      end_time: end_time && end_time !== '' ? end_time : advertisement.end_time,
      priority: priority !== undefined ? priority : advertisement.priority
    });
    
    res.json({
      success: true,
      advertisement,
      message: '广告更新成功'
    });
  } catch (error) {
    console.error('更新广告失败:', error);
    res.status(500).json({
      success: false,
      message: '更新广告失败'
    });
  }
};

// 删除广告
exports.deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }
    
    await advertisement.destroy();
    
    res.json({
      success: true,
      message: '广告删除成功'
    });
  } catch (error) {
    console.error('删除广告失败:', error);
    res.status(500).json({
      success: false,
      message: '删除广告失败'
    });
  }
};

// 获取活跃广告（用户端）
exports.getActiveAdvertisements = async (req, res) => {
  try {
    const { position, preview } = req.query;
    
    if (!position) {
      return res.status(400).json({
        success: false,
        message: '位置参数不能为空'
      });
    }
    
    const now = new Date();
    const where = {
      position
    };
    
    // 判断是否是预览模式（管理员）
    const isPreview = preview === 'true' || req.user?.role === 'admin';
    
    if (isPreview) {
      // 预览模式：显示测试中或已发布的广告
      where.status = {
        [Op.in]: ['testing', 'published']
      };
    } else {
      // 普通用户：只显示已发布的广告
      where.status = 'published';
    }
    
    // 检查时间范围（如果设置了）
    if (!isPreview) {
      where[Op.and] = [
        {
          [Op.or]: [
            { start_time: null },
            { start_time: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { end_time: null },
            { end_time: { [Op.gte]: now } }
          ]
        }
      ];
    }
    
    const advertisement = await Advertisement.findOne({
      where,
      order: [
        ['priority', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
    
    res.json({
      success: true,
      advertisement
    });
  } catch (error) {
    console.error('获取活跃广告失败:', error);
    res.status(500).json({
      success: false,
      message: '获取活跃广告失败'
    });
  }
};

// 记录广告点击
exports.recordClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const advertisement = await Advertisement.findByPk(id);
    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: '广告不存在'
      });
    }
    
    await advertisement.increment('clicks');
    
    res.json({
      success: true,
      message: '点击记录成功'
    });
  } catch (error) {
    console.error('记录点击失败:', error);
    res.status(500).json({
      success: false,
      message: '记录点击失败'
    });
  }
};
