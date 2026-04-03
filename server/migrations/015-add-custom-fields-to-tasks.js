module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tasks', 'customTypeId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'task_types',
        key: 'id'
      },
      comment: '自定义任务类型ID'
    });

    await queryInterface.addColumn('tasks', 'customTopicId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'task_topics',
        key: 'id'
      },
      comment: '自定义话题ID'
    });

    await queryInterface.addIndex('tasks', ['customTypeId']);
    await queryInterface.addIndex('tasks', ['customTopicId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tasks', 'customTypeId');
    await queryInterface.removeColumn('tasks', 'customTopicId');
  }
};
