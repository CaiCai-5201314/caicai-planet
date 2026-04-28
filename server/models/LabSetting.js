module.exports = (sequelize, DataTypes) => {
  const LabSetting = sequelize.define('LabSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appreciation_config: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify({
        qrCodeUrl: '',
        alipayQrCodeUrl: '',
        wechatQrCodeUrl: '',
        enabled: true,
        description: '如果你喜欢我们的服务，可以请我们喝杯咖啡！'
      })
    },
    checkin_config: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify({
        enabled: true,
        dailyReward: 10,
        streakBonus: 5
      })
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  }, {
    tableName: 'lab_settings',
    timestamps: false
  });

  return LabSetting;
};