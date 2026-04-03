import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 输入邮箱, 2: 输入验证码, 3: 重置密码
  const [countdown, setCountdown] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: formData.email
      });

      if (response.data) {
        toast.success(response.data.message || '验证码已发送到您的邮箱');
        setStep(2);
        startCountdown();
      } else {
        toast.error(response.error || '发送验证码失败');
      }
    } catch (error) {
      console.error('错误信息:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-code', {
        email: formData.email,
        code: formData.verificationCode
      });

      if (response.data) {
        setResetToken(response.data.token);
        setStep(3);
        toast.success(response.data.message || '验证码验证成功');
      } else {
        toast.error(response.error || '验证码验证失败');
      }
    } catch (error) {
      console.error('错误信息:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitStep3 = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword: formData.newPassword
      });

      if (response.data) {
        toast.success(response.data.message || '密码重置成功');
        navigate('/login');
      } else {
        toast.error(response.error || '密码重置失败');
      }
    } catch (error) {
      console.error('错误信息:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendCode = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: formData.email
      });

      if (response.success) {
        toast.success('验证码已重新发送');
        startCountdown();
      } else {
        toast.error(response.error || '发送验证码失败');
      }
    } catch (error) {
      console.error('错误信息:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6">找回密码</h1>
          <p className="text-xl text-white/80 mb-8">
            请按照步骤操作，重置您的密码
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <div className="font-semibold">安全保障</div>
              <div className="text-white/70 text-sm">您的账户安全是我们的首要任务</div>
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
            <h2 className="text-3xl font-bold text-gray-900">找回密码</h2>
            <p className="mt-2 text-gray-600">
              请按照以下步骤重置您的密码
            </p>
          </div>

          <div className="mt-8">
            {step === 1 && (
              <form onSubmit={handleSubmitStep1} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    电子邮箱
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-12"
                      placeholder="请输入您的邮箱地址"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '发送中...' : '发送验证码'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmitStep2} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    验证码
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                      className="input-field pl-4"
                      placeholder="请输入邮箱收到的验证码"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送'}
                  </span>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={countdown > 0 || isLoading}
                    className="text-sm text-planet-purple hover:text-planet-pink disabled:opacity-50"
                  >
                    重新发送
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '验证中...' : '验证验证码'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmitStep3} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密码
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="input-field pl-4"
                      placeholder="请输入新密码"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input-field pl-4"
                      placeholder="请再次输入新密码"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '重置中...' : '重置密码'}
                </button>
              </form>
            )}

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">返回登录</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full block text-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">返回登录页面</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
