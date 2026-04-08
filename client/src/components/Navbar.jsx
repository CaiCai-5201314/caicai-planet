import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import announcementService from '../services/announcementService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const baseNavItems = [
  { label: '首页', path: '/' },
  { label: '社区', path: '/community' },
  { label: '友链', path: '/friends' },
  { label: '关于', path: '/about' },
  { label: '隐秘星球', path: '/secret' },
];

const authNavItems = [
  { label: '月球', path: '/tasks' },
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
    if (isAuthenticated) {
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

  useEffect(() => {
    fetchAnnouncements();
    
    // 定期检查公告状态，确保及时更新
    const interval = setInterval(fetchAnnouncements, 5000);
    
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnnouncementClick = (announcement) => {
    setCurrentAnnouncement(announcement);
    setIsAnnouncementModalOpen(true);
    setIsAnnouncementMenuOpen(false);
  };

  const handleMarkAsRead = async () => {
    if (currentAnnouncement) {
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
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || location.pathname !== '/'
          ? 'bg-white/80 backdrop-blur-lg shadow-sm'
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
                isScrolled || location.pathname !== '/' ? 'text-gray-900' : 'text-white'
              )}
            >
              菜菜星球
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {[...baseNavItems, ...(isAuthenticated ? authNavItems : [])].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'font-medium transition-colors relative',
                  isScrolled || location.pathname !== '/' 
                    ? location.pathname === item.path
                      ? 'text-planet-purple'
                      : 'text-gray-600 hover:text-planet-purple'
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
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 不在管理员后台页面显示公告通知 */}
                {!location.pathname.includes('/admin') && (
                  <div className="relative">
                    <button
                      onClick={() => setIsAnnouncementMenuOpen(!isAnnouncementMenuOpen)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                    >
                      <FiBell 
                        size={20} 
                        className={cn(
                          isScrolled || location.pathname !== '/' 
                            ? 'text-gray-600'
                            : 'text-white'
                        )} 
                      />
                      {hasAnnouncements && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    
                    {isAnnouncementMenuOpen && announcements.length > 0 && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="font-medium text-gray-900">公告</h3>
                        </div>
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => handleAnnouncementClick(announcement)}>
                            <div className={`font-medium text-sm mb-1 ${announcement.is_read ? 'text-gray-400' : 'text-gray-900'}`}>
                              {announcement.title}
                            </div>
                            <div className={`text-xs line-clamp-2 ${announcement.is_read ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div dangerouslySetInnerHTML={{ __html: announcement.content.substring(0, 100) + '...' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img
                      src={user?.avatar && user.avatar.length > 0 ? user.avatar : 'https://via.placeholder.com/150'}
                      alt={user?.nickname || user?.username}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        isScrolled || location.pathname !== '/' 
                          ? 'text-gray-700'
                          : 'text-white'
                      )}
                    >
                      {user?.nickname || user?.username}
                    </span>
                  </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    <Link
                      to={`/profile/${user?.username}`}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser size={18} />
                      <span>个人主页</span>
                    </Link>
                    <Link
                      to="/notifications"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiBell size={18} />
                      <span>通知</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings size={18} />
                      <span>设置</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings size={18} />
                        <span>后台管理</span>
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <FiLogOut size={18} />
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
                      ? 'text-gray-700 hover:text-planet-purple'
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
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            {[...baseNavItems, ...(isAuthenticated ? authNavItems : [])].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block px-4 py-2 rounded-lg font-medium',
                  location.pathname === item.path
                    ? 'bg-planet-purple/10 text-planet-purple'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-center text-gray-700 font-medium border border-gray-200 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-center text-white font-medium bg-gradient-to-r from-planet-purple to-planet-pink rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to={`/profile/${user?.username}`}
                  className="block px-4 py-2 text-gray-700 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  个人主页
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 font-medium"
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem'
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '42rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {currentAnnouncement.title}
                </h3>
                <button
                  onClick={handleMarkAsRead}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={{ maxWidth: '100%', color: '#374151' }}>
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
    </nav>
  );
}
