import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiSave, FiTrash2, FiSun, FiMoon, FiX } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, isAuthenticated, setAdminUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [securityForm, setSecurityForm] = useState({
    username: '',
    email: '',
    verificationCode: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 偏好设置
  const [preferenceSettings, setPreferenceSettings] = useState({
    theme: 'light',
    language: 'zh-CN'
  });

  // 注销账号弹窗状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 处理注销账号
  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      toast.success('账号已注销完成，欢迎您的使用，下次见~');
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || '账号注销失败');
    }
  };

  useEffect(() => {
    if (user) {
      setSecurityForm({
        username: user.username || '',
        email: user.email || ''
      });
      // 初始化偏好设置
      setPreferenceSettings({
        theme: user.theme || 'light',
        language: user.language || 'zh-CN'
      });
    }
  }, [user]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    try {
      await api.put('/auth/password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('密码修改成功');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || '修改失败');
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const newSettings = { ...preferenceSettings, [key]: value };
      setPreferenceSettings(newSettings);
      const response = await api.put('/users/settings', newSettings);
      setAdminUser(response.data.user);
      // 不需要显示成功提示，因为设置会立即生效
    } catch (error) {
      toast.error(error.response?.data?.message || '保存失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">设置</h1>
            <p className="text-gray-500 dark:text-gray-400">管理您的账号和偏好设置</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">账号设置</h2>
                <p className="text-gray-500 dark:text-gray-400">管理您的账号安全和偏好设置</p>
              </div>
              
              <div className="space-y-8">
                {/* 账号安全 */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 rounded-2xl">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">账号安全</h3>
                    <p className="text-gray-500 dark:text-gray-400">保护您的账号安全</p>
                  </div>
                  
                  <div className="space-y-8">
                    {/* 用户名修改 */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-planet-purple/10 dark:bg-planet-purple/20 rounded-xl flex items-center justify-center">
                          <FiUser size={20} className="text-planet-purple" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">修改用户名</h4>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">用户名7天只能修改一次</p>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.put('/auth/update-username', { username: securityForm.username });
                          toast.success('用户名修改成功');
                        } catch (error) {
                          toast.error(error.response?.data?.message || '用户名修改失败');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            新用户名
                          </label>
                          <input
                            type="text"
                            value={securityForm.username}
                            onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                            placeholder="请输入新用户名"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-planet-purple/25 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <FiSave size={20} />
                          <span>修改用户名</span>
                        </button>
                      </form>
                    </div>

                    {/* 邮箱修改 */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-planet-purple/10 dark:bg-planet-purple/20 rounded-xl flex items-center justify-center">
                          <FiLock size={20} className="text-planet-purple" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">修改邮箱</h4>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.put('/auth/update-email', { 
                            email: securityForm.email, 
                            verificationCode: securityForm.verificationCode 
                          });
                          toast.success('邮箱修改成功');
                        } catch (error) {
                          toast.error(error.response?.data?.message || '邮箱修改失败');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            新邮箱
                          </label>
                          <input
                            type="email"
                            value={securityForm.email}
                            onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                            placeholder="请输入新邮箱"
                          />
                        </div>

                        {securityForm.email !== user?.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              验证码
                            </label>
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                value={securityForm.verificationCode || ''}
                                onChange={(e) => setSecurityForm({ ...securityForm, verificationCode: e.target.value })}
                                className="flex-1 px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                                placeholder="请输入验证码"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!securityForm.email) {
                                    toast.error('请先输入邮箱');
                                    return;
                                  }
                                  try {
                                    await api.post('/auth/send-verification-code', { email: securityForm.email });
                                    toast.success('验证码已发送到您的邮箱');
                                  } catch (error) {
                                    toast.error(error.response?.data?.message || '发送验证码失败');
                                  }
                                }}
                                className="px-6 py-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl hover:shadow-lg transition-all font-medium whitespace-nowrap"
                              >
                                发送验证码
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-planet-purple/25 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <FiSave size={20} />
                          <span>修改邮箱</span>
                        </button>
                      </form>
                    </div>

                    {/* 密码修改 */}
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-planet-purple/10 dark:bg-planet-purple/20 rounded-xl flex items-center justify-center">
                          <FiLock size={20} className="text-planet-purple" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">修改密码</h4>
                      </div>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            当前密码
                          </label>
                          <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                            placeholder="请输入当前密码"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            新密码
                          </label>
                          <input
                            type="password"
                            required
                            autoComplete="new-password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                            placeholder="至少6个字符"
                            minLength={6}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            确认新密码
                          </label>
                          <input
                            type="password"
                            required
                            autoComplete="new-password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100"
                            placeholder="请再次输入新密码"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-planet-purple/25 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <FiSave size={20} />
                          <span>修改密码</span>
                        </button>
                      </form>
                    </div>


                  </div>
                </div>
              
                {/* 偏好设置 */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-planet-purple/10 dark:bg-planet-purple/20 rounded-xl flex items-center justify-center">
                      <FiSun size={20} className="text-planet-purple" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">偏好设置</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">主题设置</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'light', label: '浅色主题', icon: FiSun },
                          { value: 'dark', label: '深色主题', icon: FiMoon }
                        ].map((theme) => (
                          <div 
                            key={theme.value} 
                            onClick={() => handlePreferenceChange('theme', theme.value)}
                            className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors border-2 ${
                              preferenceSettings.theme === theme.value
                                ? 'border-planet-purple bg-planet-purple/5'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                preferenceSettings.theme === theme.value
                                  ? 'border-planet-purple bg-planet-purple'
                                  : 'border-gray-300 dark:border-gray-500'
                              }`}
                            >
                              {preferenceSettings.theme === theme.value && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              )}
                            </div>
                            <theme.icon size={20} className={`${preferenceSettings.theme === theme.value ? 'text-planet-purple' : 'text-gray-600 dark:text-gray-400'}`} />
                            <span className={`${preferenceSettings.theme === theme.value ? 'text-planet-purple font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{theme.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                </div>
              
                {/* 注销账号 */}
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-red-100 dark:border-red-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <FiTrash2 size={20} className="text-red-600 dark:text-red-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">注销账号</h4>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-6">
                    注销账号将永久删除您的所有数据，此操作不可恢复！
                  </p>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <FiTrash2 size={20} />
                    <span>注销账号</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 注销账号确认弹窗 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">确认注销</h3>
                  <p className="text-red-100 mt-1">永久删除账号和所有数据</p>
                </div>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 size={32} className="text-red-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  确定要注销账号吗？
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  此操作不可恢复，所有数据将被永久删除！
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    handleDeleteAccount();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center"
                >
                  <FiTrash2 size={18} className="mr-2" />
                  确认注销
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}