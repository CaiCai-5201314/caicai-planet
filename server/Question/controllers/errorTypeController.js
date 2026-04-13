const { ErrorType, ErrorTypeVersion, Sequelize } = require('../../models');
const { Op } = Sequelize;

const errorTypeController = {
  // 获取错误类型列表
  getErrorTypes: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, category, severity } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { error_code: { [Op.like]: `%${search}%` } },
          { error_name: { [Op.like]: `%${search}%` } },
          { error_description: { [Op.like]: `%${search}%` } }
        ];
      }
      if (category) {
        where.category = category;
      }
      if (severity) {
        where.severity = severity;
      }

      const { count, rows } = await ErrorType.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        errorTypes: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取错误类型列表错误:', error);
      res.status(500).json({ message: '获取错误类型列表失败' });
    }
  },

  // 获取单个错误类型详情
  getErrorTypeById: async (req, res) => {
    try {
      const { id } = req.params;

      const errorType = await ErrorType.findByPk(id);
      if (!errorType) {
        return res.status(404).json({ message: '错误类型不存在' });
      }

      res.json({ errorType });
    } catch (error) {
      console.error('获取错误类型详情错误:', error);
      res.status(500).json({ message: '获取错误类型详情失败' });
    }
  },

  // 创建新的错误类型
  createErrorType: async (req, res) => {
    try {
      const { error_code, error_name, error_description, solution, category, severity, http_status } = req.body;

      if (!error_code || !error_name || !error_description) {
        return res.status(400).json({ message: '请填写完整的错误类型信息' });
      }

      // 检查错误代码是否已存在
      const existingErrorType = await ErrorType.findOne({ where: { error_code } });
      if (existingErrorType) {
        return res.status(409).json({ message: '错误代码已存在' });
      }

      const newErrorType = await ErrorType.create({
        error_code,
        error_name,
        error_description,
        solution,
        category,
        severity,
        http_status,
        is_custom: true,
        created_by: req.user.id,
        updated_by: req.user.id
      });

      // 创建初始版本记录
      await ErrorTypeVersion.create({
        error_type_id: newErrorType.id,
        error_code,
        error_name,
        error_description,
        solution,
        category,
        severity,
        http_status,
        version: 1,
        changed_by: req.user.id,
        change_note: '初始创建'
      });

      res.status(201).json({ message: '创建错误类型成功', errorType: newErrorType });
    } catch (error) {
      console.error('创建错误类型错误:', error);
      res.status(500).json({ message: '创建错误类型失败' });
    }
  },

  // 更新错误类型
  updateErrorType: async (req, res) => {
    try {
      const { id } = req.params;
      const { error_code, error_name, error_description, solution, category, severity, http_status, change_note } = req.body;

      const errorType = await ErrorType.findByPk(id);
      if (!errorType) {
        return res.status(404).json({ message: '错误类型不存在' });
      }

      // 检查错误代码是否已被其他错误类型使用
      if (error_code && error_code !== errorType.error_code) {
        const existingErrorType = await ErrorType.findOne({ where: { error_code } });
        if (existingErrorType) {
          return res.status(409).json({ message: '错误代码已存在' });
        }
      }

      // 保存旧数据用于版本记录
      const oldData = {
        error_code: errorType.error_code,
        error_name: errorType.error_name,
        error_description: errorType.error_description,
        solution: errorType.solution,
        category: errorType.category,
        severity: errorType.severity,
        http_status: errorType.http_status
      };

      // 更新错误类型
      const newVersion = errorType.version + 1;
      await errorType.update({
        error_code: error_code || errorType.error_code,
        error_name: error_name || errorType.error_name,
        error_description: error_description || errorType.error_description,
        solution: solution !== undefined ? solution : errorType.solution,
        category: category || errorType.category,
        severity: severity || errorType.severity,
        http_status: http_status !== undefined ? http_status : errorType.http_status,
        version: newVersion,
        updated_by: req.user.id
      });

      // 创建版本记录
      await ErrorTypeVersion.create({
        error_type_id: errorType.id,
        error_code: errorType.error_code,
        error_name: errorType.error_name,
        error_description: errorType.error_description,
        solution: errorType.solution,
        category: errorType.category,
        severity: errorType.severity,
        http_status: errorType.http_status,
        version: newVersion,
        changed_by: req.user.id,
        change_note: change_note || '更新错误类型'
      });

      res.json({ message: '更新错误类型成功', errorType });
    } catch (error) {
      console.error('更新错误类型错误:', error);
      res.status(500).json({ message: '更新错误类型失败' });
    }
  },

  // 删除错误类型
  deleteErrorType: async (req, res) => {
    try {
      const { id } = req.params;

      const errorType = await ErrorType.findByPk(id);
      if (!errorType) {
        return res.status(404).json({ message: '错误类型不存在' });
      }

      // 检查是否为系统预设错误类型
      if (!errorType.is_custom) {
        return res.status(400).json({ message: '系统预设错误类型不能删除' });
      }

      await errorType.destroy();
      res.json({ message: '删除错误类型成功' });
    } catch (error) {
      console.error('删除错误类型错误:', error);
      res.status(500).json({ message: '删除错误类型失败' });
    }
  },

  // 获取错误类型的版本历史
  getErrorTypeVersions: async (req, res) => {
    try {
      const { id } = req.params;

      const errorType = await ErrorType.findByPk(id);
      if (!errorType) {
        return res.status(404).json({ message: '错误类型不存在' });
      }

      const versions = await ErrorTypeVersion.findAll({
        where: { error_type_id: id },
        order: [['version', 'DESC']]
      });

      res.json({ versions });
    } catch (error) {
      console.error('获取错误类型版本历史错误:', error);
      res.status(500).json({ message: '获取错误类型版本历史失败' });
    }
  },

  // 获取错误类型分类列表
  getErrorTypeCategories: async (req, res) => {
    try {
      const categories = await ErrorType.findAll({
        attributes: ['category'],
        group: ['category'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      });

      res.json({
        categories: categories.map(item => item.category)
      });
    } catch (error) {
      console.error('获取错误类型分类列表错误:', error);
      res.status(500).json({ message: '获取错误类型分类列表失败' });
    }
  }
};

module.exports = errorTypeController;