const { FriendLink, User, Sequelize } = require('../models');
const { Op } = Sequelize;

const friendLinkController = {
  getFriendLinks: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (category) where.category = category;

      const { count, rows: friendLinks } = await FriendLink.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        friendLinks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取友链错误:', error);
      res.status(500).json({ message: '获取友链失败' });
    }
  },

  applyFriendLink: async (req, res) => {
    try {
      const { name, url, avatar, description, category, reciprocal_url } = req.body;

      const existingLink = await FriendLink.findOne({
        where: {
          [Op.or]: [
            { url },
            { name }
          ]
        }
      });

      if (existingLink) {
        return res.status(409).json({ message: '该网站已申请过友链' });
      }

      const friendLink = await FriendLink.create({
        name,
        url,
        avatar,
        description,
        category: category || 'other',
        reciprocal_url,
        user_id: req.user ? (req.user.id || null) : null,
        status: 'pending'
      });

      res.status(201).json({
        message: '友链申请已提交，等待审核',
        friendLink
      });
    } catch (error) {
      console.error('申请友链错误:', error);
      res.status(500).json({ message: '申请友链失败' });
    }
  },

  getMyApplications: async (req, res) => {
    try {
      const applications = await FriendLink.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });

      res.json({ applications });
    } catch (error) {
      console.error('获取我的申请错误:', error);
      res.status(500).json({ message: '获取申请记录失败' });
    }
  },

  updateFriendLink: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, avatar, description, category, reciprocal_url } = req.body;

      const friendLink = await FriendLink.findByPk(id);
      if (!friendLink) {
        return res.status(404).json({ message: '友链不存在' });
      }

      if (friendLink.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权修改此友链' });
      }

      await friendLink.update({
        name: name || friendLink.name,
        url: url || friendLink.url,
        avatar: avatar !== undefined ? avatar : friendLink.avatar,
        description: description !== undefined ? description : friendLink.description,
        category: category || friendLink.category,
        reciprocal_url: reciprocal_url !== undefined ? reciprocal_url : friendLink.reciprocal_url
      });

      res.json({
        message: '友链更新成功',
        friendLink
      });
    } catch (error) {
      console.error('更新友链错误:', error);
      res.status(500).json({ message: '更新友链失败' });
    }
  },

  deleteFriendLink: async (req, res) => {
    try {
      const { id } = req.params;

      const friendLink = await FriendLink.findByPk(id);
      if (!friendLink) {
        return res.status(404).json({ message: '友链不存在' });
      }

      if (friendLink.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: '无权删除此友链' });
      }

      await friendLink.destroy();

      res.json({ message: '友链删除成功' });
    } catch (error) {
      console.error('删除友链错误:', error);
      res.status(500).json({ message: '删除友链失败' });
    }
  },

  approveFriendLink: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const friendLink = await FriendLink.findByPk(id);
      if (!friendLink) {
        return res.status(404).json({ message: '友链不存在' });
      }

      await friendLink.update({ status });

      res.json({
        message: status === 'approved' ? '友链审核通过' : '友链已拒绝',
        friendLink
      });
    } catch (error) {
      console.error('审核友链错误:', error);
      res.status(500).json({ message: '审核友链失败' });
    }
  }
};

module.exports = friendLinkController;
