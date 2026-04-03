module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_types', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '任务类型名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '任务类型描述'
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'both'),
        allowNull: false,
        defaultValue: 'both',
        comment: '适用性别：male-男版，female-女版，both-通用'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '类型图标'
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '类型颜色'
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序顺序'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '是否启用'
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

    await queryInterface.addIndex('task_types', ['gender']);
    await queryInterface.addIndex('task_types', ['isActive']);
    await queryInterface.addIndex('task_types', ['sortOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_types');
  }
};
