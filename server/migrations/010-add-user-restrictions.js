module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 is_muted 字段
    await queryInterface.addColumn('users', 'is_muted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否禁言'
    });

    // 添加 is_post_banned 字段
    await queryInterface.addColumn('users', 'is_post_banned', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否禁止发布'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'is_muted');
    await queryInterface.removeColumn('users', 'is_post_banned');
  }
};
