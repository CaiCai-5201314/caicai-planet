import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAdminUser } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 先调用普通登录
      const response = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      const { token, user } = response.data;

      // 检查是否为管理员
      if (user.role !== 'admin') {
        toast.error('无权访问，仅管理员可登录');
        setIsLoading(false);
        return;
      }

      // 保存登录状态
      localStorage.setItem('token', token);
      
      // 直接更新 authStore 的状态
      setAdminUser(user);

      toast.success('管理员登录成功！');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧背景区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-planet-purple/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center mb-8">
            <FiShield className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">管理员后台</h1>
          <p className="text-xl text-gray-400 mb-8">
            菜菜星球管理系统<br />
            仅限授权人员访问
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>系统运行正常</span>
            </span>
          </div>
        </div>
        
        {/* 装饰性元素 */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-full" />
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-white/5 rounded-full" />
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            返回首页
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-6">
              <FiShield className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">管理员登录</h2>
            <p className="mt-2 text-gray-600">
              此页面仅限管理员访问
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm">
              <FiShield className="mr-2" />
              受保护区域
            </div>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理员账号
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiShield size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all"
                    placeholder="请输入管理员账号"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 outline-none transition-all"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-black text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '管理员登录'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                普通用户请使用{' '}
                <Link to="/login" className="text-planet-purple hover:text-planet-pink font-medium">
                  普通登录页面
                </Link>
              </p>
            </div>

            {/* 安全提示 */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <FiShield className="text-amber-600 mt-0.5" size={18} />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">安全提示</p>
                  <p className="text-amber-700">
                    此页面为管理员专用入口。未经授权的访问将被记录并可能导致账号被封禁。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
