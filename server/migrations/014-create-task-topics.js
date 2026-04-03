module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_topics', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      taskTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'task_types',
          key: 'id'
        },
        comment: '所属任务类型ID'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '话题名称'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '话题描述'
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

    await queryInterface.addIndex('task_topics', ['taskTypeId']);
    await queryInterface.addIndex('task_topics', ['isActive']);
    await queryInterface.addIndex('task_topics', ['sortOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_topics');
  }
};
