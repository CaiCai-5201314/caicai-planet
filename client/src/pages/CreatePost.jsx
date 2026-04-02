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

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('文章发布成功');
      navigate(`/post/${response.data.post.id}`);
    } catch (error) {
      console.error('发布文章失败:', error);
      toast.error('发布文章失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-8">
            <Link
              to="/community"
              className="flex items-center space-x-2 text-gray-600 hover:text-planet-purple transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回社区</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">发布文章</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入文章标题"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                />
              </div>



              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  摘要
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="请输入文章摘要"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                />
              </div>

              {/* 封面图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图片
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-planet-purple transition-colors">
                    <FiImage size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-600">选择图片</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
                  </label>
                  {coverImage && (
                    <span className="text-sm text-gray-600">
                      {coverImage.name}
                    </span>
                  )}
                </div>
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="请输入文章内容"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
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