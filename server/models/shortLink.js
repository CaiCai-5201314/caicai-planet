module.exports = (sequelize, DataTypes) => {
  const ShortLink = sequelize.define('ShortLink', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    original_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    short_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    click_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'short_links',
    timestamps: false
  });

  return ShortLink;
};