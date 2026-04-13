import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiLogIn } from 'react-icons/fi';

const SessionExpiredModal = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 清除本地存储的token和用户信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 清除cookie中的token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    
    // 跳转到登录页面
    navigate('/login');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-500 shadow-2xl transform transition-all">
        <div className="flex flex-col items-center text-center">
          {/* 图标 */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <FiClock className="w-8 h-8 text-red-500" />
          </div>
          
          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            登录已过期
          </h2>
          
          {/* 消息 */}
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            您的登录状态已过期，请重新登录以继续使用系统
          </p>
          
          {/* 按钮 */}
          <div className="w-full">
            <button
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <FiLogIn className="w-5 h-5" />
              重新登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;