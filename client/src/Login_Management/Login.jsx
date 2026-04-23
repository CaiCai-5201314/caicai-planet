import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck, FiX, FiCalendar, FiStar } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [isExpBonusModalOpen, setIsExpBonusModalOpen] = useState(false);
  const [expBonusResult, setExpBonusResult] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      toast.success('登录成功！');
      if (result.checkIn) {
        if (result.checkIn.success) {
          // 首次打卡成功，显示弹窗
          setCheckInResult(result.checkIn);
          setIsCheckInModalOpen(true);
        } else {
          // 已经打卡过，显示toast通知
          toast.success(result.checkIn.message || '今日已打卡');
          navigate('/');
        }
      } else if (result.expBonus && result.expBonus.success) {
        setExpBonusResult(result.expBonus);
        setIsExpBonusModalOpen(true);
      } else {
        navigate('/');
      }
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


          </div>
        </div>
      </div>

      {/* 打卡弹窗 */}
      {isCheckInModalOpen && checkInResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              {checkInResult.success ? (
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheck size={40} className="text-green-500" />
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiCalendar size={40} className="text-gray-400" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {checkInResult.success ? '打卡成功！' : '今日已打卡'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {checkInResult.success 
                  ? '恭喜你完成今天的打卡！' 
                  : checkInResult.message || '你今天已经打卡过了'}
              </p>
            </div>
            
            {checkInResult.success && checkInResult.checkIn && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">打卡时间</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(checkInResult.checkIn.check_in_time).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => {
                setIsCheckInModalOpen(false);
                navigate('/');
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-300"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 经验值奖励弹窗 */}
      {isExpBonusModalOpen && expBonusResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                <FiStar size={40} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                登录奖励！
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                恭喜你获得每日登录奖励
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 mb-6">
                <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  +10
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  经验值
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">变化前</span>
                    <span className="text-gray-700 dark:text-gray-300">{expBonusResult.exp_before}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500 dark:text-gray-400">变化后</span>
                    <span className="font-medium text-gray-900 dark:text-white">{expBonusResult.exp_after}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsExpBonusModalOpen(false);
                navigate('/');
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300"
            >
              太棒了！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
