import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiLink, FiGithub, FiCalendar, FiEdit, FiTarget, FiHeart, FiCheckCircle, FiX, FiSave, FiCamera, FiImage, FiRotateCw, FiMaximize2, FiMinimize2, FiUser, FiEye, FiMessageSquare, FiPlus, FiClock, FiArrowLeft } from 'react-icons/fi';
// import Cropper from 'react-easy-crop';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [likedTasks, setLikedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { user: currentUser, updateProfile, updateAvatar } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

  // 编辑资料模态框状态
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    bio: ''
  });
  
  // 等级信息弹窗状态
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  
  // 经验流水相关状态
  const [expLogs, setExpLogs] = useState([]);
  const [expLogsLoading, setExpLogsLoading] = useState(false);
  const [expLogsPagination, setExpLogsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [expLogsFilter, setExpLogsFilter] = useState({
    timeRange: 'all',
    type: 'all'
  });
  const [activeLevelTab, setActiveLevelTab] = useState('info');
  
  // 等级特权相关状态
  const [levelPrivileges, setLevelPrivileges] = useState([]);
  const [levelPrivilegesLoading, setLevelPrivilegesLoading] = useState(false);

  // 根据经验值计算等级
  const calculateLevel = (exp) => {
    if (!exp) return 1;
    if (exp >= 10000) return 10;
    if (exp >= 6400) return 9;
    if (exp >= 3900) return 8;
    if (exp >= 2300) return 7;
    if (exp >= 1300) return 6;
    if (exp >= 700) return 5;
    if (exp >= 350) return 4;
    if (exp >= 150) return 3;
    if (exp >= 50) return 2;
    return 1;
  };

  // 获取等级对应的颜色
  const getLevelColor = (level) => {
    if (level >= 10) return '#f59e0b'; // 金色
    if (level >= 9) return '#ef4444'; // 红色
    if (level >= 5) return '#8b5cf6'; // 紫色
    return '#6b7280'; // 白色（用灰色显示，因为白色在白色背景上看不见）
  };

  // 获取等级对应的昵称颜色
  const getNicknameColor = (level) => {
    if (level >= 10) return '#f59e0b'; // 金色
    if (level >= 9) return '#ef4444'; // 红色
    if (level >= 5) return '#8b5cf6'; // 紫色
    return '#111827'; // 黑色
  };
  
  // 裁剪模态框状态
  // const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  // const [crop, setCrop] = useState({ x: 0, y: 0 });
  // const [zoom, setZoom] = useState(1);
  // const [imageSrc, setImageSrc] = useState(null);
  // const [pixelCrop, setPixelCrop] = useState(null);
  // const [cropMode, setCropMode] = useState('aspect'); // aspect: 比例锁定, free: 自由裁剪
  // const [aspectRatio, setAspectRatio] = useState(2); // 默认 2:1 比例
  


  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (activeTab === 'likes') {
      fetchLikes();
    } else if (activeTab === 'favorites') {
      fetchFavorites();
    } else if (activeTab === 'tasks') {
      fetchUserTasks();
    } else if (activeTab === 'likedTasks') {
      fetchLikedTasks();
    }
  }, [activeTab, isOwnProfile]);

  // 当经验流水筛选条件变化时重新获取数据
  useEffect(() => {
    if (isOwnProfile && activeLevelTab === 'exp-logs') {
      fetchExpLogs(1, true);
    }
  }, [expLogsFilter, activeLevelTab, isOwnProfile]);

  // 当等级信息弹窗打开时获取等级特权和刷新经验流水
  useEffect(() => {
    if (isLevelModalOpen && isOwnProfile) {
      fetchLevelPrivileges();
      // 如果已经在经验流水标签页，刷新经验流水
      if (activeLevelTab === 'exp-logs') {
        fetchExpLogs(1, true);
      }
    }
  }, [isLevelModalOpen, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/profile/${username}`),
        api.get(`/users/${username}/posts`)
      ]);
      console.log('后端返回的用户资料:', profileRes.data.user);
      console.log('获赞数:', profileRes.data.user.stats?.likeCount);
      setProfile(profileRes.data.user);
      setPosts(postsRes.data.posts);
    } catch (error) {
      console.error('获取用户资料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    if (!isOwnProfile) return;
    try {
      setTabLoading(true);
      const response = await api.get('/users/likes');
      setLikes(response.data.likes);
    } catch (error) {
      console.error('获取点赞列表失败:', error);
      toast.error('获取点赞列表失败');
    } finally {
      setTabLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!isOwnProfile) return;
    try {
      setTabLoading(true);
      const response = await api.get('/users/favorites');
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      toast.error('获取收藏列表失败');
    } finally {
      setTabLoading(false);
    }
  };

  // 获取用户接受的任务
  const fetchUserTasks = async () => {
    if (!isOwnProfile) return;
    try {
      setTabLoading(true);
      const response = await api.get('/user-tasks/my-tasks');
      setUserTasks(response.data.userTasks || []);
    } catch (error) {
      console.error('获取用户任务失败:', error);
      toast.error('获取任务列表失败');
    } finally {
      setTabLoading(false);
    }
  };

  // 获取用户点赞的任务
  const fetchLikedTasks = async () => {
    if (!isOwnProfile) return;
    try {
      setTabLoading(true);
      const response = await api.get('/user-tasks/my-likes');
      setLikedTasks(response.data.likedTasks || []);
    } catch (error) {
      console.error('获取点赞任务失败:', error);
      toast.error('获取点赞任务失败');
    } finally {
      setTabLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = () => {
    if (profile) {
      setEditForm({
        nickname: profile.nickname || '',
        bio: profile.bio || ''
      });
    }
    setIsEditModalOpen(true);
  };

  // 处理编辑表单提交
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(editForm);
    if (result.success) {
      toast.success('资料更新成功');
      setIsEditModalOpen(false);
      fetchProfile(); // 重新获取资料
    } else {
      toast.error(result.error || '更新失败');
    }
  };

  // 获取经验流水记录
  const fetchExpLogs = async (page = 1, reset = false) => {
    if (!isOwnProfile) return;
    
    try {
      setExpLogsLoading(true);
      
      const params = {
        page,
        limit: expLogsPagination.limit,
        user_id: profile?.id
      };
      
      // 处理时间范围筛选
      if (expLogsFilter.timeRange !== 'all') {
        const now = new Date();
        if (expLogsFilter.timeRange === 'today') {
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          params.start_date = startOfDay.toISOString();
        } else if (expLogsFilter.timeRange === 'week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          params.start_date = startOfWeek.toISOString();
        } else if (expLogsFilter.timeRange === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          params.start_date = startOfMonth.toISOString();
        }
      }
      
      // 处理类型筛选
      if (expLogsFilter.type !== 'all') {
        params.reason_type = expLogsFilter.type;
      }
      
      const response = await api.get('/exp-management/logs', { params });
      
      if (reset) {
        setExpLogs(response.data.expLogs);
      } else {
        setExpLogs(prev => [...prev, ...response.data.expLogs]);
      }
      
      setExpLogsPagination({
        page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      });
    } catch (error) {
      console.error('获取经验流水失败:', error);
      toast.error('获取经验流水失败');
    } finally {
      setExpLogsLoading(false);
    }
  };

  // 处理经验流水筛选变化
  const handleExpLogsFilterChange = (key, value) => {
    setExpLogsFilter(prev => ({ ...prev, [key]: value }));
    setExpLogsPagination(prev => ({ ...prev, page: 1 }));
    setExpLogs([]);
  };

  // 加载更多经验流水
  const loadMoreExpLogs = () => {
    if (!expLogsLoading && expLogsPagination.page < expLogsPagination.totalPages) {
      fetchExpLogs(expLogsPagination.page + 1);
    }
  };

  // 获取等级特权信息
  const fetchLevelPrivileges = async () => {
    try {
      setLevelPrivilegesLoading(true);
      const response = await api.get('/exp-management/levels');
      setLevelPrivileges(response.data.levels || []);
    } catch (error) {
      console.error('获取等级特权失败:', error);
      toast.error('获取等级特权失败');
    } finally {
      setLevelPrivilegesLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
<<<<<<< HEAD
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/avatar`, {
=======
      const response = await fetch(`${window.location.origin}/api/users/avatar`, {
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateAvatar(data.avatar);
        fetchProfile();
        toast.success('头像上传成功');
      } else {
        toast.error('上传失败: ' + data.message);
      }
    } catch (error) {
      console.error('上传错误:', error);
      toast.error('上传失败');
    }
  };

  // 处理背景图上传
  // const handleCoverUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   try {
  //     // 将文件转换为DataURL，用于裁剪预览
  //     const dataURL = await new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = (event) => resolve(event.target.result);
  //       reader.onerror = (error) => reject(error);
  //       reader.readAsDataURL(file);
  //     });
      
  //     setImageSrc(dataURL);
  //     setCrop({ x: 0, y: 0 });
  //     setZoom(1);
  //     setPixelCrop(null);
  //     setIsCropModalOpen(true);
  //   } catch (error) {
  //     console.error('读取文件错误:', error);
  //     toast.error('读取文件失败');
  //   }
  // };

  // 处理裁剪完成
  // const handleCropComplete = async () => {
  //   try {
  //     if (!pixelCrop) {
  //       toast.error('请先调整裁剪区域');
  //       return;
  //     }
      
  //     console.log('开始裁剪...');
  //     console.log('裁剪参数:', pixelCrop);
      
  //     // 检查裁剪区域是否有效
  //     if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
  //       throw new Error('无效的裁剪区域');
  //     }
      
  //     // 从DataURL创建图片对象
  //     const image = new Image();
  //     image.src = imageSrc;
      
  //     await new Promise((resolve, reject) => {
  //       image.onload = resolve;
  //       image.onerror = reject;
  //     });
      
  //     console.log('图片原始尺寸:', image.width, 'x', image.height);
      
  //     // 检查裁剪参数是否合理
  //     console.log('裁剪区域尺寸:', pixelCrop.width, 'x', pixelCrop.height);
      
  //     // 直接使用 react-easy-crop 返回的实际像素裁剪参数
  //     // 注意：croppedAreaPixels 已经是实际的像素坐标
  //     const actualX = Math.round(pixelCrop.x);
  //     const actualY = Math.round(pixelCrop.y);
  //     const actualWidth = Math.round(pixelCrop.width);
  //     const actualHeight = Math.round(pixelCrop.height);
      
  //     console.log('实际裁剪区域:', actualX, actualY, actualWidth, actualHeight);
      
  //     // 确保裁剪区域在图片范围内
  //     const adjustedX = Math.max(0, actualX);
  //     const adjustedY = Math.max(0, actualY);
  //     const adjustedWidth = Math.min(actualWidth, image.width - adjustedX);
  //     const adjustedHeight = Math.min(actualHeight, image.height - adjustedY);
      
  //     if (adjustedWidth <= 0 || adjustedHeight <= 0) {
  //       throw new Error('调整后裁剪区域无效');
  //     }
      
  //     console.log('调整后的裁剪区域:', adjustedX, adjustedY, adjustedWidth, adjustedHeight);
      
  //     // 创建canvas进行裁剪
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
      
  //     // 设置画布大小为裁剪区域的大小
  //     canvas.width = adjustedWidth;
  //     canvas.height = adjustedHeight;
      
  //     // 绘制裁剪后的图片
  //     ctx.drawImage(
  //       image,
  //       adjustedX,
  //       adjustedY,
  //       adjustedWidth,
  //       adjustedHeight,
  //       0,
  //       0,
  //       adjustedWidth,
  //       adjustedHeight
  //     );
      
  //     // 将canvas转换为Blob
  //     const croppedBlob = await new Promise((resolve) => {
  //       canvas.toBlob(resolve, 'image/jpeg', 0.9);
  //     });
      
  //     if (!croppedBlob) {
  //       throw new Error('Failed to create blob');
  //     }
      
  //     console.log('裁剪后的Blob大小:', croppedBlob.size);
      
  //     // 检查Blob大小是否合理
  //     if (croppedBlob.size < 1000) {
  //       throw new Error('裁剪后的图片太小，可能无效');
  //     }
      
  //     console.log('裁剪成功，图片大小:', (croppedBlob.size / 1024).toFixed(2), 'KB');
      
  //     // 生成唯一的文件名，避免缓存问题
  //     const fileName = `cropped-cover-${Date.now()}.jpg`;
  //     const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
  //     console.log('生成的文件:', croppedFile);

  //     // 上传裁剪后的文件
  //     const formData = new FormData();
  //     formData.append('cover', croppedFile);
      
  //     console.log('开始上传...');
  //     const response = await fetch('http://localhost:3002/api/users/cover', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       },
  //       body: formData
  //     });
      
  //     console.log('上传响应状态:', response.status);
  //     const data = await response.json();
  //     console.log('上传响应数据:', data);
      
  //     if (response.ok) {
  //       setIsCropModalOpen(false);
  //       // 强制刷新页面，确保背景图立即更新
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 1000);
  //       toast.success('背景图上传成功');
  //     } else {
  //       toast.error('上传失败: ' + data.message);
  //     }
  //   } catch (error) {
  //     console.error('裁剪或上传错误:', error);
  //     toast.error('操作失败: ' + error.message);
  //   }
  // };

  // 渲染任务卡片
  const renderTaskCard = (taskItem, type = 'accepted') => {
    const task = type === 'accepted' ? taskItem.task : taskItem;
    if (!task) return null;

    const isMale = task.gender === 'male';
    const gradientColor = isMale ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-400';
    
    return (
      <Link
        key={task.id}
        to={`/task/${task.id}`}
        className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 mb-4"
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradientColor} flex items-center justify-center text-white text-xl flex-shrink-0`}>
            {task.icon || (isMale ? '👨' : '👩')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{task.title}</h3>
              {type === 'accepted' && (
                <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                  taskItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                  taskItem.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {taskItem.status === 'completed' ? '已完成' :
                   taskItem.status === 'accepted' ? '进行中' : '已取消'}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{task.description || '暂无描述'}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <FiTarget size={14} />
                <span>{task.difficulty === 'easy' ? '简单' : task.difficulty === 'hard' ? '困难' : '中等'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiHeart size={14} />
                <span>奖励 {task.reward} 积分</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiCheckCircle size={14} />
                <span>{task.currentParticipants || 0} 人参与</span>
              </span>
            </div>
            {type === 'accepted' && taskItem.acceptedAt && (
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                接受于 {format(new Date(taskItem.acceptedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">用户不存在</h2>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'posts', label: '文章' },
    { key: 'likes', label: '点赞' },
    { key: 'favorites', label: '收藏' },
    ...(isOwnProfile ? [
      { key: 'tasks', label: '任务中心' },
      { key: 'likedTasks', label: '任务点赞' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-16">
        {/* 用户信息头部 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 返回按钮 */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回</span>
            </button>
          </div>
          <div className="relative mb-8">
            {/* 顶部用户信息区域 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 dark:bg-gray-800" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.1)' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <img
                    src={profile.avatar && profile.avatar.length > 0 ? profile.avatar : '/moren.png'}
                    alt={profile.nickname || profile.username}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg transition-transform hover:scale-105"
                    onError={(e) => {
                      if (!e.target.dataset.errorHandled) {
                        e.target.dataset.errorHandled = 'true';
                        e.target.src = '/moren.png';
                      }
                    }}
                  />

                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h1 
                          className="text-3xl md:text-4xl font-bold mb-2"
                          style={{ 
                            color: getNicknameColor(calculateLevel(profile.exp)),
                            textShadow: calculateLevel(profile.exp) >= 10 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                          }}
                        >
                          {profile.nickname || profile.username}
                        </h1>
                        {profile.role === 'admin' && (
                          <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-medium">
                            ADMIN
                          </span>
                        )}
                        <span 
                          className="px-3 py-1 text-white text-sm rounded-full font-medium"
                          style={{ backgroundColor: getLevelColor(calculateLevel(profile.exp)) }}
                        >
                          Lv.{calculateLevel(profile.exp)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">@{profile.username}</p>
                      <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {profile.bio || '这个人很懒，还没有写简介~'}
                      </p>
                      <div className="flex items-center space-x-4 mt-4 text-gray-600 dark:text-gray-300 text-sm">
                        <span className="flex items-center space-x-1">
                          <FiCalendar size={16} />
                          <span>加入于 {format(new Date(profile.created_at), 'yyyy年MM月', { locale: zhCN })}</span>
                        </span>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={openEditModal}
                        className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <FiEdit size={18} />
                        <span>编辑资料</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-100 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400">{profile.stats?.postCount || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300">文章</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-100 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400">{profile.stats?.likeCount || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300">获赞</div>
                </div>
                <div 
                  className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border border-gray-100 dark:border-gray-600"
                  onClick={() => setIsLevelModalOpen(true)}
                >
                  <div 
                    className="text-2xl font-bold transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400"
                    style={{ color: getLevelColor(calculateLevel(profile.exp)) }}
                  >
                    {calculateLevel(profile.exp)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300">等级</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-gray-100 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:text-purple-600 dark:hover:text-purple-400">{profile.activeDays || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-all duration-300">活跃天数</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-1 gap-8">
            <div className="lg:col-span-1">
              {/* 内容标签页 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-4 text-center font-medium transition-all whitespace-nowrap px-4 relative ${
                        activeTab === tab.key
                          ? 'text-planet-purple'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-planet-purple transition-all duration-300" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                          <div className="text-6xl mb-4">📝</div>
                          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">还没有发布任何文章</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">分享你的知识和经验，开始创作吧！</p>
                          <Link 
                            to="/create-post" 
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-all shadow-md hover:shadow-lg"
                          >
                            <FiPlus size={18} />
                            <span>发布文章</span>
                          </Link>
                        </div>
                      ) : (
                        posts.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-2">{post.title}</h3>
                              {post.status === 'pending' && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center space-x-1">
                                  <FiClock size={12} />
                                  <span>审核中</span>
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{post.summary}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                  <FiEye size={14} />
                                  <span>{post.view_count}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <FiHeart size={14} />
                                  <span>{post.like_count}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <FiMessageSquare size={14} />
                                  <span>{post.comment_count}</span>
                                </span>
                              </div>
                              <span className="text-xs">
                                {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                              </span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'likes' && (
                    <div className="space-y-4">
                      {tabLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                        </div>
                      ) : !isOwnProfile ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          仅作者可见
                        </div>
                      ) : likes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          还没有点赞任何文章
                        </div>
                      ) : (
                        likes.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">{post.title}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{post.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>👁 {post.view_count}</span>
                              <span>❤️ {post.like_count}</span>
                              <span>💬 {post.comment_count}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'favorites' && (
                    <div className="space-y-4">
                      {tabLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                        </div>
                      ) : !isOwnProfile ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          仅作者可见
                        </div>
                      ) : favorites.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          还没有收藏任何文章
                        </div>
                      ) : (
                        favorites.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">{post.title}</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{post.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>👁 {post.view_count}</span>
                              <span>❤️ {post.like_count}</span>
                              <span>💬 {post.comment_count}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}

                  {/* 任务中心 */}
                  {activeTab === 'tasks' && (
                    <div className="space-y-4">
                      {tabLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                        </div>
                      ) : !isOwnProfile ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          仅作者可见
                        </div>
                      ) : userTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-4">📝</div>
                          <p>还没有接受任何任务</p>
                          <Link 
                            to="/tasks" 
                            className="mt-4 inline-block px-6 py-2 bg-planet-purple text-white rounded-full text-sm hover:bg-planet-purple/90 transition-colors"
                          >
                            去任务中心看看
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">我的任务</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              共 {userTasks.length} 个任务
                            </span>
                          </div>
                          {userTasks.map((userTask) => renderTaskCard(userTask, 'accepted'))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 点赞的任务 */}
                  {activeTab === 'likedTasks' && (
                    <div className="space-y-4">
                      {tabLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                        </div>
                      ) : !isOwnProfile ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          仅作者可见
                        </div>
                      ) : likedTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-4">❤️</div>
                          <p>还没有点赞任何任务</p>
                          <Link 
                            to="/tasks" 
                            className="mt-4 inline-block px-6 py-2 bg-planet-purple text-white rounded-full text-sm hover:bg-planet-purple/90 transition-colors"
                          >
                            去发现好任务
                          </Link>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">点赞的任务</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              共 {likedTasks.length} 个任务
                            </span>
                          </div>
                          {likedTasks.map((task) => renderTaskCard(task, 'liked'))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑资料模态框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">编辑资料</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FiX size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-8">
              {/* 头像上传 */}
              <div className="flex items-center space-x-8 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-600/50 rounded-2xl">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-planet-purple to-planet-pink rounded-3xl blur opacity-75"></div>
                  <img
                    src={profile?.avatar && profile.avatar.length > 0 ? profile.avatar : '/moren.png'}
                    alt={profile?.nickname || profile?.username}
                    className="w-28 h-28 rounded-3xl object-cover relative border-4 border-white shadow-xl"
                    onError={(e) => {
                      if (!e.target.dataset.errorHandled) {
                        e.target.dataset.errorHandled = 'true';
                        e.target.src = '/moren.png';
                      }
                    }}
                  />
                  <label className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-110 transition-all duration-300 shadow-md">
                    <FiCamera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.nickname || profile?.username}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-base">@{profile?.username}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">ID: {profile?.uid}</p>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    昵称
                  </label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 text-gray-900 dark:text-white"
                    placeholder="你的昵称"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    个人简介
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-planet-purple focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-planet-purple/10 outline-none transition-all duration-300 resize-none text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="介绍一下你自己"
                  />
                </div>





                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                  >
                    <FiSave size={18} />
                    <span>保存修改</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 等级信息弹窗 */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">账号等级信息</h2>
              <button 
                onClick={() => setIsLevelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* 标签页导航 */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveLevelTab('info')}
                className={`flex-1 py-4 text-center font-medium transition-all relative ${
                  activeLevelTab === 'info'
                    ? 'text-planet-purple'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                等级信息
                {activeLevelTab === 'info' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-planet-purple transition-all duration-300" />
                )}
              </button>
              <button
                onClick={() => setActiveLevelTab('privileges')}
                className={`flex-1 py-4 text-center font-medium transition-all relative ${
                  activeLevelTab === 'privileges'
                    ? 'text-planet-purple'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                等级特权
                {activeLevelTab === 'privileges' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-planet-purple transition-all duration-300" />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveLevelTab('exp-logs');
                  // 切换到经验流水标签页时刷新数据
                  if (isOwnProfile) {
                    fetchExpLogs(1, true);
                  }
                }}
                className={`flex-1 py-4 text-center font-medium transition-all relative ${
                  activeLevelTab === 'exp-logs'
                    ? 'text-planet-purple'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                经验流水
                {activeLevelTab === 'exp-logs' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-planet-purple transition-all duration-300" />
                )}
              </button>
            </div>
            
            {/* 标签页内容 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeLevelTab === 'info' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-300">当前等级</span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: getLevelColor(calculateLevel(profile.exp)) }}
                    >
                      {calculateLevel(profile.exp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-300">经验值</span>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{profile.exp || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-300">活跃天数</span>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{profile.activeDays || 0}</span>
                  </div>
                </div>
              )}
              
              {activeLevelTab === 'privileges' && (
                <div className="space-y-4">
                  {levelPrivilegesLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                    </div>
                  ) : levelPrivileges.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="text-6xl mb-4">🎖️</div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无等级特权信息</h3>
                      <p className="text-gray-500 dark:text-gray-400">管理员正在配置等级特权</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">我的等级特权</h3>
                        <div className="space-y-3">
                          {levelPrivileges
                            .filter(level => level.level === calculateLevel(profile.exp))
                            .map(level => (
                              <div key={level.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: level.color || '#8b5cf6' }}
                                  >
                                    Lv.{level.level}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{level.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      经验值: {level.min_exp} - {level.max_exp}
                                    </p>
                                  </div>
                                </div>
                                {level.privileges && typeof level.privileges === 'string' && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">特权：</p>
                                    <ul className="space-y-1 pl-5 list-disc text-sm text-gray-600 dark:text-gray-400">
                                      {level.privileges.split(';').map((privilege, index) => (
                                        <li key={index}>{privilege.trim()}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {level.description && (
                                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                    {level.description}
                                  </p>
                                )}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">积分加成</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      +{level.point_bonus || 0}%
                                    </div>
                                  </div>
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">月球分加成</div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      +{level.moon_points_bonus || 0}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">所有等级特权</h3>
                        <div className="space-y-4">
                          {levelPrivileges.map(level => (
                            <div key={level.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ backgroundColor: level.color || '#8b5cf6' }}
                                >
                                  Lv.{level.level}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{level.name}</h4>
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                      {level.min_exp} - {level.max_exp} 经验值
                                    </span>
                                  </div>
                                  {level.privileges && typeof level.privileges === 'string' && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {level.privileges}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center space-x-2">
                                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                      积分+{level.point_bonus || 0}%
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                      月球分+{level.moon_points_bonus || 0}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeLevelTab === 'exp-logs' && (
                <div className="space-y-4">
                  {/* 筛选器 */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时间范围</label>
                      <select
                        value={expLogsFilter.timeRange}
                        onChange={(e) => handleExpLogsFilterChange('timeRange', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="all">全部</option>
                        <option value="today">今日</option>
                        <option value="week">本周</option>
                        <option value="month">本月</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">经验类型</label>
                      <select
                        value={expLogsFilter.type}
                        onChange={(e) => handleExpLogsFilterChange('type', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="all">全部类型</option>
                        <option value="check_in">打卡</option>
                        <option value="task">任务</option>
                        <option value="post">文章</option>
                        <option value="comment">评论</option>
                        <option value="like">点赞</option>
                        <option value="login">登录</option>
                        <option value="admin">管理员操作</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* 经验流水列表 */}
                  {expLogsLoading && expLogs.length === 0 ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
                    </div>
                  ) : expLogs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">暂无经验流水记录</h3>
                      <p className="text-gray-500 dark:text-gray-400">完成任务、打卡或发布内容获得经验值</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expLogs.map((log) => (
                        <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`font-medium ${
                                  log.exp_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {log.exp_change > 0 ? '+' : ''}{log.exp_change} 经验值
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                                  {log.reason_type === 'check_in' && '打卡'}
                                  {log.reason_type === 'task' && '任务'}
                                  {log.reason_type === 'post' && '文章'}
                                  {log.reason_type === 'comment' && '评论'}
                                  {log.reason_type === 'like' && '点赞'}
                                  {log.reason_type === 'login' && '登录'}
                                  {log.reason_type === 'admin' && '管理员操作'}
                                  {log.reason_type === 'other' && '其他'}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{log.reason}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>经验值: {log.exp_before || 0} → {log.exp_after || 0}</span>
                                <span>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
                              </div>
                            </div>
                            {log.operator && (
                              <div className="flex items-center space-x-2 ml-4">
                                <img
                                  src={log.operator.avatar && log.operator.avatar !== '/uploads/avatars/default.png' ? log.operator.avatar : '/moren.png'}
                                  alt={log.operator.nickname || log.operator.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/moren.png';
                                  }}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {log.operator.nickname || log.operator.username}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* 加载更多 */}
                      {!expLogsLoading && expLogsPagination.page < expLogsPagination.totalPages && (
                        <button
                          onClick={loadMoreExpLogs}
                          className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                          加载更多
                        </button>
                      )}
                      
                      {expLogsLoading && expLogs.length > 0 && (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-planet-purple" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button 
                onClick={() => setIsLevelModalOpen(false)}
                className="px-6 py-2.5 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors shadow-sm hover:shadow"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
