'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 插入提议任务被完成的月球分规则
    await queryInterface.bulkInsert('moon_point_rules', [
      {
        name: '提议任务被完成奖励',
        reason_type: 'proposal_task_completed',
        base_points: 1.0,
        need_approval: true,
        daily_limit: null,
        is_active: true,
        description: '当用户提议的任务被其他用户完成时，提议用户获得1点月球分，需要管理员审核后发放',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // 删除提议任务被完成的月球分规则
    await queryInterface.bulkDelete('moon_point_rules', {
      reason_type: 'proposal_task_completed'
    }, {});
  }
};
