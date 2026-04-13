const { User, Post, Comment, FriendLink, Sequelize } = require('../models');
const { Op } = Sequelize;

const dashboardAdminController = {
  getDashboard: async (req, res) => {
    try {
      // 获取今日开始时间
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 计算本周一的开始时间
      const thisMonday = new Date();
      const dayOfWeek = thisMonday.getDay(); // 0-6, 0是周日
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      thisMonday.setDate(thisMonday.getDate() + daysToMonday);
      thisMonday.setHours(0, 0, 0, 0);

      // 计算上周一的开始时间
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(lastMonday.getDate() - 7);

      // 获取本周一的统计数据（截止到当前时间）
      const [
        userCount,
        postCount,
        commentCount,
        pendingFriendLinks,
        recentUsers,
        recentPosts,
        todayNewUsers,
        todayNewPosts,
        todayNewComments,
        thisWeekUsers,
        thisWeekPosts,
        thisWeekComments,
        lastWeekUsers,
        lastWeekPosts,
        lastWeekComments
      ] = await Promise.all([
        User.count(),
        Post.count({ where: { status: 'published' } }),
        Comment.count(),
        FriendLink.count({ where: { status: 'pending' } }),
        User.findAll({
          order: [['created_at', 'DESC']],
          limit: 5,
          attributes: ['id', 'username', 'nickname', 'avatar', 'created_at']
        }),
        Post.findAll({
          where: { status: 'published' },
          order: [['created_at', 'DESC']],
          limit: 5,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'nickname']
            }
          ]
        }),
        User.count({ where: { created_at: { [Op.gte]: today } } }),
        Post.count({ where: { created_at: { [Op.gte]: today } } }),
        Comment.count({ where: { created_at: { [Op.gte]: today } } }),
        // 本周一到现在的新增数据
        User.count({ where: { created_at: { [Op.gte]: thisMonday } } }),
        Post.count({ where: { created_at: { [Op.gte]: thisMonday }, status: 'published' } }),
        Comment.count({ where: { created_at: { [Op.gte]: thisMonday } } }),
        // 上周一到本周一的新增数据
        User.count({ where: { 
          created_at: { 
            [Op.gte]: lastMonday,
            [Op.lt]: thisMonday 
          } 
        } }),
        Post.count({ where: { 
          created_at: { 
            [Op.gte]: lastMonday,
            [Op.lt]: thisMonday 
          },
          status: 'published' 
        } }),
        Comment.count({ where: { 
          created_at: { 
            [Op.gte]: lastMonday,
            [Op.lt]: thisMonday 
          } 
        } })
      ]);

      // 计算增长率（如果上周为0，显示100%）
      const calculateTrend = (current, previous) => {
        if (previous === 0) {
          return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100);
      };

      const userTrend = calculateTrend(thisWeekUsers, lastWeekUsers);
      const postTrend = calculateTrend(thisWeekPosts, lastWeekPosts);
      const commentTrend = calculateTrend(thisWeekComments, lastWeekComments);

      // 计算系统运行天数（从最早用户注册时间开始）
      const firstUser = await User.findOne({
        order: [['created_at', 'ASC']],
        attributes: ['created_at']
      });
      const runningDays = firstUser 
        ? Math.ceil((Date.now() - new Date(firstUser.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 1;

      res.json({
        stats: {
          userCount,
          postCount,
          commentCount,
          pendingFriendLinks,
          todayNewUsers,
          todayNewPosts,
          todayNewComments,
          runningDays,
          userTrend,
          postTrend,
          commentTrend,
          thisMonday: thisMonday.toISOString(),
          lastMonday: lastMonday.toISOString()
        },
        recentUsers,
        recentPosts
      });
    } catch (error) {
      console.error('获取仪表盘数据错误:', error);
      res.status(500).json({ message: '获取仪表盘数据失败' });
    }
  }
};

module.exports = dashboardAdminController;