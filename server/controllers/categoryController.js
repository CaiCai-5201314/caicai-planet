const { Category, Post } = require('../models');

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        include: [
          {
            model: Post,
            as: 'posts',
            where: { status: 'published' },
            required: false,
            attributes: ['id']
          }
        ]
      });

      const categoriesWithCount = categories.map(cat => ({
        ...cat.toJSON(),
        postCount: cat.posts ? cat.posts.length : 0
      }));

      res.json({ categories: categoriesWithCount });
    } catch (error) {
      console.error('获取分类错误:', error);
      res.status(500).json({ message: '获取分类失败' });
    }
  },

  getCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }

      const postCount = await Post.count({
        where: { category_id: id, status: 'published' }
      });

      res.json({
        category: {
          ...category.toJSON(),
          postCount
        }
      });
    } catch (error) {
      console.error('获取分类详情错误:', error);
      res.status(500).json({ message: '获取分类详情失败' });
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name, description, icon, sort_order } = req.body;

      const category = await Category.create({
        name,
        description,
        icon,
        sort_order: sort_order || 0
      });

      res.status(201).json({
        message: '分类创建成功',
        category
      });
    } catch (error) {
      console.error('创建分类错误:', error);
      res.status(500).json({ message: '创建分类失败' });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon, sort_order } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }

      await category.update({
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        icon: icon !== undefined ? icon : category.icon,
        sort_order: sort_order !== undefined ? sort_order : category.sort_order
      });

      res.json({
        message: '分类更新成功',
        category
      });
    } catch (error) {
      console.error('更新分类错误:', error);
      res.status(500).json({ message: '更新分类失败' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: '分类不存在' });
      }

      await category.destroy();

      res.json({ message: '分类删除成功' });
    } catch (error) {
      console.error('删除分类错误:', error);
      res.status(500).json({ message: '删除分类失败' });
    }
  }
};

module.exports = categoryController;
