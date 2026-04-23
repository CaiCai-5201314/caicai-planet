import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiX, FiImage } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPost();
  }, [id, isAuthenticated, navigate]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      const postData = response.data.post;
      setPost(postData);
      setTitle(postData.title);
      setContent(postData.content);
      setSummary(postData.summary);
      if (postData.cover_image) {
        setCoverImageUrl(postData.cover_image);
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      toast.error('获取文章失败');
    } finally {
      setLoading(false);
    }
  };



  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCoverImage(response.data.url);
      setCoverImageUrl(response.data.url);
      toast.success('图片上传成功');
    } catch (error) {
      console.error('图片上传失败:', error);
      toast.error('图片上传失败');
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('标题和内容不能为空');
      return;
    }

    try {
      const postData = {
        title,
        content,
        summary: summary || content.substring(0, 200)
      };

      if (coverImage) {
        postData.cover_image = coverImage;
      }

      const response = await api.put(`/posts/${id}`, postData);
      toast.success('文章编辑成功');
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('编辑文章失败:', error);
      toast.error('编辑文章失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">文章不存在</h2>
        </div>
      </div>
    );
  }

  if (post.author?.id !== user.id && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-20 text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">没有权限编辑此文章</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`/post/${id}`} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
            <FiArrowLeft className="mr-2" />
            返回文章
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">编辑文章</h1>

            <form onSubmit={handleSubmit}>
              {/* 标题 */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="请输入文章标题"
                  required
                />
              </div>



              {/* 封面图片 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  封面图片
                </label>
                <div className="flex items-center space-x-4">
                  {coverImageUrl && (
                    <div className="relative w-32 h-32">
                      <img
                        src={coverImageUrl.startsWith('http') ? coverImageUrl : `http://localhost:3002${coverImageUrl}`}
                        alt="封面图片"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-planet-purple transition-colors cursor-pointer">
                    <FiImage />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      上传图片
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 内容 */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={12}
                  placeholder="请输入文章内容（支持Markdown）"
                  required
                />
              </div>

              {/* 摘要 */}
              <div className="mb-6">
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  摘要
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="请输入文章摘要（可选，默认使用内容前200字）"
                />
              </div>



              <div className="flex justify-end space-x-4">
                <Link
                  to={`/post/${id}`}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
