const { TaskType, TaskTopic, Task, User } = require('../models');
const { Op } = require('sequelize');

// 获取任务类型列表
exports.getTaskTypes = async (req, res) => {
  try {
    const { gender, isActive, includeInactive } = req.query;
    
    const where = {};
    
    if (gender && gender !== 'all') {
      where[Op.or] = [
        { gender: gender },
        { gender: 'both' }
      ];
    }
    
    if (!includeInactive || includeInactive !== 'true') {
      where.isActive = true;
    }

    const taskTypes = await TaskType.findAll({
      where,
      attributes: {
        exclude: ['difficulty']
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'nickname']
        }
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({ taskTypes });
  } catch (error) {
    console.error('获取任务类型列表失败:', error);
    res.status(500).json({ message: '获取任务类型列表失败', error: error.message });
  }
};

// 获取单个任务类型（包含话题）
exports.getTaskTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const taskType = await TaskType.findByPk(id, {
      attributes: {
        exclude: ['difficulty']
      },
      include: [
        {
          model: TaskTopic,
          as: 'topics',
          required: false,
          order: [['sortOrder', 'ASC']]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'nickname']
        }
      ]
    });

    if (!taskType) {
      return res.status(404).json({ message: '任务类型不存在' });
    }

    res.json({ taskType });
  } catch (error) {
    console.error('获取任务类型详情失败:', error);
    res.status(500).json({ message: '获取任务类型详情失败', error: error.message });
  }
};

// 创建任务类型
exports.createTaskType = async (req, res) => {
  try {
    const { name, description, gender, icon, color, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: '任务类型名称不能为空' });
    }

    const taskType = await TaskType.create({
      name,
      description,
      gender: gender || 'both',
      icon,
      color,
      sortOrder: sortOrder || 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: '任务类型创建成功',
      taskType
    });
  } catch (error) {
    console.error('创建任务类型失败:', error);
    res.status(500).json({ message: '创建任务类型失败', error: error.message });
  }
};

// 更新任务类型
exports.updateTaskType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, gender, icon, color, sortOrder, isActive } = req.body;

    const taskType = await TaskType.findByPk(id);

    if (!taskType) {
      return res.status(404).json({ message: '任务类型不存在' });
    }

    await taskType.update({
      name: name !== undefined ? name : taskType.name,
      description: description !== undefined ? description : taskType.description,
      gender: gender !== undefined ? gender : taskType.gender,
      icon: icon !== undefined ? icon : taskType.icon,
      color: color !== undefined ? color : taskType.color,
      sortOrder: sortOrder !== undefined ? sortOrder : taskType.sortOrder,
      isActive: isActive !== undefined ? isActive : taskType.isActive
    });

    res.json({
      message: '任务类型更新成功',
      taskType
    });
  } catch (error) {
    console.error('更新任务类型失败:', error);
    res.status(500).json({ message: '更新任务类型失败', error: error.message });
  }
};

// 删除任务类型
exports.deleteTaskType = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // force=true 表示强制删除
    const typeId = parseInt(id, 10);

    const taskType = await TaskType.findByPk(typeId);

    if (!taskType) {
      return res.status(404).json({ message: '任务类型不存在' });
    }

    // 检查是否有关联的任务
    const tasks = await Task.findAll({ 
      where: { customTypeId: typeId },
      attributes: ['id', 'title', 'customTypeId']
    });
    
    if (tasks.length > 0) {
      if (force === 'true') {
        // 强制删除：先删除所有关联任务
        for (const task of tasks) {
          await task.destroy();
        }
      } else {
        return res.status(400).json({ 
          message: `该任务类型下还有 ${tasks.length} 个任务，请先删除或转移这些任务后再删除类型`,
          tasks: tasks.map(t => ({ id: t.id, title: t.title })),
          canForceDelete: true
        });
      }
    }

    // 检查是否有关联的话题
    const topics = await TaskTopic.findAll({ where: { taskTypeId: typeId } });
    if (topics.length > 0) {
      if (force === 'true') {
        // 强制删除：先删除所有关联话题
        for (const topic of topics) {
          await topic.destroy();
        }
      } else {
        return res.status(400).json({ 
          message: `该任务类型下还有 ${topics.length} 个话题，请先删除或转移这些话题后再删除类型`,
          canForceDelete: true
        });
      }
    }

    await taskType.destroy();

    res.json({ 
      message: force === 'true' ? '任务类型及其关联数据已强制删除' : '任务类型删除成功',
      deletedTasks: tasks.length,
      deletedTopics: topics.length
    });
  } catch (error) {
    console.error('删除任务类型失败:', error);
    res.status(500).json({ message: '删除任务类型失败', error: error.message });
  }
};

// 获取任务类型的话题列表
exports.getTaskTypeTopics = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.query;

    const where = { taskTypeId: id };
    if (isActive !== 'false') {
      where.isActive = true;
    }

    const topics = await TaskTopic.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'nickname']
        }
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({ topics });
  } catch (error) {
    console.error('获取话题列表失败:', error);
    res.status(500).json({ message: '获取话题列表失败', error: error.message });
  }
};

// 创建话题
exports.createTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: '话题名称不能为空' });
    }

    // 检查任务类型是否存在
    const taskType = await TaskType.findByPk(id);
    if (!taskType) {
      return res.status(404).json({ message: '任务类型不存在' });
    }

    const topic = await TaskTopic.create({
      taskTypeId: id,
      name,
      description,
      sortOrder: sortOrder || 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: '话题创建成功',
      topic
    });
  } catch (error) {
    console.error('创建话题失败:', error);
    res.status(500).json({ message: '创建话题失败', error: error.message });
  }
};

// 更新话题
exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const topic = await TaskTopic.findByPk(topicId);

    if (!topic) {
      return res.status(404).json({ message: '话题不存在' });
    }

    await topic.update({
      name: name !== undefined ? name : topic.name,
      description: description !== undefined ? description : topic.description,
      sortOrder: sortOrder !== undefined ? sortOrder : topic.sortOrder,
      isActive: isActive !== undefined ? isActive : topic.isActive
    });

    res.json({
      message: '话题更新成功',
      topic
    });
  } catch (error) {
    console.error('更新话题失败:', error);
    res.status(500).json({ message: '更新话题失败', error: error.message });
  }
};

// 删除话题
exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const tId = parseInt(topicId, 10);

    const topic = await TaskTopic.findByPk(tId);

    if (!topic) {
      return res.status(404).json({ message: '话题不存在' });
    }

    // 检查是否有关联的任务
    const tasksCount = await Task.count({ where: { customTopicId: tId } });
    if (tasksCount > 0) {
      return res.status(400).json({ 
        message: `该话题下还有 ${tasksCount} 个任务，请先删除或转移这些任务后再删除话题` 
      });
    }

    await topic.destroy();

    res.json({ message: '话题删除成功' });
  } catch (error) {
    console.error('删除话题失败:', error);
    res.status(500).json({ message: '删除话题失败', error: error.message });
  }
};
