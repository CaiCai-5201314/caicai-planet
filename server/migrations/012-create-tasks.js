module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '任务名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '任务描述'
      },
      type: {
        type: Sequelize.ENUM('sports', 'tech', 'beauty', 'crafts', 'other'),
        defaultValue: 'other',
        comment: '任务类型'
      },
      gender: {
        type: Sequelize.ENUM('male', 'female'),
        allowNull: false,
        comment: '任务所属性别专区：male-男版，female-女版'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'expired', 'disabled'),
        defaultValue: 'draft',
        comment: '任务状态：draft-待发布，published-已发布，expired-已过期，disabled-已禁用'
      },
      difficulty: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium',
        comment: '任务难度：easy-简单，medium-中等，hard-困难'
      },
      reward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '任务奖励积分'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '生效时间'
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '过期时间'
      },
      maxParticipants: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '最大参与人数'
      },
      currentParticipants: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '当前参与人数'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '任务图标'
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '任务卡片颜色'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        comment: '创建者ID'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加索引
    await queryInterface.addIndex('tasks', ['gender']);
    await queryInterface.addIndex('tasks', ['status']);
    await queryInterface.addIndex('tasks', ['type']);
    await queryInterface.addIndex('tasks', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tasks');
  }
};
