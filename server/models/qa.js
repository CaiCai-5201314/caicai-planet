module.exports = (sequelize, DataTypes) => {
  const QA = sequelize.define('QA', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'qa',
    timestamps: true
  });

  QA.associate = (models) => {
    // 可以在这里添加关联关系
  };

  return QA;
};