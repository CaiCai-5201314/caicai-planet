import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// 全局变量，用于跟踪是否是主动退出登录
let isManualLogout = false;
let redirectTimer = null;

// 导出函数来设置 isManualLogout 变量
export const setManualLogout = (value) => {
  isManualLogout = value;
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// 从cookie中获取token的辅助函数
const getTokenFromCookie = () => {
  const cookie = document.cookie;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
};

// 清除登录信息并跳转登录页
const clearAuthAndRedirect = (message) => {
  // 如果已经在登录页面或管理员后台，不需要跳转
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath.startsWith('/admin-caicai0304')) {
    return;
  }
  
  // 清除之前的定时器
  if (redirectTimer) {
    clearTimeout(redirectTimer);
  }
  
  // 清除token和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 显示提示
  if (message) {
    toast.error(message, {
      duration: 3000,
      style: {
        background: '#fff',
        color: '#374151',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        borderRadius: '8px',
        padding: '12px 16px'
      }
    });
  }
  
  // 3秒后跳转到登录页面
  redirectTimer = setTimeout(() => {
    // 再次检查是否还在登录页面或首页，避免重复跳转
    const path = window.location.pathname;
    if (path !== '/login' && !path.startsWith('/admin-caicai0304') && path !== '/') {
      window.location.href = '/login';
    }
  }, 3000);
};

api.interceptors.request.use(
  (config) => {
    // 从localStorage中获取token，如果没有则从cookie中获取
    let token = localStorage.getItem('token');
    if (!token) {
      token = getTokenFromCookie();
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 如果请求体是FormData，不要设置Content-Type头
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 检查是否是登录请求失败，如果是，不要处理
    const isLoginRequest = error.config?.url === '/auth/login';
    
    // 检查是否在登录页面
    const isLoginPage = window.location.pathname === '/login';
    
    // 检查是否在管理员后台
    const isAdminPage = window.location.pathname.startsWith('/admin-caicai0304');
    
    // 只有在非登录请求、非登录页面、非管理员页面、且不是主动退出的情况下，才处理401错误
    if (error.response?.status === 401 && !isLoginRequest && !isLoginPage && !isAdminPage && !isManualLogout) {
      // 检查是否有token
      const hasToken = localStorage.getItem('token') || getTokenFromCookie();
      
      if (hasToken) {
        // 有token但过期了
        clearAuthAndRedirect('登录已过期，请重新登录');
      } else {
        // 未登录时，只清除存储的用户信息，不显示提示
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
