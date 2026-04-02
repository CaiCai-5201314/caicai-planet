import { useState, useEffect } from 'react';
import { FiPlus, FiExternalLink, FiGithub, FiGlobe } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const categories = [
  { id: 'all', name: '全部' },
  { id: 'tech', name: '技术' },
  { id: 'life', name: '生活' },
  { id: 'design', name: '设计' },
  { id: 'other', name: '其他' }
];

export default function Friends() {
  const [friendLinks, setFriendLinks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: '',
    url: '',
    description: '',
    category: 'other'
  });
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchFriendLinks();
  }, [activeCategory]);

  const fetchFriendLinks = async () => {
    try {
      setLoading(true);
      const params = activeCategory !== 'all' ? `?category=${activeCategory}` : '';
      const response = await api.get(`/friend-links${params}`);
      setFriendLinks(response.data.friendLinks);
    } catch (error) {
      console.error('获取友链失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/friend-links/apply', applyForm);
      toast.success('友链申请已提交，等待审核');
      setShowApplyModal(false);
      setApplyForm({ name: '', url: '', description: '', category: 'other' });
    } catch (error) {
      toast.error(error.response?.data?.message || '申请失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">菜菜的朋友们</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              这里汇集了志同道合的朋友们，欢迎访问他们的网站，也欢迎你申请加入我们的友链
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-planet-purple text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('请先登录');
                  return;
                }
                setShowApplyModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-full font-medium hover:shadow-lg transition-shadow"
            >
              <FiPlus size={18} />
              <span>申请友链</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
            </div>
          ) : friendLinks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无友链</h3>
              <p className="text-gray-600">还没有添加任何友链</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-planet-purple/30 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-planet-purple/10 to-planet-pink/10 flex items-center justify-center flex-shrink-0">
                      {link.avatar ? (
                        <img
                          src={link.avatar}
                          alt={link.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <FiGlobe className="text-2xl text-planet-purple" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-planet-purple transition-colors truncate">
                          {link.name}
                        </h3>
                        <FiExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {link.description || '暂无描述'}
                      </p>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {categories.find(c => c.id === link.category)?.name || '其他'}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">申请友链</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站名称 *
                </label>
                <input
                  type="text"
                  required
                  value={applyForm.name}
                  onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                  className="input-field"
                  placeholder="你的网站名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站链接 *
                </label>
                <input
                  type="url"
                  required
                  value={applyForm.url}
                  onChange={(e) => setApplyForm({ ...applyForm, url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  value={applyForm.category}
                  onChange={(e) => setApplyForm({ ...applyForm, category: e.target.value })}
                  className="input-field"
                >
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={applyForm.description}
                  onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="简单介绍一下你的网站"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium"
                >
                  提交申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
