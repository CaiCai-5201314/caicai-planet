module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '/uploads/avatars/default.png'
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cover_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      github: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      weibo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'banned'),
        allowNull: false,
        defaultValue: 'active'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('users');
  }
};
