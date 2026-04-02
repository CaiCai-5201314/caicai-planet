module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#3b82f6'
    }
  }, {
    tableName: 'tags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Post, {
      through: 'post_tags',
      foreignKey: 'tag_id',
      otherKey: 'post_id',
      as: 'posts'
    });
  };

  return Tag;
};
