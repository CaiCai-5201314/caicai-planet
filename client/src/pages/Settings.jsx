import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiBell, FiCamera, FiSave, FiX, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

export default function Settings() {
  const { user, isAuthenticated, updateProfile, updateAvatar, updateCover } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  const [profileForm, setProfileForm] = useState({
    nickname: '',
    bio: ''
  });

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
  const [coverStyle, setCoverStyle] = useState('cover'); // cover, contain, stretch, center
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    console.log('用户对象:', user);
    if (user) {
      setProfileForm({
        nickname: user.nickname || '',
        bio: user.bio || ''
      });
      setSecurityForm({
        username: user.username || '',
        email: user.email || ''
      });
      if (user.cover_style) {
        setCoverStyle(user.cover_style);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile({ ...profileForm, cover_style: coverStyle });
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
      console.log('开始上传头像');
      const response = await api.post('/users/avatar', formData);
      console.log('上传响应:', response);
      console.log('响应数据:', response.data);
      const newAvatar = response.data.avatar;
      console.log('新头像:', newAvatar);
      console.log('更新前的用户对象:', user);
      updateAvatar(newAvatar);
      console.log('更新后的用户对象:', user);
      toast.success('头像上传成功');
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传失败');
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImage(event.target.result);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const generateCroppedImage = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();

      image.onload = async () => {
        canvas.width = 1200; // 固定宽度
        canvas.height = 400; // 固定高度

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append('cover', blob, 'cover.jpg');

          try {
            const response = await api.post('/users/cover', formData);
            console.log('上传响应:', response);
            console.log('响应数据:', response.data);
            const newCover = response.data.cover_image;
            console.log('新背景:', newCover);
            updateCover(newCover);
            setIsCropping(false);
            setCropImage(null);
            toast.success('背景上传成功');
          } catch (error) {
            console.error('上传错误:', error);
            toast.error('上传失败');
          }
        }, 'image/jpeg', 0.8);
      };

      image.src = cropImage;
    } catch (error) {
      console.error('裁剪错误:', error);
      toast.error('裁剪失败');
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
                  
                  {/* 背景图片上传 */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">个人背景</h3>
                    <div className="relative h-40 md:h-56 overflow-hidden rounded-2xl mb-4">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${user?.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600'})`,
                          backgroundSize: coverStyle === 'stretch' ? '100% 100%' : coverStyle,
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <label className="absolute bottom-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center space-x-2 cursor-pointer hover:bg-white/30">
                        <FiCamera size={16} />
                        <span>更换背景</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 裁剪模态框 */}
                  {isCropping && cropImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900">裁剪背景图片</h3>
                          <button
                            onClick={() => {
                              setIsCropping(false);
                              setCropImage(null);
                              setCrop({ x: 0, y: 0 });
                              setZoom(1);
                              setCroppedAreaPixels(null);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <FiX size={20} className="text-gray-600" />
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="relative h-[500px] mb-4">
                            <Cropper
                              image={cropImage}
                              crop={crop}
                              zoom={zoom}
                              aspect={3 / 1} // 3:1的宽高比，适合背景图
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={handleCropComplete}
                              className="rounded-lg overflow-hidden"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setIsCropping(false);
                                setCropImage(null);
                                setCrop({ x: 0, y: 0 });
                                setZoom(1);
                                setCroppedAreaPixels(null);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              取消
                            </button>
                            <button
                              onClick={generateCroppedImage}
                              className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 flex items-center space-x-2"
                            >
                              <FiCheck size={16} />
                              <span>确认裁剪</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 头像上传 */}
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                      <img
                        src={user?.avatar && user.avatar.length > 0 ? user.avatar : 'https://via.placeholder.com/150'}
                        alt={user?.nickname || user?.username}
                        className="w-24 h-24 rounded-2xl object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">账号安全</h2>
                  
                  <div className="space-y-8">
                    {/* 用户名修改 */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">修改用户名</h3>
                      <p className="text-sm text-gray-500 mb-4">用户名7天只能修改一次</p>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            新用户名
                          </label>
                          <input
                            type="text"
                            value={securityForm.username}
                            onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                            className="input-field"
                            placeholder="请输入新用户名"
                          />
                        </div>
                        <button
                          type="submit"
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                        >
                          <FiSave size={18} />
                          <span>修改用户名</span>
                        </button>
                      </form>
                    </div>

                    {/* 邮箱修改 */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">修改邮箱</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.put('/auth/update-email', { 
                            email: securityForm.email, 
                            verificationCode: securityForm.verificationCode 
                          });
                          toast.success('邮箱修改成功');
                          // 更新用户信息
                          const userResponse = await api.get('/auth/me');
                          setUser(userResponse.data.user);
                        } catch (error) {
                          toast.error(error.response?.data?.message || '邮箱修改失败');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            新邮箱
                          </label>
                          <input
                            type="email"
                            value={securityForm.email}
                            onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                            className="input-field"
                            placeholder="请输入新邮箱"
                          />
                        </div>

                        {securityForm.email !== user?.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              验证码
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={securityForm.verificationCode || ''}
                                onChange={(e) => setSecurityForm({ ...securityForm, verificationCode: e.target.value })}
                                className="input-field flex-1"
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
                                className="px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 whitespace-nowrap"
                              >
                                发送验证码
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                        >
                          <FiSave size={18} />
                          <span>修改邮箱</span>
                        </button>
                      </form>
                    </div>

                    {/* 密码修改 */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  </div>
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
