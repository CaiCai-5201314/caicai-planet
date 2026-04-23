import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import errorTracker from '../utils/errorTracker';
import sessionChecker from '../utils/sessionChecker';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        // 重置主动退出登录标志
        sessionChecker.setManualLogout(false);
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user, checkIn, expBonus } = response.data;
          localStorage.setItem('token', token);
          // 将token存储到cookie中，有效期7天
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Strict`;
          set({ user, isAuthenticated: true, isLoading: false });
          errorTracker.setUserId(user.id);
          return { success: true, checkIn, expBonus };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '登录失败';
          set({
            error: errorMessage,
            isLoading: false
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          // 将token存储到cookie中，有效期7天
          document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Strict`;
          set({ user, isAuthenticated: true, isLoading: false });
          errorTracker.setUserId(user.id);
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '注册失败';
          set({
            error: errorMessage,
            isLoading: false
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        // 设置为主动退出登录
        sessionChecker.setManualLogout(true);
        // 停止 sessionChecker，防止显示登录过期提示
        sessionChecker.stopChecking();
        localStorage.removeItem('token');
        // 清除cookie中的token
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          // 401错误已经在api.js中统一处理了
        }
      },

      updateProfile: async (data) => {
        try {
          const response = await api.put('/auth/profile', data);
          set({ user: { ...get().user, ...response.data.user } });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      updateAvatar: (avatar) => {
        const currentUser = get().user;
        if (currentUser) {
          // 创建全新的用户对象，确保重新渲染
          const newUser = { ...currentUser, avatar };
          set({ user: newUser });
        }
      },



      setAdminUser: (userData) => {
        set({ user: userData, isAuthenticated: true });
      },
      
      // 重置登录状态
      resetAuth: () => {
        set({ user: null, isAuthenticated: false, error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
