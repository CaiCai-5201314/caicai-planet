const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EventParticipant = sequelize.define('EventParticipant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'virtual_events',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'registered',
      validate: {
        isIn: [['registered', 'completed']]
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'event_participants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  EventParticipant.associate = (models) => {
    EventParticipant.belongsTo(models.VirtualEvent, {
      foreignKey: 'event_id',
      as: 'event'
    });
  };

  return EventParticipant;
};
