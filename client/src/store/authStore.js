import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import errorTracker from '../utils/errorTracker';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          set({ user, isAuthenticated: true, isLoading: false });
          errorTracker.setUserId(user.id);
          return { success: true };
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
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
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

      updateCover: (cover_image) => {
        const currentUser = get().user;
        if (currentUser) {
          // 创建全新的用户对象，确保重新渲染
          const newUser = { ...currentUser, cover_image };
          set({ user: newUser });
        }
      },

      setAdminUser: (userData) => {
        set({ user: userData, isAuthenticated: true });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
