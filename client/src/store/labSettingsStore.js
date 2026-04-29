import { create } from 'zustand';
import api from '../services/api';

export const useLabSettingsStore = create((set, get) => ({
  labEnabled: true,
  eventMaxParticipants: 100,
  achievementThreshold: 5,
  rewardMultiplier: 1.0,
  customMessage: '欢迎来到星球实验室！',
  diceEnabled: true,
  diceSuccessReward: 0,
  diceSuccessRolls: 1,
  diceSuccessMessage: '恭喜你！投中了 {value} 点，允许做你想做的事情！',
  diceFailureMessage: '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！',
  isLoading: false,

  fetchSettings: async () => {
    try {
      const response = await api.get('/lab/settings');
      if (response.data.success && response.data.settings) {
        set(response.data.settings);
      }
    } catch (error) {
      console.error('获取实验室设置失败:', error);
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const response = await api.put('/lab/settings', newSettings);
      if (response.data.success && response.data.settings) {
        set(response.data.settings);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: '更新失败' };
    } catch (error) {
      console.error('更新实验室设置失败:', error);
      return { success: false, message: '更新失败' };
    }
  },

  toggleLabEnabled: async () => {
    const currentEnabled = get().labEnabled;
    const result = await get().updateSettings({ labEnabled: !currentEnabled });
    return result;
  }
}));