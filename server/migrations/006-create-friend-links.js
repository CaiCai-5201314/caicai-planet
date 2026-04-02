module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('friend_links', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('tech', 'life', 'design', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reciprocal_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_reciprocal_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('friend_links');
  }
};
