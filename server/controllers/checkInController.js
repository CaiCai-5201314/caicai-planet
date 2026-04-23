const { CheckIn, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const { applyMoonPoints } = require('../services/moonPointService');

const checkInController = {
  // 检查用户今日是否已打卡
  checkTodayStatus: async (req, res) => {
    try {
      // 使用本地时间获取今天的日期，解决时区问题
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const checkIn = await CheckIn.findOne({
        where: {
          user_id: req.user.id,
          check_in_date: localToday
        }
      });

      res.json({
        hasCheckedIn: !!checkIn,
        checkIn: checkIn ? checkIn.toJSON() : null
      });
    } catch (error) {
      console.error('检查打卡状态错误:', error);
      res.status(500).json({ message: '检查打卡状态失败' });
    }
  },

  // 执行打卡操作
  performCheckIn: async (req, res) => {
    try {
      const userId = req.user.id;
      // 使用本地时间获取今天的日期，解决时区问题
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const now = new Date();

      // 检查今天是否已经打卡
      const existingCheckIn = await CheckIn.findOne({
        where: {
          user_id: userId,
          check_in_date: localToday
        }
      });

      if (existingCheckIn) {
        return res.status(400).json({ message: '今天已经打卡过了' });
      }

      // 获取用户IP和用户代理
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      // 获得10点经验值
      const expEarned = 10;
      
      // 创建打卡记录
      const checkIn = await CheckIn.create({
        user_id: userId,
        check_in_date: localToday,
        check_in_time: now,
        status: 'success',
        ip_address: ipAddress,
        user_agent: userAgent,
        exp_earned: expEarned
      });
      
      // 更新用户经验值
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ exp: user.exp + expEarned });
      }

      // 集成月球分规则系统 - 申请/发放月球分
      let moonPointResult = null;
      try {
        moonPointResult = await applyMoonPoints(userId, 'check_in', checkIn.id);
      } catch (moonPointError) {
        console.error('发放月球分失败:', moonPointError);
        // 不影响打卡成功，只是月球分发放失败
      }

      res.json({
        message: '打卡成功',
        checkIn: checkIn.toJSON(),
        expEarned: expEarned,
        moonPoint: moonPointResult
      });
    } catch (error) {
      console.error('打卡错误:', error);
      res.status(500).json({ message: '打卡失败' });
    }
  },

  // 获取用户的打卡记录
  getUserCheckIns: async (req, res) => {
    try {
      const { page = 1, limit = 30 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: checkIns } = await CheckIn.findAndCountAll({
        where: { user_id: req.user.id },
        order: [['check_in_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        checkIns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取打卡记录错误:', error);
      res.status(500).json({ message: '获取打卡记录失败' });
    }
  },

  // 管理员获取所有打卡记录
  getAllCheckIns: async (req, res) => {
    try {
      const { page = 1, limit = 50, date, userId } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (date) {
        where.check_in_date = date;
      }
      if (userId) {
        where.user_id = userId;
      }

      const { count, rows: checkIns } = await CheckIn.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'uid', 'username', 'nickname', 'avatar']
          }
        ],
        order: [['check_in_date', 'DESC'], ['check_in_time', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // 确保返回的是JSON格式
      const checkInsData = await Promise.all(checkIns.map(async (checkIn) => {
        const checkInObj = checkIn.toJSON();
        // 确保用户对象包含uid字段
        if (checkInObj.user) {
          checkInObj.user.uid = checkInObj.user.uid || checkInObj.user.id;
        }
        
        // 获取该用户的累计打卡天数
        const userCheckInCount = await CheckIn.count({
          where: { user_id: checkInObj.user_id, status: 'success' }
        });
        checkInObj.user_total_checkins = userCheckInCount;
        
        console.log('CheckIn:', checkInObj.id, 'User ID:', checkInObj.user_id, 'Total check-ins:', userCheckInCount);
        
        return checkInObj;
      }));

      res.json({
        checkIns: checkInsData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取所有打卡记录错误:', error);
      res.status(500).json({ message: '获取打卡记录失败' });
    }
  },

  // 获取打卡统计数据
  getCheckInStats: async (req, res) => {
    try {
      // 使用本地时间获取今天的日期，解决时区问题
      const today = new Date();
      const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 今日打卡人数
      const todayCount = await CheckIn.count({
        where: { check_in_date: localToday, status: 'success' }
      });

      // 近30天打卡次数
      const thirtyDaysCount = await CheckIn.count({
        where: {
          check_in_date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] },
          status: 'success'
        }
      });

      // 总打卡次数
      const totalCount = await CheckIn.count({
        where: { status: 'success' }
      });

      res.json({
        todayCount,
        thirtyDaysCount,
        totalCount
      });
    } catch (error) {
      console.error('获取打卡统计错误:', error);
      res.status(500).json({ message: '获取打卡统计失败' });
    }
  }
};

module.exports = checkInController;
