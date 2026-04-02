module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 uid 字段
    await queryInterface.addColumn('users', 'uid', {
      type: Sequelize.STRING(5),
      allowNull: true,
      unique: true,
      comment: '5位数字用户ID，不可修改'
    });

    // 为现有用户生成 uid
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE uid IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      const uid = Math.floor(10000 + Math.random() * 90000).toString();
      await queryInterface.sequelize.query(
        `UPDATE users SET uid = '${uid}' WHERE id = ${user.id}`
      );
    }

    // 修改 uid 字段为不允许 null
    await queryInterface.changeColumn('users', 'uid', {
      type: Sequelize.STRING(5),
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'uid');
  }
};
