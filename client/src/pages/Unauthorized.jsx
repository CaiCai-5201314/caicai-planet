import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-800 to-teal-700">
      {/* 动态背景元素 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* 401 数字 */}
        <div className="text-16xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 mb-6">401</div>
        
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white mb-4">未授权访问</h1>
        
        {/* 描述 */}
        <p className="text-lg text-white/80 mb-10 leading-relaxed">
          抱歉，您需要登录才能访问此页面
        </p>
        
        {/* 按钮 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLogin}
            className="px-6 py-3 rounded-full bg-white text-blue-900 font-semibold hover:bg-blue-100 transition-all transform hover:scale-105 shadow-lg"
          >
            去登录
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full bg-transparent border border-white text-white font-semibold hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105 shadow-lg"
          >
            返回首页
          </button>
        </div>
        
        {/* 装饰元素 */}
        <div className="mt-12 flex justify-center space-x-8">
          <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;