import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiLink, FiGithub, FiCalendar, FiEdit } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${profile.cover_image || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1600'})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <img
                src={`${profile.avatar || '/uploads/avatars/default.png'}?t=${Date.now()}`}
                alt={profile.nickname || profile.username}
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
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
                <div className="flex border-b border-gray-100">
                  {['posts', 'likes', 'favorites'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 text-center font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-planet-purple border-b-2 border-planet-purple'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'posts' && '文章'}
                      {tab === 'likes' && '点赞'}
                      {tab === 'favorites' && '收藏'}
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
                    <div className="text-center py-8 text-gray-500">
                      点赞功能开发中...
                    </div>
                  )}

                  {activeTab === 'favorites' && (
                    <div className="text-center py-8 text-gray-500">
                      收藏功能开发中...
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
