module.exports = (sequelize, DataTypes) => {
  const LabSetting = sequelize.define('LabSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    lab_config: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify({
        labEnabled: true,
        eventMaxParticipants: 100,
        achievementThreshold: 5,
        rewardMultiplier: 1.0,
        customMessage: '欢迎来到星球实验室！',
        diceEnabled: true,
        diceSuccessReward: 0,
        diceSuccessRolls: 1,
        diceSuccessMessage: '恭喜你！投中了 {value} 点，允许做你想做的事情！',
        diceFailureMessage: '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！'
      })
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