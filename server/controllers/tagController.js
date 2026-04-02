const { Tag, Post, Sequelize } = require('../models');
const { Op } = Sequelize;

const tagController = {
  getTags: async (req, res) => {
    try {
      const { search } = req.query;

      const where = {};
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const tags = await Tag.findAll({
        where,
        order: [['created_at', 'DESC']]
      });

      res.json({ tags });
    } catch (error) {
      console.error('获取标签错误:', error);
      res.status(500).json({ message: '获取标签失败' });
    }
  },

  getPopularTags: async (req, res) => {
    try {
      const tags = await Tag.findAll({
        include: [
          {
            model: Post,
            as: 'posts',
            where: { status: 'published' },
            required: false
          }
        ]
      });

      const sortedTags = tags
        .map(tag => ({
          ...tag.toJSON(),
          postCount: tag.posts ? tag.posts.length : 0
        }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 20);

      res.json({ tags: sortedTags });
    } catch (error) {
      console.error('获取热门标签错误:', error);
      res.status(500).json({ message: '获取热门标签失败' });
    }
  },

  createTag: async (req, res) => {
    try {
      const { name, color } = req.body;

      const tag = await Tag.create({
        name,
        color: color || '#3b82f6'
      });

      res.status(201).json({
        message: '标签创建成功',
        tag
      });
    } catch (error) {
      console.error('创建标签错误:', error);
      res.status(500).json({ message: '创建标签失败' });
    }
  },

  updateTag: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, color } = req.body;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        return res.status(404).json({ message: '标签不存在' });
      }

      await tag.update({
        name: name || tag.name,
        color: color || tag.color
      });

      res.json({
        message: '标签更新成功',
        tag
      });
    } catch (error) {
      console.error('更新标签错误:', error);
      res.status(500).json({ message: '更新标签失败' });
    }
  },

  deleteTag: async (req, res) => {
    try {
      const { id } = req.params;

      const tag = await Tag.findByPk(id);
      if (!tag) {
        return res.status(404).json({ message: '标签不存在' });
      }

      await tag.destroy();

      res.json({ message: '标签删除成功' });
    } catch (error) {
      console.error('删除标签错误:', error);
      res.status(500).json({ message: '删除标签失败' });
    }
  }
};

module.exports = tagController;
