const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VirtualEvent = sequelize.define('VirtualEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'upcoming',
      validate: {
        isIn: [['upcoming', 'active', 'ended']]
      }
    },
    reward_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'points'
    },
    reward_value: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'virtual_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  VirtualEvent.associate = (models) => {
    VirtualEvent.hasMany(models.EventParticipant, {
      foreignKey: 'event_id',
      as: 'participants'
    });
  };

  return VirtualEvent;
};
