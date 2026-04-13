const db = require('../models');
const MoonPointRequest = db.MoonPointRequest;
const User = db.User;
const MoonPointLog = db.MoonPointLog;

// 获取月球分申请列表（管理员）
exports.getMoonPointRequests = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = '', reason_type = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (reason_type) {
      where.reason_type = reason_type;
    }

    const { count, rows: requests } = await MoonPointRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] },
        { model: User, as: 'approver', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取月球分申请列表失败:', error);
    res.status(500).json({ message: '获取月球分申请列表失败', error: error.message });
  }
};

// 审批月球分申请
exports.approveMoonPointRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '无效的审核状态' });
    }

    const request = await MoonPointRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: '申请不存在' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: '该申请已处理' });
    }

    // 开启事务
    const transaction = await db.sequelize.transaction();

    try {
      // 更新申请状态
      await request.update({
        status,
        approved_by: req.user.id,
        approval_note: note
      }, { transaction });

      // 如果审批通过，发放月球分
      if (status === 'approved') {
        const user = await User.findByPk(request.user_id, { transaction });
        if (!user) {
          throw new Error('用户不存在');
        }

        // 更新用户月球分（处理DECIMAL类型）
        const currentPoints = parseFloat(user.moon_points) || 0;
        const pointsToAdd = parseFloat(request.points) || 0;
        const newPoints = currentPoints + pointsToAdd;
        
        await user.update(
          { moon_points: newPoints },
          { transaction }
        );

        // 创建月球分记录
        await MoonPointLog.create({
          user_id: request.user_id,
          points: parseFloat(request.points) || 0,
          reason: request.reason,
          reason_type: request.reason_type,
          related_id: request.related_id
        }, { transaction });
      }

      await transaction.commit();

      res.json({ message: status === 'approved' ? '审批通过并发放月球分' : '审批拒绝', request });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('审批月球分申请失败:', error);
    res.status(500).json({ message: '审批月球分申请失败', error: error.message });
  }
};

// 创建月球分申请（保留向后兼容）
exports.createMoonPointRequest = async (req, res) => {
  try {
    const { user_id, points, reason, reason_type, related_id } = req.body;

    if (!user_id || !points || !reason) {
      return res.status(400).json({ message: '用户ID、分数和原因不能为空' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 创建审核申请
    const request = await MoonPointRequest.create({
      user_id,
      points,
      reason,
      reason_type: reason_type || 'other',
      related_id
    });

    res.status(201).json({ message: '申请已提交，等待审核', request });
  } catch (error) {
    console.error('创建月球分申请失败:', error);
    res.status(500).json({ message: '创建月球分申请失败', error: error.message });
  }
};

// 获取用户的月球分申请历史
exports.getUserMoonPointRequests = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: requests } = await MoonPointRequest.findAndCountAll({
      where: { user_id },
      include: [
        { model: User, as: 'approver', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取用户月球分申请历史失败:', error);
    res.status(500).json({ message: '获取用户月球分申请历史失败', error: error.message });
  }
};
