'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('posts', 'pinned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '置顶时间'
    });
    await queryInterface.addIndex('posts', ['is_pinned']);
    await queryInterface.addIndex('posts', ['pinned_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('posts', ['pinned_at']);
    await queryInterface.removeIndex('posts', ['is_pinned']);
    await queryInterface.removeColumn('posts', 'pinned_at');
  }
};
