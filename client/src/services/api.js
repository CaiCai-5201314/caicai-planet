import axios from 'axios';

// 全局变量，用于跟踪是否是主动退出登录
let isManualLogout = false;

// 导出函数来设置 isManualLogout 变量
export const setManualLogout = (value) => {
  isManualLogout = value;
};

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  withCredentials: true
});

// 从cookie中获取token的辅助函数
const getTokenFromCookie = () => {
  const cookie = document.cookie;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
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
    
    // 检查是否在管理员后台
    const isAdminPage = window.location.pathname.startsWith('/admin-caicai0304');
    
    // 只有在非登录请求、非管理员页面、且不是主动退出的情况下，才处理401错误
    if (error.response?.status === 401 && !isLoginRequest && !isAdminPage && !isManualLogout) {
      // 清除token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 直接跳转到登录页面，不显示提示
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
