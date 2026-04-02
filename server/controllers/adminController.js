const { User, Post, Comment, FriendLink, SiteConfig, BannedWord, Sequelize } = require('../models');
const { Op } = Sequelize;
const { createNotification } = require('./notificationController');
const { hashPassword } = require('../utils/password');

const adminController = {
  getDashboard: async (req, res) => {
    try {
      // 获取今日开始时间
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        userCount,
        postCount,
        commentCount,
        pendingFriendLinks,
        recentUsers,
        recentPosts,
        todayNewUsers,
        todayNewPosts,
        todayNewComments
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
        Comment.count({ where: { created_at: { [Op.gte]: today } } })
      ]);

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
          runningDays
        },
        recentUsers,
        recentPosts
      });
    } catch (error) {
      console.error('获取仪表盘数据错误:', error);
      res.status(500).json({ message: '获取仪表盘数据失败' });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status, role } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { nickname: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (role) where.role = role;

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({ message: '获取用户列表失败' });
    }
  },

  // 更新用户信息（昵称、密码）
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { nickname, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (password) {
        updateData.password = await hashPassword(password);
      }

      await user.update(updateData);

      res.json({
        message: '用户信息更新成功',
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({ message: '更新用户信息失败' });
    }
  },

  // 更新用户头像
  updateUserAvatar: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: '请上传头像文件' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const avatar = `/uploads/avatars/${req.file.filename}`;
      await user.update({ avatar });

      res.json({
        message: '头像更新成功',
        avatar
      });
    } catch (error) {
      console.error('更新用户头像错误:', error);
      res.status(500).json({ message: '更新头像失败' });
    }
  },

  // 封禁/解封用户
  banUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { banned, reason, duration } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ status: banned ? 'banned' : 'active' });

      // 发送封禁邮件
      if (banned && reason && user.email) {
        try {
          const { transporter } = require('../config/email');
          const banEndDate = duration === -1 
            ? '永久' 
            : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN');
          
          const mailOptions = {
            from: `"菜菜星球" <${process.env.EMAIL_USER || 'caicaifensi520@163.com'}>`,
            to: user.email,
            subject: '菜菜星球 - 账号封禁通知',
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0;">菜菜星球</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">账号封禁通知</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #333; font-size: 16px;">亲爱的 ${user.nickname || user.username}：</p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 15px;">您的账号因以下原因被封禁：</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <p style="color: #333; font-size: 14px; line-height: 1.6;">{reason}</p>
                  </div>
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">封禁时长：<strong>${duration === -1 ? '永久' : `${duration}天`}</strong></p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6;">封禁结束时间：<strong>${banEndDate}</strong></p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">如有疑问，请联系管理员。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 10px;">此邮件为系统自动发送，请勿直接回复。</p>
                </div>
              </div>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log('封禁邮件已发送');
        } catch (emailError) {
          console.error('发送封禁邮件失败:', emailError);
        }
      }

      // 发送封禁通知
      if (banned && reason) {
        const banEndDate = duration === -1 
          ? '永久' 
          : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN');
        const content = `您的账号因以下原因被封禁：${reason}，封禁时长：${duration === -1 ? '永久' : `${duration}天`}，封禁结束时间：${banEndDate}`;
        await createNotification(user.id, 'admin', content);
      }

      // 发送解封邮件
      if (!banned && user.email) {
        try {
          const { transporter } = require('../config/email');
          
          const mailOptions = {
            from: `"菜菜星球" <${process.env.EMAIL_USER || 'caicaifensi520@163.com'}>`,
            to: user.email,
            subject: '菜菜星球 - 账号解封通知',
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0;">菜菜星球</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">账号解封通知</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #333; font-size: 16px;">亲爱的 ${user.nickname || user.username}：</p>
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 15px;">您的账号已被解封，现在可以正常使用菜菜星球的所有功能。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 20px;">如有疑问，请联系管理员。</p>
                  <p style="color: #999; font-size: 12px; margin-top: 10px;">此邮件为系统自动发送，请勿直接回复。</p>
                </div>
              </div>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log('解封邮件已发送');
        } catch (emailError) {
          console.error('发送解封邮件失败:', emailError);
        }
      }

      // 发送解封通知
      if (!banned) {
        const content = '您的账号已被解封，现在可以正常使用菜菜星球的所有功能。';
        await createNotification(user.id, 'admin', content);
      }

      res.json({
        message: banned ? '用户已封禁' : '用户已解封',
        user: {
          id: user.id,
          username: user.username,
          status: user.status
        }
      });
    } catch (error) {
      console.error('封禁用户错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  // 禁言/解除禁言
  muteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { muted } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ is_muted: muted });

      // 发送禁言/解除禁言通知
      const content = muted ? '您的账号已被禁言，无法发送评论' : '您的禁言已解除，可以正常发送评论';
      await createNotification(user.id, 'admin', content);

      res.json({
        message: muted ? '用户已禁言' : '禁言已解除',
        user: {
          id: user.id,
          username: user.username,
          is_muted: user.is_muted
        }
      });
    } catch (error) {
      console.error('禁言用户错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  // 禁止/允许发布
  postBanUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { postBanned } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      await user.update({ is_post_banned: postBanned });

      // 发送禁止/允许发布通知
      const content = postBanned ? '您的账号已被禁止发布文章' : '您的账号已被允许发布文章';
      await createNotification(user.id, 'admin', content);

      res.json({
        message: postBanned ? '已禁止用户发布' : '已允许用户发布',
        user: {
          id: user.id,
          username: user.username,
          is_post_banned: user.is_post_banned
        }
      });
    } catch (error) {
      console.error('禁止发布错误:', error);
      res.status(500).json({ message: '操作失败' });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (role) updateData.role = role;

      await user.update(updateData);

      res.json({
        message: '用户状态更新成功',
        user: {
          id: user.id,
          username: user.username,
          status: user.status,
          role: user.role
        }
      });
    } catch (error) {
      console.error('更新用户状态错误:', error);
      res.status(500).json({ message: '更新用户状态失败' });
    }
  },

  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status, category } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;
      if (category) where.category_id = category;

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取文章列表错误:', error);
      res.status(500).json({ message: '获取文章列表失败' });
    }
  },

  getComments: async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { count, rows: comments } = await Comment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取评论列表错误:', error);
      res.status(500).json({ message: '获取评论列表失败' });
    }
  },

  getFriendLinks: async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

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
      console.error('获取友链列表错误:', error);
      res.status(500).json({ message: '获取友链列表失败' });
    }
  },

  // 获取网站配置
  getSiteConfigs: async (req, res) => {
    try {
      const configs = await SiteConfig.findAll();
      
      // 转换为键值对格式
      const configMap = {};
      configs.forEach(config => {
        configMap[config.key] = config.value;
      });
      
      res.json({
        configs: configMap
      });
    } catch (error) {
      console.error('获取网站配置错误:', error);
      res.status(500).json({ message: '获取网站配置失败' });
    }
  },

  // 更新网站配置
  updateSiteConfig: async (req, res) => {
    try {
      const { key, value, description } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: '配置键不能为空' });
      }
      
      // 查找或创建配置
      const [config, created] = await SiteConfig.findOrCreate({
        where: { key },
        defaults: {
          value,
          description
        }
      });
      
      // 如果已存在，则更新
      if (!created) {
        await config.update({
          value,
          description
        });
      }
      
      res.json({
        message: created ? '配置创建成功' : '配置更新成功',
        config: {
          key: config.key,
          value: config.value,
          description: config.description
        }
      });
    } catch (error) {
      console.error('更新网站配置错误:', error);
      res.status(500).json({ message: '更新网站配置失败' });
    }
  },

  // 批量更新网站配置
  batchUpdateSiteConfig: async (req, res) => {
    try {
      const configs = req.body.configs;
      
      if (!Array.isArray(configs)) {
        return res.status(400).json({ message: '配置数据格式错误' });
      }
      
      const updatedConfigs = [];
      
      for (const configData of configs) {
        const { key, value, description } = configData;
        
        if (!key) continue;
        
        const [config, created] = await SiteConfig.findOrCreate({
          where: { key },
          defaults: {
            value,
            description
          }
        });
        
        if (!created) {
          await config.update({
            value,
            description
          });
        }
        
        updatedConfigs.push({
          key: config.key,
          value: config.value,
          description: config.description
        });
      }
      
      res.json({
        message: '配置更新成功',
        configs: updatedConfigs
      });
    } catch (error) {
      console.error('批量更新网站配置错误:', error);
      res.status(500).json({ message: '更新网站配置失败' });
    }
  },

  // 获取评论列表（管理员）
  getComments: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (search) {
        where.content = {
          [Op.like]: `%${search}%`
        };
      }

      const { count, rows: comments } = await Comment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          },
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title']
          },
          {
            model: Comment,
            as: 'parent',
            attributes: ['id', 'content'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'nickname']
              }
            ]
          },
          {
            model: Comment,
            as: 'replies',
            where: { status: 'active' },
            required: false,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('获取评论列表错误:', error);
      res.status(500).json({ message: '获取评论列表失败' });
    }
  },

  // 更新评论状态
  updateCommentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      const oldStatus = comment.status;
      await comment.update({ status });

      // 如果状态从非active变为active，增加文章评论数
      if (oldStatus !== 'active' && status === 'active') {
        await Post.increment('comment_count', { where: { id: comment.post_id } });
      }
      // 如果状态从active变为非active，减少文章评论数
      if (oldStatus === 'active' && status !== 'active') {
        await Post.decrement('comment_count', { where: { id: comment.post_id } });
      }

      res.json({
        message: '评论状态更新成功',
        comment: {
          id: comment.id,
          status: comment.status
        }
      });
    } catch (error) {
      console.error('更新评论状态错误:', error);
      res.status(500).json({ message: '更新评论状态失败' });
    }
  },

  // 回复评论（管理员）
  replyComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const parentComment = await Comment.findByPk(id);
      if (!parentComment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      const reply = await Comment.create({
        post_id: parentComment.post_id,
        content,
        parent_id: id,
        user_id: req.user.id,
        status: 'active'
      });

      await Post.increment('comment_count', { where: { id: parentComment.post_id } });

      const newReply = await Comment.findByPk(reply.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'nickname', 'avatar']
          }
        ]
      });

      res.status(201).json({
        message: '回复成功',
        comment: newReply
      });
    } catch (error) {
      console.error('回复评论错误:', error);
      res.status(500).json({ message: '回复评论失败' });
    }
  },

  // 更新文章状态（审核）
  updatePostStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const post = await Post.findByPk(id, {
        include: [{ model: User, as: 'author' }]
      });
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      await post.update({ status });

      // 发送文章审核通知
      let content = '';
      if (status === 'published') {
        content = `您的文章《${post.title}》已审核通过，现在可以在社区页面查看。`;
      } else if (status === 'rejected') {
        content = `您的文章《${post.title}》审核未通过，无法在社区页面显示。`;
      }

      if (content) {
        await createNotification(post.author_id, 'post_approval', content, post.id);
      }

      res.json({
        message: '文章状态更新成功',
        post: {
          id: post.id,
          title: post.title,
          status: post.status
        }
      });
    } catch (error) {
      console.error('更新文章状态错误:', error);
      res.status(500).json({ message: '更新文章状态失败' });
    }
  }
};

module.exports = adminController;
