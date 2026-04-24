import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiArrowLeft, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editComment, setEditComment] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

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
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments?post_id=${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    try {
      const response = await api.post(`/posts/${id}/like`);
      setPost({ ...post, isLiked: response.data.liked, like_count: post.like_count + (response.data.liked ? 1 : -1) });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    try {
      const response = await api.post(`/posts/${id}/favorite`);
      setPost({ ...post, isFavorited: response.data.favorited });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    if (!commentContent.trim()) {
      toast.error('请输入评论内容');
      return;
    }
    try {
      await api.post('/comments', { post_id: id, content: commentContent });
      toast.success('评论成功');
      setCommentContent('');
      fetchComments();
    } catch (error) {
      toast.error('评论失败');
    }
  };

  const handleReply = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }
    try {
      await api.post('/comments', { post_id: id, content: replyContent, parent_id: commentId });
      toast.success('回复成功');
      setReplyTo(null);
      setReplyContent('');
      fetchComments();
    } catch (error) {
      toast.error('回复失败');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        await api.delete(`/comments/${commentId}`);
        toast.success('删除成功');
        fetchComments();
      } catch (error) {
        toast.error('删除失败');
      }
    }
  };

  const handleShare = async () => {
    try {
      // 生成短链接
      const response = await api.post('/short-links/generate', {
        original_url: window.location.href
      });
      
      if (response.data.success) {
        const shortUrl = response.data.short_url;
        
        // 复制短链接到剪贴板
        const tempInput = document.createElement('input');
        tempInput.value = shortUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-9999px';
        document.body.appendChild(tempInput);
        
        tempInput.focus();
        tempInput.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (success) {
          // 显示分享奖励提示
          if (response.data.reward) {
            if (response.data.reward.success) {
              toast.success(response.data.reward.message);
            } else {
              toast.info(response.data.reward.message);
            }
          } else {
            toast.success('链接已复制到剪贴板');
          }
        } else {
          throw new Error('复制失败');
        }
      } else {
        throw new Error('生成短链接失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      // 失败时使用原始链接作为备用
      try {
        const shareUrl = window.location.href;
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-9999px';
        document.body.appendChild(tempInput);
        
        tempInput.focus();
        tempInput.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if (success) {
          toast.success('链接已复制到剪贴板');
        } else {
          throw new Error('复制失败');
        }
      } catch (clipboardError) {
        toast.error('分享失败，请手动复制链接');
      }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/community" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
            <FiArrowLeft className="mr-2" />
            返回社区
          </Link>

          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {post.cover_image && (
              <div style={{ cursor: 'pointer' }} onClick={() => setPreviewImage(post.cover_image.startsWith('http') ? post.cover_image : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${post.cover_image}`)}>
                <img
                  src={post.cover_image.startsWith('http') ? post.cover_image : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${post.cover_image}`}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <img
<<<<<<< HEAD
                  src={(post.author?.avatar && post.author.avatar.length > 0 && post.author.avatar !== '/uploads/avatars/default.png') ? (post.author.avatar.startsWith('http') ? post.author.avatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${post.author.avatar}`) : '/moren.png'}
=======
                  src={(post.author?.avatar && post.author.avatar.length > 0 && post.author.avatar !== '/uploads/avatars/default.png') ? post.author.avatar : '/moren.png'}
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
                  alt={post.author?.nickname || post.author?.username}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/moren.png';
                  }}
                />
                <div>
                  <Link
                    to={`/profile/${post.author?.username}`}
                    className="font-medium hover:text-planet-purple"
                    style={{ 
                      color: getNicknameColor(calculateLevel(post.author?.exp)),
                      textShadow: calculateLevel(post.author?.exp) >= 10 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                    }}
                  >
                    {post.author?.nickname || post.author?.username}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  {post.category && (
                    <span className="px-3 py-1 bg-planet-purple/10 text-planet-purple text-sm rounded-full">
                      {post.category.name}
                    </span>
                  )}
                  {isAuthenticated && (post.author?.id === user.id || user?.isAdmin) && (
                    <Link
                      to={`/edit-post/${id}`}
                      className="px-3 py-1 bg-planet-purple text-white text-sm rounded-full hover:bg-planet-purple/90 transition-colors"
                    >
                      编辑
                    </Link>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{post.title}</h1>

              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ node, inline, className, src, alt, title, ...props }) => (
                      <div style={{ cursor: 'pointer' }} onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(src.startsWith('http') ? src : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${src}`);
                      }}>
                        <img
                          src={src.startsWith('http') ? src : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${src}`}
                          alt={alt}
                          title={title}
                          className={`${className || ''} transition-transform hover:scale-105`}
                          {...props}
                        />
                      </div>
                    )
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                      post.isLiked
                        ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiHeart className={post.isLiked ? 'fill-current' : ''} />
                    <span>{post.like_count}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <FiMessageCircle />
                    <span>{post.comment_count}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full transition-colors ${
                      post.isFavorited
                        ? 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiBookmark className={post.isFavorited ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShare();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    type="button"
                  >
                    <FiShare2 />
                  </button>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              评论 ({comments.length})
            </h3>

            {isAuthenticated && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="写下你的评论..."
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-full font-medium hover:shadow-lg transition-shadow"
                  >
                    发表评论
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  暂无评论，来发表第一条评论吧
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4">
                    <img
<<<<<<< HEAD
                      src={(comment.user?.avatar && comment.user.avatar.length > 0 && comment.user.avatar !== '/uploads/avatars/default.png') ? (comment.user.avatar.startsWith('http') ? comment.user.avatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${comment.user.avatar}`) : '/moren.png'}
=======
                      src={(comment.user?.avatar && comment.user.avatar.length > 0 && comment.user.avatar !== '/uploads/avatars/default.png') ? comment.user.avatar : '/moren.png'}
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
                      alt={comment.user?.nickname || comment.user?.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/moren.png';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className="font-medium"
                          style={{ 
                            color: getNicknameColor(calculateLevel(comment.user?.exp)),
                            textShadow: calculateLevel(comment.user?.exp) >= 10 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                          }}
                        >
                          {comment.user?.nickname || comment.user?.username}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-planet-purple hover:underline"
                        >
                          回复
                        </button>
                        {isAuthenticated && (comment.user?.id === user.id || user?.isAdmin) && (
                          <>
                            <button
                              onClick={() => setEditComment({ id: comment.id, content: comment.content })}
                              className="text-gray-500 dark:text-gray-400 hover:underline"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-500 dark:text-gray-400 hover:underline"
                            >
                              删除
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* 回复输入框 */}
                      {replyTo === comment.id && isAuthenticated && (
                        <div className="mt-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`回复 ${comment.user?.nickname || comment.user?.username}...`}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows={2}
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={() => {
                                setReplyTo(null);
                                setReplyContent('');
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleReply(comment.id)}
                              className="px-3 py-1 text-sm bg-planet-purple text-white rounded hover:bg-planet-purple/90 transition-colors"
                            >
                              回复
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* 二级回复 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-3">
                              <img
<<<<<<< HEAD
                                src={(reply.user?.avatar && reply.user.avatar.length > 0 && reply.user.avatar !== '/uploads/avatars/default.png') ? (reply.user.avatar.startsWith('http') ? reply.user.avatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${reply.user.avatar}`) : '/moren.png'}
=======
                                src={(reply.user?.avatar && reply.user.avatar.length > 0 && reply.user.avatar !== '/uploads/avatars/default.png') ? reply.user.avatar : '/moren.png'}
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
                                alt={reply.user?.nickname || reply.user?.username}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/moren.png';
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span 
                                    className="font-medium"
                                    style={{ 
                                      color: getNicknameColor(calculateLevel(reply.user?.exp)),
                                      textShadow: calculateLevel(reply.user?.exp) >= 10 ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none'
                                    }}
                                  >
                                    {reply.user?.nickname || reply.user?.username}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(reply.created_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs">
                                  {isAuthenticated && (reply.user?.id === user.id || user?.isAdmin) && (
                                    <>
                                      <button
                                        onClick={() => setEditComment({ id: reply.id, content: reply.content })}
                                        className="text-gray-500 dark:text-gray-400 hover:underline"
                                      >
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-gray-500 dark:text-gray-400 hover:underline"
                                      >
                                        删除
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 图片预览模态框 */}
          {previewImage && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
              <div className="max-w-4xl max-h-[90vh] relative">
                <img
                  src={previewImage}
                  alt="预览图片"
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
