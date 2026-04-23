const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnnouncementRead = sequelize.define('AnnouncementRead', {
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
      },
      onDelete: 'CASCADE'
    },
    announcement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'announcements',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    read_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'announcement_reads',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'announcement_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['announcement_id']
      }
    ]
  });

  return AnnouncementRead;
};