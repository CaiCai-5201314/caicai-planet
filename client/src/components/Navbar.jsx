import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

const navItems = [
  { label: '首页', path: '/' },
  { label: '社区', path: '/community' },
  { label: '友链', path: '/friends' },
  { label: '关于', path: '/about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {navItems.map((item) => (
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
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={`${user?.avatar || '/uploads/avatars/default.png'}?t=${Date.now()}`}
                    alt={user?.nickname || user?.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
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
            {navItems.map((item) => (
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
    </nav>
  );
}
