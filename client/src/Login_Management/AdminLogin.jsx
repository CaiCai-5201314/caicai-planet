import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
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
      const response = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      const { token, user } = response.data;

      if (user.role !== 'admin' && user.role !== 'sub_admin') {
        toast.error('无权访问，仅管理员和子管理员可登录');
        setIsLoading(false);
        return;
      }

      if (user.status === 'inactive') {
        toast.error('账号未激活，请联系管理员处理');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      setAdminUser(user);

      toast.success('管理员登录成功！');
      navigate('/admin-caicai0304');
    } catch (error) {
      console.error('登录错误:', error);
      toast.error(error.response?.data?.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden p-4">
      {/* 背景装饰 */}
      <div className="absolute top-10 left-5 w-48 h-48 bg-white/10 rounded-full blur-3xl md:top-20 md:left-10 md:w-64 md:h-64" />
      <div className="absolute bottom-10 right-5 w-64 h-64 bg-white/5 rounded-full blur-3xl md:bottom-20 md:right-10 md:w-80 md:h-80" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 transform transition-all hover:shadow-2xl hover:shadow-purple-500/20">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center mb-3 md:w-16 md:h-16 md:mb-4 shadow-lg">
              <FiShield className="text-xl text-white md:text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 md:text-2xl">管理员登录</h2>
            <p className="text-gray-500 text-sm">请输入管理员账号和密码</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员账号
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-planet-purple" size={18} />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent text-base transition-all md:py-3"
                  placeholder="请输入管理员账号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-planet-purple" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent text-base transition-all md:py-3"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-planet-purple transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-6 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-medium rounded-lg hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base md:py-3"
            >
              {isLoading ? '登录中...' : '管理员登录'}
            </button>
          </form>
          
          <div className="mt-5 text-center md:mt-6">
            <Link to="/login" className="text-sm text-planet-purple hover:text-planet-pink transition-colors flex items-center justify-center space-x-1">
              <FiArrowLeft size={14} />
              <span>返回用户登录</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
