import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiImage, FiTag, FiFileText } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMoonPointModal, setShowMoonPointModal] = useState(false);
  const [moonPointMessage, setMoonPointMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast.error('请填写标题和内容');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('summary', summary || content.substring(0, 100) + '...');
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await api.post('/posts', formData);

      toast.success('文章发布成功');

      // 显示月球分相关提示
      if (response.data.moonPoint) {
        const moonPoint = response.data.moonPoint;
        const isFirstPostToday = moonPoint.isFirstPostToday;
        
        if (moonPoint.success) {
          let message = '';
          if (moonPoint.type === 'direct') {
            message = `🎉 恭喜！您已获得 ${moonPoint.points} 月球分！`;
          } else if (moonPoint.type === 'pending') {
            message = `⏳ 您的月球分申请已提交，需要管理员审核后发放 ${moonPoint.points} 月球分！`;
          }
          
          // 只有今日首次发布才弹窗，其他情况用通知
          if (isFirstPostToday) {
            setMoonPointMessage(message);
            setShowMoonPointModal(true);
          } else {
            toast.success(message, { duration: 4000 });
          }
        } else if (moonPoint.error) {
          const message = `⚠️ ${moonPoint.error}`;
          // 只有今日首次发布才弹窗，其他情况用通知
          if (isFirstPostToday) {
            setMoonPointMessage(message);
            setShowMoonPointModal(true);
          } else {
            toast.error(message, { duration: 4000 });
          }
        }
      }

      // 延迟跳转，让用户看到弹窗
      setTimeout(() => {
        navigate(`/post/${response.data.post.id}`);
      }, 2000);
    } catch (error) {
      console.error('发布文章失败:', error);
      toast.error('发布文章失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* 月球分提示弹窗 */}
      {showMoonPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">月球分通知</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{moonPointMessage}</p>
            <button
              onClick={() => setShowMoonPointModal(false)}
              className="w-full px-4 py-3 bg-planet-purple text-white rounded-xl font-medium hover:bg-planet-purple/90 transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              to="/community"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-planet-purple transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回星球广场</span>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">发布文章</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入文章标题"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>



              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  摘要
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="请输入文章摘要"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* 封面图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  封面图片
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-planet-purple transition-colors">
                    <FiImage size={20} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">选择图片</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                  </label>
                  {coverImage && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {coverImage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="请输入文章内容"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-planet-purple text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FiSave size={18} />
                  <span>{loading ? '发布中...' : '发布文章'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}