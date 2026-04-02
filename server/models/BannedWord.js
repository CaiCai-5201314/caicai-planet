const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BannedWord = sequelize.define('BannedWord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    word: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    level: {
      type: DataTypes.ENUM('light', 'medium', 'high', 'severe'),
      allowNull: false,
      defaultValue: 'light'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'banned_words',
    timestamps: true
  });

  return BannedWord;
};