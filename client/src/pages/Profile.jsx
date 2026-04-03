import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiLink, FiGithub, FiCalendar, FiEdit, FiTarget, FiHeart, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [likedTasks, setLikedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/profile/${username}`),
        api.get(`/users/${username}/posts`)
      ]);
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
        className="block p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 mb-4"
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradientColor} flex items-center justify-center text-white text-xl flex-shrink-0`}>
            {task.icon || (isMale ? '👨' : '👩')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 truncate">{task.title}</h3>
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
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{task.description || '暂无描述'}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
              <div className="mt-2 text-xs text-gray-400">
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900">用户不存在</h2>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-80 md:h-96 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${profile.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600'})`,
              backgroundSize: profile.cover_style === 'stretch' ? '100% 100%' : profile.cover_style || 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <img
                src={profile.avatar && profile.avatar.length > 0 ? profile.avatar : 'https://via.placeholder.com/150'}
                alt={profile.nickname || profile.username}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.nickname || profile.username}
                </h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-6 py-2 bg-white border border-gray-200 rounded-full font-medium hover:border-planet-purple hover:text-planet-purple transition-colors"
                >
                  <FiEdit size={18} />
                  <span>编辑资料</span>
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <p className="text-gray-600 mb-6">
                  {profile.bio || '这个人很懒，还没有写简介~'}
                </p>

                <div className="space-y-3 text-sm">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-planet-purple"
                    >
                      <FiLink size={16} />
                      <span>{profile.website}</span>
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-planet-purple"
                    >
                      <FiGithub size={16} />
                      <span>GitHub</span>
                    </a>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiCalendar size={16} />
                    <span>
                      加入于 {format(new Date(profile.created_at), 'yyyy年MM月', { locale: zhCN })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profile.stats?.postCount || 0}</div>
                    <div className="text-sm text-gray-500">文章</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profile.stats?.likeCount || 0}</div>
                    <div className="text-sm text-gray-500">获赞</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profile.level || 1}</div>
                    <div className="text-sm text-gray-500">等级</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-4 text-center font-medium transition-colors whitespace-nowrap px-4 ${
                        activeTab === tab.key
                          ? 'text-planet-purple border-b-2 border-planet-purple'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          还没有发布任何文章
                        </div>
                      ) : (
                        posts.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900">{post.title}</h3>
                              {post.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  审核中
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>👁 {post.view_count}</span>
                              <span>❤️ {post.like_count}</span>
                              <span>💬 {post.comment_count}</span>
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
                        <div className="text-center py-8 text-gray-500">
                          仅作者可见
                        </div>
                      ) : likes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          还没有点赞任何文章
                        </div>
                      ) : (
                        likes.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900">{post.title}</h3>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                        <div className="text-center py-8 text-gray-500">
                          仅作者可见
                        </div>
                      ) : favorites.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          还没有收藏任何文章
                        </div>
                      ) : (
                        favorites.map((post) => (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900">{post.title}</h3>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.summary}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                        <div className="text-center py-8 text-gray-500">
                          仅作者可见
                        </div>
                      ) : userTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
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
                            <h3 className="font-bold text-gray-900">我的任务</h3>
                            <span className="text-sm text-gray-500">
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
                        <div className="text-center py-8 text-gray-500">
                          仅作者可见
                        </div>
                      ) : likedTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
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
                            <h3 className="font-bold text-gray-900">点赞的任务</h3>
                            <span className="text-sm text-gray-500">
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
    </div>
  );
}
