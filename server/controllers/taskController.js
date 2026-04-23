const { Task, User, TaskType, TaskTopic, Like } = require('../models');
const { Op } = require('sequelize');
const { applyMoonPoints } = require('../services/moonPointService');

// 获取任务列表
exports.getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      gender,
      status,
      type,
      customTypeId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (gender) {
      where.gender = gender;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (customTypeId) {
      where.customTypeId = customTypeId;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      attributes: {
        exclude: ['priority', 'assignedTo']
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'nickname']
        },
        {
          model: User,
          as: 'proposalUser',
          attributes: ['id', 'username', 'nickname']
        },
        {
          model: TaskType,
          as: 'customType',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ message: '获取任务列表失败', error: error.message });
  }
};

// 获取单个任务
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      attributes: {
        exclude: ['priority', 'assignedTo']
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'nickname']
        },
        {
          model: User,
          as: 'proposalUser',
          attributes: ['id', 'username', 'nickname']
        },
        {
          model: TaskType,
          as: 'customType',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    res.json({ task });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    res.status(500).json({ message: '获取任务详情失败', error: error.message });
  }
};

// 创建任务
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      customTypeId,
      customTopicId,
      gender,
      difficulty,
      reward,
      startTime,
      endTime,
      maxParticipants,
      icon,
      color,
      status,
      suggestedTime,
      items
    } = req.body;

    console.log('创建任务数据:', req.body);

    if (!title || !title.trim()) {
      return res.status(400).json({ message: '请输入任务名称' });
    }
    if (!gender) {
      return res.status(400).json({ message: '请选择所属专区' });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      type: type || 'other',
      customTypeId: customTypeId || null,
      customTopicId: customTopicId || null,
      gender,
      difficulty: difficulty || 'medium',
      reward: reward !== undefined ? reward : 0,
      startTime: startTime || null,
      endTime: endTime || null,
      maxParticipants: maxParticipants || null,
      icon: icon || '',
      color: color || '',
      createdBy: req.user.id,
      status: status || 'draft',
      suggestedTime: suggestedTime || null,
      items: items || null
    });

    res.status(201).json({
      message: '任务创建成功',
      task
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ message: '创建任务失败', error: error.message });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      customTypeId,
      customTopicId,
      gender,
      status,
      difficulty,
      reward,
      startTime,
      endTime,
      maxParticipants,
      icon,
      color,
      suggestedTime,
      items
    } = req.body;

    console.log('更新任务数据:', req.body);

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    // 验证必填字段
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: '请输入任务名称' });
    }

    await task.update({
      title: title !== undefined ? title.trim() : task.title,
      description: description !== undefined ? description : task.description,
      type: type !== undefined ? type : task.type,
      customTypeId: customTypeId !== undefined ? customTypeId : task.customTypeId,
      customTopicId: customTopicId !== undefined ? customTopicId : task.customTopicId,
      gender: gender !== undefined ? gender : task.gender,
      status: status !== undefined ? status : task.status,
      difficulty: difficulty !== undefined ? difficulty : task.difficulty,
      reward: reward !== undefined ? reward : task.reward,
      startTime: startTime !== undefined ? startTime : task.startTime,
      endTime: endTime !== undefined ? endTime : task.endTime,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : task.maxParticipants,
      icon: icon !== undefined ? icon : task.icon,
      color: color !== undefined ? color : task.color,
      suggestedTime: suggestedTime !== undefined ? suggestedTime : task.suggestedTime,
      items: items !== undefined ? items : task.items
    });

    res.json({
      message: '任务更新成功',
      task
    });
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ message: '更新任务失败', error: error.message });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    await task.destroy();

    res.json({ message: '任务删除成功' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ message: '删除任务失败', error: error.message });
  }
};

// 更新任务状态
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'published', 'expired', 'disabled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的任务状态' });
    }

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    await task.update({ status });

    res.json({
      message: '任务状态更新成功',
      task
    });
  } catch (error) {
    console.error('更新任务状态失败:', error);
    res.status(500).json({ message: '更新任务状态失败', error: error.message });
  }
};

// 获取任务统计
exports.getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.count();
    const maleTasks = await Task.count({ where: { gender: 'male' } });
    const femaleTasks = await Task.count({ where: { gender: 'female' } });

    const publishedTasks = await Task.count({ where: { status: 'published' } });
    const draftTasks = await Task.count({ where: { status: 'draft' } });
    const expiredTasks = await Task.count({ where: { status: 'expired' } });
    const disabledTasks = await Task.count({ where: { status: 'disabled' } });

    const typeStats = await Task.findAll({
      attributes: ['type', [Task.sequelize.fn('COUNT', Task.sequelize.col('type')), 'count']],
      group: ['type']
    });

    res.json({
      total: totalTasks,
      gender: {
        male: maleTasks,
        female: femaleTasks
      },
      status: {
        published: publishedTasks,
        draft: draftTasks,
        expired: expiredTasks,
        disabled: disabledTasks
      },
      typeStats: typeStats.map(item => ({
        type: item.type,
        count: parseInt(item.get('count'))
      }))
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({ message: '获取任务统计失败', error: error.message });
  }
};

// 点赞任务
exports.likeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查任务是否存在
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    // 检查是否已点赞
    const existingLike = await Like.findOne({
      where: { user_id: userId, task_id: id }
    });

    if (existingLike) {
      return res.status(400).json({ message: '您已点赞该任务' });
    }

    // 创建点赞记录
    await Like.create({ user_id: userId, task_id: id });

    res.json({ message: '点赞成功', liked: true });
  } catch (error) {
    console.error('点赞任务失败:', error);
    res.status(500).json({ message: '点赞失败', error: error.message });
  }
};

// 取消点赞任务
exports.unlikeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查找点赞记录
    const like = await Like.findOne({
      where: { user_id: userId, task_id: id }
    });

    if (!like) {
      return res.status(400).json({ message: '您未点赞该任务' });
    }

    // 删除点赞记录
    await like.destroy();

    res.json({ message: '取消点赞成功', liked: false });
  } catch (error) {
    console.error('取消点赞任务失败:', error);
    res.status(500).json({ message: '取消点赞失败', error: error.message });
  }
};

// ==================== 任务提议相关方法 ====================

const { TaskProposal } = require('../models');

// 创建任务提议
exports.createTaskProposal = async (req, res) => {
  try {
    const { title, description, gender, difficulty, suggestedTime, items } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({ message: '请输入任务名称' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: '请输入任务描述' });
    }
    if (!gender) {
      return res.status(400).json({ message: '请选择适用专区' });
    }

    // 创建提议
    const proposal = await TaskProposal.create({
      title: title.trim(),
      description: description.trim(),
      gender,
      difficulty: difficulty || 'medium',
      userId,
      status: 'pending',
      suggestedTime: suggestedTime || null,
      items: items || null
    });

    // 暂时不发放月球分，等待管理员审核后根据实际任务等级发放
    let moonPointResult = null;

    res.status(201).json({
      message: '任务提议提交成功，等待管理员审核',
      proposal,
      moonPoint: moonPointResult
    });
  } catch (error) {
    console.error('创建任务提议失败:', error);
    res.status(500).json({ message: '提交失败，请稍后重试', error: error.message });
  }
};

// 获取任务提议列表（管理员）
exports.getTaskProposals = async (req, res) => {
  try {
    const proposals = await TaskProposal.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ proposals });
  } catch (error) {
    console.error('获取任务提议失败:', error);
    res.status(500).json({ message: '获取任务提议失败', error: error.message });
  }
};

// 获取任务提议统计（管理员）
exports.getTaskProposalStats = async (req, res) => {
  try {
    const pending = await TaskProposal.count({ where: { status: 'pending' } });
    const approved = await TaskProposal.count({ where: { status: 'approved' } });
    const rejected = await TaskProposal.count({ where: { status: 'rejected' } });

    res.json({ pending, approved, rejected });
  } catch (error) {
    console.error('获取任务提议统计失败:', error);
    res.status(500).json({ message: '获取统计失败', error: error.message });
  }
};

// 审核通过任务提议
exports.approveTaskProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { difficulty: adminDifficulty } = req.body; // 后台审核时可以指定实际的任务难度

    const proposal = await TaskProposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: '任务提议不存在' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: '该提议已处理' });
    }

    const { TaskType, Task } = require('../models');
    const { applyMoonPoints } = require('../services/moonPointService');

    // 确定需要创建任务的性别专区
    const gendersToCreate = [];
    if (proposal.gender === 'both') {
      gendersToCreate.push('male', 'female');
    } else {
      gendersToCreate.push(proposal.gender);
    }

    // 确定实际的任务难度（如果后台指定了难度，则使用后台指定的，否则使用用户提交的）
    const actualDifficulty = adminDifficulty || proposal.difficulty;
    console.log(`[approveTaskProposal] 用户提交难度: ${proposal.difficulty}, 后台实际难度: ${actualDifficulty}`);

    const createdTasks = [];

    for (const gender of gendersToCreate) {
      // 获取或创建一个默认的任务类型
      let taskType = await TaskType.findOne({
        where: { name: '用户提议', gender: gender }
      });

      if (!taskType) {
        taskType = await TaskType.create({
          name: '用户提议',
          description: '用户提交的任务提议',
          gender: gender,
          icon: '🌟'
        });
      }

      // 根据任务难度设置奖励积分
      let reward = 3; // 默认中等任务
      if (actualDifficulty === 'easy') reward = 2;
      else if (actualDifficulty === 'hard') reward = 5;
      
      // 创建任务
      const task = await Task.create({
        title: proposal.title,
        description: proposal.description,
        gender: gender,
        difficulty: actualDifficulty, // 使用实际的任务难度
        customTypeId: taskType.id,
        status: 'published',
        createdBy: adminId,
        proposalUserId: proposal.userId, // 保存提议用户的ID
        reward: reward,
        suggestedTime: proposal.suggestedTime,
        items: proposal.items
      });

      createdTasks.push(task);
    }

    // 根据实际的任务难度重新计算并发放月球分
    // 首先撤销之前的月球分申请（如果有的话）
    // 然后根据实际难度重新申请
    let moonPointResult = null;
    try {
      let reasonType = 'submit_task_medium'; // 默认中等任务
      if (actualDifficulty === 'easy') {
        reasonType = 'submit_task_easy';
      } else if (actualDifficulty === 'hard') {
        reasonType = 'submit_task_hard';
      }
      
      console.log(`[approveTaskProposal] 根据实际难度 ${actualDifficulty} 发放月球分，reasonType: ${reasonType}`);
      moonPointResult = await applyMoonPoints(proposal.userId, reasonType, proposal.id);
    } catch (moonPointError) {
      console.error('重新发放月球分失败:', moonPointError);
      // 不影响任务创建成功
    }

    // 更新提议状态
    await proposal.update({
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.json({ 
      message: '已通过该任务提议并创建任务', 
      proposal,
      createdTasks,
      moonPoint: moonPointResult
    });
  } catch (error) {
    console.error('审核任务提议失败:', error);
    res.status(500).json({ message: '审核失败', error: error.message });
  }
};

// 拒绝任务提议
exports.rejectTaskProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const proposal = await TaskProposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: '任务提议不存在' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ message: '该提议已处理' });
    }

    // 更新提议状态
    await proposal.update({
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.json({ message: '已拒绝该任务提议', proposal });
  } catch (error) {
    console.error('拒绝任务提议失败:', error);
    res.status(500).json({ message: '操作失败', error: error.message });
  }
};

// 更新任务提议
exports.updateTaskProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, gender, difficulty, suggestedTime, items } = req.body;

    const proposal = await TaskProposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: '任务提议不存在' });
    }

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({ message: '请输入任务名称' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: '请输入任务描述' });
    }

    // 更新提议
    await proposal.update({
      title: title.trim(),
      description: description.trim(),
      gender: gender || proposal.gender,
      difficulty: difficulty || proposal.difficulty,
      suggestedTime: suggestedTime !== undefined ? suggestedTime : proposal.suggestedTime,
      items: items !== undefined ? items : proposal.items
    });

    res.json({ message: '任务提议已更新', proposal });
  } catch (error) {
    console.error('更新任务提议失败:', error);
    res.status(500).json({ message: '更新失败', error: error.message });
  }
};

// 删除任务提议
exports.deleteTaskProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await TaskProposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: '任务提议不存在' });
    }

    await proposal.destroy();

    res.json({ message: '任务提议已删除' });
  } catch (error) {
    console.error('删除任务提议失败:', error);
    res.status(500).json({ message: '删除失败', error: error.message });
  }
};
