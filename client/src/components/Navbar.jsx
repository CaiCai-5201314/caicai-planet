import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBell, FiMessageSquare } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import announcementService from '../services/announcementService';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const baseNavItems = [
  { label: '首页', path: '/' },
  { label: '社区', path: '/community' },
  { label: '友链', path: '/friends' },
];

const authNavItems = [
  { label: '月球', path: '/tasks' },
  { label: '星球实验室', path: '/lab' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasAnnouncements, setHasAnnouncements] = useState(false);
  const [isAnnouncementMenuOpen, setIsAnnouncementMenuOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  
  // 定时器引用
  const [announcementTimer, setAnnouncementTimer] = useState(null);
  const [notificationTimer, setNotificationTimer] = useState(null);
  const [userMenuTimer, setUserMenuTimer] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      console.log('Fetching announcements...');
      const data = await announcementService.getActiveAnnouncements();
      console.log('Announcements data:', data);
      setAnnouncements(data);
      // 只有当有未读公告时才显示红点
      const hasUnread = data.some(ann => !ann.is_read);
      console.log('Has unread announcements:', hasUnread);
      setHasAnnouncements(hasUnread);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      try {
        const response = await api.get('/notifications');
        const notificationList = response.data.notifications || [];
        setNotifications(notificationList);
        // 计算未读通知数量
        const unreadCount = notificationList.filter(n => !n.is_read).length;
        console.log('通知列表:', notificationList);
        console.log('未读通知数量:', unreadCount);
        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('获取通知列表失败:', error);
        setNotifications([]);
        setUnreadNotificationCount(0);
      }
    }
  }, [isAuthenticated]);

  const fetchUnreadNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (isAuthenticated && token) {
      try {
        const response = await api.get('/notifications/unread-count');
        if (response.data && response.data.success) {
          console.log('未读通知数量:', response.data.count);
          console.log('用户角标设置:', user?.badge_notifications);
          setUnreadNotificationCount(response.data.count);
        }
      } catch (error) {
        console.error('获取未读通知数量失败:', error);
        // 不跳转到错误页面，静默失败
        setUnreadNotificationCount(0);
      }
    }
  }, [isAuthenticated, user]);

  const markNotificationAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
      // 更新未读通知数量
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记通知已读失败:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'admin':
        return '⚠️';
      case 'post_approval':
        return '📝';
      default:
        return '📢';
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchNotifications();
    fetchUnreadNotifications();
    
    // 定期检查公告和通知状态，确保及时更新
    const interval = setInterval(() => {
      fetchAnnouncements();
      fetchNotifications();
      fetchUnreadNotifications();
    }, 5000);
    
    // 监听未读通知数量更新事件
    const handleUpdateUnreadCount = (event) => {
      setUnreadNotificationCount(event.detail.count);
    };
    
    window.addEventListener('updateUnreadCount', handleUpdateUnreadCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('updateUnreadCount', handleUpdateUnreadCount);
    };
  }, [fetchAnnouncements, fetchNotifications, fetchUnreadNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnnouncementClick = (announcement) => {
    setCurrentAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
    setIsAnnouncementMenuOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setCurrentNotification(notification);
    setIsNotificationModalOpen(true);
    setIsNotificationMenuOpen(false);
    
    // 如果未读，标记为已读
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token || !currentAnnouncement) return;
    
    console.log('Marking announcement as read:', currentAnnouncement.id);
    const markResult = await announcementService.markAsRead(currentAnnouncement.id);
    console.log('Mark as read result:', markResult);
    // 重新获取公告列表，更新未读状态
    const data = await announcementService.getActiveAnnouncements();
    console.log('Updated announcements:', data);
    setAnnouncements(data);
    // 只有当有未读公告时才显示红点
    const hasUnread = data.some(ann => !ann.is_read);
    console.log('Has unread announcements:', hasUnread);
    setHasAnnouncements(hasUnread);
    setIsAnnouncementModalOpen(false);
    // 关闭公告菜单，确保重新渲染
    setIsAnnouncementMenuOpen(false);
  };

  // 公告菜单悬停处理
  const handleAnnouncementMouseEnter = () => {
    if (announcementTimer) clearTimeout(announcementTimer);
    setIsAnnouncementMenuOpen(true);
  };

  const handleAnnouncementMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsAnnouncementMenuOpen(false);
    }, 200);
    setAnnouncementTimer(timer);
  };

  // 通知菜单悬停处理
  const handleNotificationMouseEnter = () => {
    if (notificationTimer) clearTimeout(notificationTimer);
    setIsNotificationMenuOpen(true);
  };

  const handleNotificationMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsNotificationMenuOpen(false);
    }, 200);
    setNotificationTimer(timer);
  };

  // 用户菜单悬停处理
  const handleUserMenuMouseEnter = () => {
    if (userMenuTimer) clearTimeout(userMenuTimer);
    setIsUserMenuOpen(true);
  };

  const handleUserMenuMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 200);
    setUserMenuTimer(timer);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || location.pathname !== '/'
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm dark:shadow-gray-900/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
              <span className="text-white font-bold text-lg">菜</span>
            </div>
            <span
              className={cn(
                'font-bold text-xl transition-colors',
                isScrolled || location.pathname !== '/' 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-white'
              )}
            >
              菜菜星球
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {[...baseNavItems, ...(isAuthenticated ? authNavItems : [])].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'font-medium transition-colors relative',
                  isScrolled || location.pathname !== '/' 
                    ? location.pathname === item.path
                      ? 'text-planet-purple'
                      : 'text-gray-600 dark:text-gray-300 hover:text-planet-purple'
                    : location.pathname === item.path
                    ? 'text-white'
                    : 'text-white/80 hover:text-white'
                )}
              >
                {item.label}
                {location.pathname === item.path && (
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 w-full h-0.5 rounded-full',
                      isScrolled || location.pathname !== '/' 
                        ? 'bg-planet-purple'
                        : 'bg-white'
                    )}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 不在管理员后台页面显示公告通知 */}
                {!location.pathname.includes('/admin') && (
                  <div 
                    className="relative"
                    onMouseEnter={handleAnnouncementMouseEnter}
                    onMouseLeave={handleAnnouncementMouseLeave}
                  >
                    <div
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors relative cursor-pointer"
                    >
                      <FiBell 
                        size={20} 
                        className={cn(
                          isScrolled || location.pathname !== '/' 
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-white'
                        )} 
                      />
                      {hasAnnouncements && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    
                    {isAnnouncementMenuOpen && announcements.length > 0 && (
                      <div 
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50"
                        onMouseEnter={handleAnnouncementMouseEnter}
                        onMouseLeave={handleAnnouncementMouseLeave}
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <h3 className="font-medium text-gray-900 dark:text-white">公告</h3>
                        </div>
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleAnnouncementClick(announcement)}>
                            <div className={`font-medium text-sm mb-1 ${announcement.is_read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {announcement.title}
                            </div>
                            <div className={`text-xs line-clamp-2 ${announcement.is_read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                              <div dangerouslySetInnerHTML={{ __html: announcement.content.substring(0, 100) + '...' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 不在管理员后台页面显示通知 */}
                {!location.pathname.includes('/admin') && (
                  <div 
                    className="relative"
                    onMouseEnter={handleNotificationMouseEnter}
                    onMouseLeave={handleNotificationMouseLeave}
                  >
                    <div
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors relative cursor-pointer"
                    >
                      <FiMessageSquare 
                        size={20} 
                        className={cn(
                          isScrolled || location.pathname !== '/' 
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-white'
                        )} 
                      />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </div>
                    
                    {isNotificationMenuOpen && notifications.length > 0 && (
                      <div 
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50"
                        onMouseEnter={handleNotificationMouseEnter}
                        onMouseLeave={handleNotificationMouseLeave}
                      >
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">通知</h3>
                          <Link
                            to="/notifications"
                            className="text-sm text-planet-purple hover:underline"
                            onClick={() => setIsNotificationMenuOpen(false)}
                          >
                            查看全部
                          </Link>
                        </div>
                        {notifications.slice(0, 5).map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.is_read ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`} 
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1">
                                <div className={`font-medium text-sm mb-1 ${notification.is_read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                  {notification.content}
                                </div>
                                <div className={`text-xs ${notification.is_read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {new Date(notification.created_at).toLocaleString('zh-CN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            暂无通知
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div 
                  className="relative"
                  onMouseEnter={handleUserMenuMouseEnter}
                  onMouseLeave={handleUserMenuMouseLeave}
                >
                  <div
                    className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                  >
                    <img
                      src={user?.avatar && user.avatar.length > 0 ? user.avatar : '/moren.png'}
                      alt={`${user?.nickname || user?.username}的头像`}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        if (!e.target.dataset.errorHandled) {
                          e.target.dataset.errorHandled = 'true';
                          e.target.src = '/moren.png';
                        }
                      }}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        isScrolled || location.pathname !== '/' 
                          ? 'text-gray-700 dark:text-white'
                          : 'text-white'
                      )}
                    >
                      {user?.nickname || user?.username}
                    </span>
                  </div>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50"
                    onMouseEnter={handleUserMenuMouseEnter}
                    onMouseLeave={handleUserMenuMouseLeave}
                  >
                    <Link
                      to={`/profile/${user?.username}`}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser size={18} className="dark:text-white" />
                      <span>个人主页</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings size={18} className="dark:text-white" />
                      <span>设置</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin-caicai0304"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings size={18} className="dark:text-white" />
                        <span>后台管理</span>
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full"
                    >
                      <FiLogOut size={18} className="dark:text-red-400" />
                      <span>退出登录</span>
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={cn(
                    'px-4 py-2 rounded-full font-medium transition-all',
                    isScrolled || location.pathname !== '/' 
                      ? 'text-gray-700 dark:text-white hover:text-planet-purple'
                      : 'text-white/90 hover:text-white'
                  )}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-full font-medium hover:shadow-lg hover:shadow-planet-purple/30 transition-all"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'md:hidden p-2 rounded-lg',
              isScrolled || location.pathname !== '/'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            )}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-3 space-y-2">
            {[...baseNavItems, ...(isAuthenticated ? authNavItems : [])].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block px-4 py-3 rounded-lg font-medium transition-all duration-200',
                  location.pathname === item.path
                    ? 'bg-planet-purple/10 text-planet-purple'
                    : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="pt-3 space-y-3">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-center text-gray-700 dark:text-white font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 text-center text-white font-medium bg-gradient-to-r from-planet-purple to-planet-pink rounded-lg hover:shadow-lg hover:shadow-planet-purple/30 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <Link
                  to={`/profile/${user?.username}`}
                  className="block px-4 py-3 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  个人主页
                </Link>
                <Link
                  to="/notifications"
                  className="block px-4 py-3 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  通知
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-3 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  设置
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin-caicai0304"
                    className="block px-4 py-3 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    后台管理
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 公告弹窗 - 不在管理员后台页面显示 */}
      {!location.pathname.includes('/admin') && isAnnouncementModalOpen && currentAnnouncement && 
        createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem'
            }}
            onClick={handleMarkAsRead}
          >
            <div 
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '42rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: document.documentElement.classList.contains('dark') ? 'white' : '#111827', margin: 0 }}>
                  公告详情
                </h2>
                <button
                  onClick={handleMarkAsRead}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: document.documentElement.classList.contains('dark') ? 'white' : '#111827', margin: '0 0 0.5rem 0' }}>
                  {currentAnnouncement.title}
                </h3>
              </div>
              <div style={{ maxWidth: '100%', maxHeight: '400px', overflowY: 'auto', color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151', paddingRight: '10px' }}>
                <div dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }} />
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleMarkAsRead}
                  style={{
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7e22ce'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#9333ea'}
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* 通知弹窗 */}
      {isNotificationModalOpen && currentNotification && 
        createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem'
            }}
            onClick={() => setIsNotificationModalOpen(false)}
          >
            <div 
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '42rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{getNotificationIcon(currentNotification.type)}</span>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: document.documentElement.classList.contains('dark') ? 'white' : '#111827', margin: 0 }}>
                      通知详情
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280', margin: '0.25rem 0 0 0' }}>
                      {new Date(currentNotification.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'inherit'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={{ maxWidth: '100%', color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                  {currentNotification.content}
                </p>
                {currentNotification.data && currentNotification.data.comment && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#f9fafb', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280', margin: '0 0 0.5rem 0' }}>评论内容：</p>
                    <p style={{ fontSize: '1rem', color: document.documentElement.classList.contains('dark') ? 'white' : '#111827', margin: 0 }}>
                      {currentNotification.data.comment}
                    </p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {currentNotification.data && currentNotification.data.post_id && (
                  <button
                    onClick={() => {
                      setIsNotificationModalOpen(false);
                      navigate(`/posts/${currentNotification.data.post_id}`);
                    }}
                    style={{
                      paddingLeft: '1.5rem',
                      paddingRight: '1.5rem',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                      color: '#9333ea',
                      border: '1px solid #9333ea',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#faf5ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                    }}
                  >
                    查看详情
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  style={{
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7e22ce'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#9333ea'}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </nav>
  );
}
