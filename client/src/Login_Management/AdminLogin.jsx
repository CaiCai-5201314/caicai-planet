import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiKey, FiServer, FiCheckCircle } from 'react-icons/fi';
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
  const [focusedInput, setFocusedInput] = useState(null);
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
    <div className="min-h-screen flex bg-slate-50">
      {/* 左侧背景区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        
        <div className="absolute top-10 right-10 w-64 h-64 border border-white/5 rounded-full animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 border border-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <div className="space-y-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <FiShield className="text-5xl text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                管理员后台
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                菜菜星球管理系统<br />
                仅限授权人员访问
              </p>
            </div>
            
            <div className="space-y-4 pt-8">
              <div className="flex items-center space-x-3 text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">系统运行正常</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <FiServer className="text-indigo-400 mb-2" size={20} />
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-slate-400">全天候服务</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <FiKey className="text-purple-400 mb-2" size={20} />
                  <div className="text-2xl font-bold">AES</div>
                  <div className="text-xs text-slate-400">加密传输</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 bg-slate-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-8 transition-colors group"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            返回首页
          </Link>
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-6 shadow-xl shadow-slate-200">
              <FiShield className="text-3xl text-white" />
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">管理员登录</h2>
            <p className="text-slate-500 text-lg">
              此页面仅限管理员访问
            </p>
            <div className="mt-6 inline-flex items-center px-5 py-2 bg-red-50 border border-red-100 rounded-full text-sm">
              <FiShield className="mr-2 text-red-500" />
              <span className="text-red-600 font-medium">受保护区域</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  管理员账号
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedInput === 'username' ? 'text-indigo-500' : 'text-slate-400'
                  }`}>
                    <FiShield size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    onFocus={() => setFocusedInput('username')}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-200 ${
                      focusedInput === 'username'
                        ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-indigo-50/50 focus:ring-4 focus:ring-indigo-500/10'
                    } outline-none text-slate-900 placeholder:text-slate-400`}
                    placeholder="请输入管理员账号"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  密码
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedInput === 'password' ? 'text-indigo-500' : 'text-slate-400'
                  }`}>
                    <FiLock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    className={`w-full pl-12 pr-14 py-4 rounded-2xl border-2 transition-all duration-200 ${
                      focusedInput === 'password'
                        ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-indigo-50/50 focus:ring-4 focus:ring-indigo-500/10'
                    } outline-none text-slate-900 placeholder:text-slate-400`}
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:scale-110 ${
                      focusedInput === 'password' ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-slate-900/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>登录中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FiCheckCircle size={20} />
                    <span>管理员登录</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                普通用户请使用{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  普通登录页面
                </Link>
              </p>
            </div>
          </div>

          {/* 安全提示 */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FiShield className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">安全提示</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  此页面为管理员专用入口。未经授权的访问将被记录并可能导致账号被封禁。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
