import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiTrendingUp, FiClock, FiHeart, FiStar, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';

export default function Community() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [advertisement, setAdvertisement] = useState(null);

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

  // 获取等级对应的昵称颜色
  const getNicknameColor = (level) => {
    if (level >= 10) return '#f59e0b'; // 金色
    if (level >= 9) return '#ef4444'; // 红色
    if (level >= 5) return '#8b5cf6'; // 紫色
    return '#111827'; // 黑色
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchAdvertisement();
  }, [activeCategory, sortBy]);

  const fetchAdvertisement = async () => {
    try {
      const response = await api.get('/advertisements/active', {
        params: { 
          position: 'community_sidebar',
          preview: searchParams.get('preview_ads') === 'true'
        }
      });
      if (response.data.advertisement) {
        setAdvertisement(response.data.advertisement);
      }
    } catch (error) {
      console.error('获取广告失败:', error);
    }
  };

  const handleAdClick = async () => {
    if (!advertisement) return;
    try {
      await api.post(`/advertisements/${advertisement.id}/click`);
    } catch (error) {
      console.error('记录广告点击失败:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory) params.append('category', activeCategory);
      if (sortBy) params.append('sort', sortBy);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/posts?${params.toString()}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回</span>
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">社区</h1>
            <p className="text-gray-600 dark:text-gray-400">发现有趣的文章，参与讨论交流</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索文章..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                    </div>
                  </form>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('newest')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        sortBy === 'newest'
                          ? 'bg-planet-purple text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <FiClock size={18} />
                      <span>最新</span>
                    </button>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        sortBy === 'popular'
                          ? 'bg-planet-purple text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <FiTrendingUp size={18} />
                      <span>热门</span>
                    </button>
                    <button
                      onClick={() => setSortBy('most_liked')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        sortBy === 'most_liked'
                          ? 'bg-planet-purple text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <FiHeart size={18} />
                      <span>最多赞</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setActiveCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === ''
                        ? 'bg-planet-purple text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category.id.toString()
                          ? 'bg-planet-purple text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无文章</h3>
                  <p className="text-gray-600 dark:text-gray-400">还没有发布任何文章</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow ${
                        post.is_pinned ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <Link to={`/post/${post.id}`}>
                        <div className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            {post.is_pinned && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-400/20 text-yellow-700 rounded-lg text-sm">
                                <FiStar size={14} className="fill-yellow-500" />
                                <span>置顶</span>
                              </div>
                            )}
                            <img
                              src={(post.author?.avatar && post.author.avatar.length > 0 && post.author.avatar !== '/uploads/avatars/default.png') ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${(import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')}${post.author.avatar}`) : '/moren.png'}
                              alt={post.author?.nickname || post.author?.username}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/moren.png';
                              }}
                            />
                            <div>
                              <div 
                                className="font-medium"
                                style={{ 
                                  color: getNicknameColor(calculateLevel(post.author?.exp)),
                                  textShadow: calculateLevel(post.author?.exp) >= 10 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                                }}
                              >
                                {post.author?.nickname || post.author?.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                              </div>
                            </div>
                            {post.category && (
                              <span className="ml-auto px-3 py-1 bg-planet-purple/10 text-planet-purple text-sm rounded-full">
                                {post.category.name}
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-planet-purple transition-colors flex items-center gap-2">
                            {post.title}
                          </h2>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {post.summary}
                          </p>

                          {post.cover_image && (
                            <img
                              src={post.cover_image.startsWith('http') ? post.cover_image : `${(import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')}${post.cover_image}`}
                              alt={post.title}
                              className="w-full h-48 object-cover rounded-xl mb-4"
                            />
                          )}

                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <FiHeart size={16} />
                              <span>{post.like_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>💬</span>
                              <span>{post.comment_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>👁</span>
                              <span>{post.view_count}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-1/4 space-y-6">
              {!user ? (
                <div className="bg-gradient-to-br from-planet-purple to-planet-pink rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-xl mb-2">加入社区</h3>
                  <p className="text-white/80 text-sm mb-4">
                    分享你的知识和经验，与志同道合的朋友交流
                  </p>
                  <Link
                    to="/register"
                    className="block w-full py-2 bg-white text-planet-purple text-center rounded-xl font-medium hover:shadow-lg transition-shadow"
                  >
                    立即注册
                  </Link>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-planet-purple to-planet-pink rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-xl mb-2">发布文章</h3>
                  <p className="text-white/80 text-sm mb-4">
                    分享你的知识和经验，与社区成员交流
                  </p>
                  <Link
                    to="/create-post"
                    className="block w-full py-2 bg-white text-planet-purple text-center rounded-xl font-medium hover:shadow-lg transition-shadow"
                  >
                    立即发布
                  </Link>
                </div>
              )}

              {/* 广告位 */}
              {advertisement && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                  {advertisement.image_url ? (
                    <a
                      href={advertisement.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleAdClick}
                      className="block"
                    >
                      <img
                        src={advertisement.image_url.startsWith('http') ? advertisement.image_url : `${(import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')}${advertisement.image_url}`}
                        alt={advertisement.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{advertisement.title}</h3>
                        {advertisement.content && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{advertisement.content}</p>
                        )}
                      </div>
                    </a>
                  ) : (
                    <a
                      href={advertisement.link_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleAdClick}
                      className="block p-4"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{advertisement.title}</h3>
                      {advertisement.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{advertisement.content}</p>
                      )}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 手机端固定发布按钮 */}
      {user && (
        <div className="fixed bottom-8 right-8 lg:hidden">
          <Link
            to="/create-post"
            className="flex items-center justify-center w-16 h-16 bg-planet-purple text-white rounded-full shadow-lg hover:bg-planet-purple/90 transition-all duration-300 transform hover:scale-110 hover:shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
