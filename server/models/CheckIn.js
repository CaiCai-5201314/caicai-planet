module.exports = (sequelize, DataTypes) => {
  const CheckIn = sequelize.define('CheckIn', {
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
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '打卡日期'
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '打卡时间'
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
      defaultValue: 'success',
      comment: '打卡状态'
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '打卡时的IP地址'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '打卡时的用户代理'
    },
    exp_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '本次打卡获得的经验值'
    }
  }, {
    tableName: 'check_ins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'check_in_date'],
        name: 'unique_user_date_checkin'
      },
      {
        fields: ['check_in_date'],
        name: 'idx_checkin_date'
      },
      {
        fields: ['user_id'],
        name: 'idx_checkin_user'
      }
    ]
  });

  CheckIn.associate = (models) => {
    CheckIn.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return CheckIn;
};
