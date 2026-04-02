import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiBell, FiCamera, FiSave } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, isAuthenticated, updateProfile, updateAvatar } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  const [profileForm, setProfileForm] = useState({
    nickname: '',
    bio: '',
    website: '',
    github: '',
    weibo: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        nickname: user.nickname || '',
        bio: user.bio || '',
        website: user.website || '',
        github: user.github || '',
        weibo: user.weibo || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileForm);
    if (result.success) {
      toast.success('资料更新成功');
    } else {
      toast.error(result.error || '更新失败');
    }
  };

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post('/users/avatar', formData);
      console.log('上传响应:', response);
      console.log('响应数据:', response.data);
      const newAvatar = response.data.avatar;
      console.log('新头像:', newAvatar);
      updateAvatar(newAvatar);
      toast.success('头像上传成功');
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传失败');
    }
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: FiUser },
    { id: 'password', label: '账号安全', icon: FiLock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">设置</h1>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-planet-purple/5 text-planet-purple border-l-4 border-planet-purple'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">个人资料</h2>
                  
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <img
                        src={`${user?.avatar || '/uploads/avatars/default.png'}?t=${Date.now()}`}
                        alt={user?.nickname || user?.username}
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-planet-purple text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-planet-purple/90">
                        <FiCamera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user?.nickname || user?.username}</h3>
                      <p className="text-gray-500 text-sm">@{user?.username}</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        昵称
                      </label>
                      <input
                        type="text"
                        value={profileForm.nickname}
                        onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })}
                        className="input-field"
                        placeholder="你的昵称"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="input-field"
                        rows={4}
                        placeholder="介绍一下你自己"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人网站
                      </label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        className="input-field"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={profileForm.github}
                        onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                        className="input-field"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        微博
                      </label>
                      <input
                        type="url"
                        value={profileForm.weibo}
                        onChange={(e) => setProfileForm({ ...profileForm, weibo: e.target.value })}
                        className="input-field"
                        placeholder="https://weibo.com/username"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                    >
                      <FiSave size={18} />
                      <span>保存修改</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">修改密码</h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前密码
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="input-field"
                        placeholder="请输入当前密码"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新密码
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input-field"
                        placeholder="至少6个字符"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        确认新密码
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="input-field"
                        placeholder="请再次输入新密码"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                    >
                      <FiSave size={18} />
                      <span>修改密码</span>
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">通知设置</h2>
                  <p className="text-gray-500">通知功能开发中...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
