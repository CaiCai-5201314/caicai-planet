import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      toast.success('登录成功！');
      navigate('/');
    } else {
      toast.error(result.error || '登录失败');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">欢迎回来</h1>
          <p className="text-xl text-white/80 mb-8">
            登录菜菜星球，继续你的探索之旅
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <div className="font-semibold">加入社区</div>
              <div className="text-white/70 text-sm">与志同道合的朋友交流</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8">
            <FiArrowLeft className="mr-2" />
            返回首页
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">菜</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">登录账号</h2>
            <p className="mt-2 text-gray-600">
              还没有账号？{' '}
              <Link to="/register" className="text-planet-purple hover:text-planet-pink font-medium">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名或邮箱
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field pl-12"
                    placeholder="请输入用户名或邮箱"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12 pr-12"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-planet-purple focus:ring-planet-purple" />
                  <span className="ml-2 text-sm text-gray-600">记住我</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-planet-purple hover:text-planet-pink">
                  忘记密码？
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">其他登录方式</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-lg mr-2">📧</span>
                  <span className="text-sm text-gray-600">邮箱</span>
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-lg mr-2">💬</span>
                  <span className="text-sm text-gray-600">微信</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
