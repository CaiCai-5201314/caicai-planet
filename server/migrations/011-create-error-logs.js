'use strict';

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('error_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      error_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      severity: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      stack: {
        type: Sequelize.TEXT
      },
      url: {
        type: Sequelize.STRING(255)
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      device_info: {
        type: Sequelize.JSON
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      environment: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      context: {
        type: Sequelize.JSON
      },
      count: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      first_seen: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 添加索引
    await queryInterface.addIndex('error_logs', ['type']);
    await queryInterface.addIndex('error_logs', ['severity']);
    await queryInterface.addIndex('error_logs', ['user_id']);
    await queryInterface.addIndex('error_logs', ['first_seen']);
    await queryInterface.addIndex('error_logs', ['last_seen']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('error_logs');
  }
};
