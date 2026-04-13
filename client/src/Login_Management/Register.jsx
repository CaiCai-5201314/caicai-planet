import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!formData.email) {
      toast.error('请先输入邮箱地址');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await api.post('/verification/send', { email: formData.email });
      toast.success(response.data.message || '验证码已发送');
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('密码长度至少为6个字符');
      return;
    }

    if (!formData.verificationCode) {
      toast.error('请输入邮箱验证码');
      return;
    }

    setIsLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      verificationCode: formData.verificationCode
    });

    if (result.success) {
      toast.success(`注册成功！您的用户ID是: ${result.user?.uid}`);
      navigate('/');
    } else {
      toast.error(result.error || '注册失败');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">加入菜菜星球</h1>
          <p className="text-xl text-white/80 mb-8">
            创建账号，开启你的创意之旅
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <div className="font-semibold">分享创意</div>
                <div className="text-white/70 text-sm">发布你的文章和想法</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <div className="font-semibold">结识朋友</div>
                <div className="text-white/70 text-sm">与志同道合的人交流</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white overflow-y-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-md py-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-8">
            <FiArrowLeft className="mr-2" />
            返回首页
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">菜</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">创建账号</h2>
            <p className="mt-2 text-gray-600">
              已有账号？{' '}
              <Link to="/login" className="text-planet-purple hover:text-planet-pink font-medium">
                立即登录
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field pl-12"
                    placeholder="3-50个字符，支持字母、数字、下划线"
                    minLength={3}
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-12"
                    placeholder="请输入邮箱地址"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱验证码 *
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                      className="input-field pl-12"
                      placeholder="请输入6位验证码"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || countdown > 0}
                    className="px-4 py-2 bg-planet-purple text-white rounded-xl font-medium hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12 pr-12"
                    placeholder="至少6个字符"
                    minLength={6}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input-field pl-12"
                    placeholder="请再次输入密码"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="rounded border-gray-300 text-planet-purple focus:ring-planet-purple"
                />
                <span className="ml-2 text-sm text-gray-600">
                  我同意{' '}
                  <Link to="/terms" className="text-planet-purple hover:text-planet-pink">
                    服务条款
                  </Link>
                  {' '}和{' '}
                  <Link to="/privacy" className="text-planet-purple hover:text-planet-pink">
                    隐私政策
                  </Link>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '注册中...' : '创建账号'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
