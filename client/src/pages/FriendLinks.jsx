import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

function FriendLinks() {
  const [friendLinks, setFriendLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFriendLinks();
  }, []);

  const fetchFriendLinks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/friend-links');
      setFriendLinks(response.data.friendLinks);
    } catch (error) {
      console.error('获取友链失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">友链</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              这里是菜菜星球的友好链接，欢迎与我们交换友链，共同成长
            </p>
          </div>

          {/* 友链列表 */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-planet-purple" />
            </div>
          ) : friendLinks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无友链
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={link.avatar || '/uploads/avatars/default.png'}
                      alt={link.name}
                      className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-planet-purple transition-colors">
                        {link.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {link.description || '无描述'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-planet-purple font-medium">
                      访问网站 →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* 友链申请提示 */}
          <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">申请友链</h3>
            <p className="text-gray-600 mb-6">
              如果您希望与菜菜星球交换友链，请联系我们的管理员
            </p>
            <p className="text-gray-500 text-sm">
              友链要求：内容健康，积极向上，与技术或生活相关
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendLinks;