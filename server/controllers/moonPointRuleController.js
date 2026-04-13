const db = require('../models');
const MoonPointRule = db.MoonPointRule;
const MoonPointRequest = db.MoonPointRequest;
const User = db.User;
const MoonPointLog = db.MoonPointLog;

// 获取所有月球分规则
exports.getAllMoonPointRules = async (req, res) => {
  try {
    const rules = await MoonPointRule.findAll({
      order: [['id', 'ASC']]
    });
    res.json({ rules });
  } catch (error) {
    console.error('获取月球分规则失败:', error);
    res.status(500).json({ message: '获取月球分规则失败', error: error.message });
  }
};

// 获取单个月球分规则
exports.getMoonPointRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await MoonPointRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ message: '规则不存在' });
    }
    res.json({ rule });
  } catch (error) {
    console.error('获取月球分规则失败:', error);
    res.status(500).json({ message: '获取月球分规则失败', error: error.message });
  }
};

// 根据reason_type获取规则
exports.getRuleByReasonType = async (reasonType) => {
  try {
    const rule = await MoonPointRule.findOne({
      where: { reason_type: reasonType, is_active: true }
    });
    return rule;
  } catch (error) {
    console.error('获取月球分规则失败:', error);
    return null;
  }
};

// 创建月球分规则（管理员）
exports.createMoonPointRule = async (req, res) => {
  try {
    const { name, reason_type, base_points, need_approval, daily_limit, description } = req.body;

    if (!name || !reason_type || base_points === undefined) {
      return res.status(400).json({ message: '规则名称、原因类型和基础分数不能为空' });
    }

    const newRule = await MoonPointRule.create({
      name,
      reason_type,
      base_points,
      need_approval: need_approval !== undefined ? need_approval : true,
      daily_limit,
      description
    });

    res.status(201).json({ message: '月球分规则创建成功', rule: newRule });
  } catch (error) {
    console.error('创建月球分规则失败:', error);
    res.status(500).json({ message: '创建月球分规则失败', error: error.message });
  }
};

// 更新月球分规则（管理员）
exports.updateMoonPointRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, reason_type, base_points, need_approval, daily_limit, is_active, description } = req.body;

    const rule = await MoonPointRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ message: '规则不存在' });
    }

    await rule.update({
      name: name !== undefined ? name : rule.name,
      reason_type: reason_type !== undefined ? reason_type : rule.reason_type,
      base_points: base_points !== undefined ? base_points : rule.base_points,
      need_approval: need_approval !== undefined ? need_approval : rule.need_approval,
      daily_limit: daily_limit !== undefined ? daily_limit : rule.daily_limit,
      is_active: is_active !== undefined ? is_active : rule.is_active,
      description: description !== undefined ? description : rule.description
    });

    res.json({ message: '月球分规则更新成功', rule });
  } catch (error) {
    console.error('更新月球分规则失败:', error);
    res.status(500).json({ message: '更新月球分规则失败', error: error.message });
  }
};

// 删除月球分规则（管理员）
exports.deleteMoonPointRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await MoonPointRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ message: '规则不存在' });
    }

    await rule.destroy();
    res.json({ message: '月球分规则删除成功' });
  } catch (error) {
    console.error('删除月球分规则失败:', error);
    res.status(500).json({ message: '删除月球分规则失败', error: error.message });
  }
};

// 初始化默认月球分规则
exports.initializeDefaultRules = async (req, res) => {
  try {
    const defaultRules = [
      {
        name: '每日打卡',
        reason_type: 'check_in',
        base_points: 10,
        need_approval: false,
        daily_limit: 1,
        description: '用户每日打卡自动获得10月球分，无需审核'
      },
      {
        name: '分享文章',
        reason_type: 'share_post',
        base_points: 5,
        need_approval: true,
        daily_limit: 1,
        description: '用户分享文章获得5月球分，需要审核'
      },
      {
        name: '创作文章',
        reason_type: 'create_post',
        base_points: 10,
        need_approval: true,
        daily_limit: 1,
        description: '用户创作文章获得10月球分，需要审核'
      },
      {
        name: '完成简单任务',
        reason_type: 'complete_task_easy',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户完成简单任务获得2月球分，需要审核'
      },
      {
        name: '完成中等任务',
        reason_type: 'complete_task_medium',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户完成中等任务获得3月球分，需要审核'
      },
      {
        name: '完成困难任务',
        reason_type: 'complete_task_hard',
        base_points: 5,
        need_approval: true,
        daily_limit: null,
        description: '用户完成困难任务获得5月球分，需要审核'
      },
      {
        name: '投稿简单任务',
        reason_type: 'submit_task_easy',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿简单任务获得2月球分，需要审核'
      },
      {
        name: '投稿中等任务',
        reason_type: 'submit_task_medium',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿中等任务获得3月球分，需要审核'
      },
      {
        name: '投稿困难任务',
        reason_type: 'submit_task_hard',
        base_points: 5,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿困难任务获得5月球分，需要审核'
      },
      {
        name: '投稿被完成-简单',
        reason_type: 'task_completed_easy',
        base_points: 1,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的简单任务被完成获得1月球分，需要审核'
      },
      {
        name: '投稿被完成-中等',
        reason_type: 'task_completed_medium',
        base_points: 2,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的中等任务被完成获得2月球分，需要审核'
      },
      {
        name: '投稿被完成-困难',
        reason_type: 'task_completed_hard',
        base_points: 3,
        need_approval: true,
        daily_limit: null,
        description: '用户投稿的困难任务被完成获得3月球分，需要审核'
      }
    ];

    for (const ruleData of defaultRules) {
      const [rule, created] = await MoonPointRule.findOrCreate({
        where: { reason_type: ruleData.reason_type },
        defaults: ruleData
      });
      if (created) {
        console.log(`创建月球分规则: ${ruleData.name}`);
      }
    }

    res.json({ message: '默认月球分规则初始化成功' });
  } catch (error) {
    console.error('初始化默认月球分规则失败:', error);
    res.status(500).json({ message: '初始化默认月球分规则失败', error: error.message });
  }
};

// 申请月球分（根据规则）
exports.applyMoonPoints = async (req, res) => {
  try {
    const { user_id, reason_type, related_id, custom_reason } = req.body;

    if (!user_id || !reason_type) {
      return res.status(400).json({ message: '用户ID和原因类型不能为空' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取规则
    const rule = await MoonPointRule.findOne({
      where: { reason_type, is_active: true }
    });

    if (!rule) {
      return res.status(400).json({ message: '无效的原因类型' });
    }

    // 检查每日限制
    if (rule.daily_limit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCount = await MoonPointRequest.count({
        where: {
          user_id,
          reason_type,
          created_at: {
            [db.Sequelize.Op.gte]: today,
            [db.Sequelize.Op.lt]: tomorrow
          }
        }
      });

      if (todayCount >= rule.daily_limit) {
        return res.status(400).json({ message: `今日已达到${rule.name}次数上限` });
      }
    }

    const points = rule.base_points;
    const reason = custom_reason || rule.name;

    if (!rule.need_approval) {
      // 直接发放（无需审核）
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
          reason_type,
          related_id
        }, { transaction });

        await transaction.commit();

        res.json({ message: '月球分发放成功', points, reason });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // 创建审核申请
      const request = await MoonPointRequest.create({
        user_id,
        points,
        reason,
        reason_type,
        related_id
      });

      res.status(201).json({ message: '申请已提交，等待审核', request, points });
    }
  } catch (error) {
    console.error('申请月球分失败:', error);
    res.status(500).json({ message: '申请月球分失败', error: error.message });
  }
};
