import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiAward, 
  FiTarget, 
  FiClock, 
  FiMessageSquare,
  FiSend,
  FiUser,
  FiHeart,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  
  // 用户任务状态
  const [taskStatus, setTaskStatus] = useState({
    accepted: false,
    completed: false,
    liked: false
  });

  useEffect(() => {
    fetchTaskDetail();
    fetchComments();
    if (isAuthenticated) {
      fetchTaskStatus();
    }
  }, [id, isAuthenticated]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      console.error('获取任务详情失败:', error);
      setError('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', {
        params: { task_id: id }
      });
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const fetchTaskStatus = async () => {
    try {
      const response = await api.get(`/user-tasks/${id}/status`);
      setTaskStatus(response.data);
    } catch (error) {
      console.error('获取任务状态失败:', error);
    }
  };

  // 接受任务
  const handleAcceptTask = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/user-tasks/${id}/accept`);
      toast.success('任务接受成功！');
      setTaskStatus(prev => ({ ...prev, accepted: true }));
      fetchTaskDetail(); // 刷新任务详情（更新参与人数）
    } catch (error) {
      console.error('接受任务失败:', error);
      toast.error(error.response?.data?.message || '接受任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 取消任务
  const handleCancelTask = async () => {
    try {
      setActionLoading(true);
      await api.post(`/user-tasks/${id}/cancel`);
      toast.success('任务已取消');
      setTaskStatus(prev => ({ ...prev, accepted: false, completed: false }));
      fetchTaskDetail();
    } catch (error) {
      console.error('取消任务失败:', error);
      toast.error(error.response?.data?.message || '取消任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 完成任务
  const handleCompleteTask = async () => {
    try {
      setActionLoading(true);
      const response = await api.post(`/user-tasks/${id}/complete`);
      toast.success(`任务完成！获得 ${response.data.reward} 积分`);
      setTaskStatus(prev => ({ ...prev, completed: true }));
    } catch (error) {
      console.error('完成任务失败:', error);
      toast.error(error.response?.data?.message || '完成任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 点赞/取消点赞任务
  const handleLikeTask = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      if (taskStatus.liked) {
        // 取消点赞
        await api.post(`/users/tasks/${id}/unlike`);
        toast.success('已取消点赞');
        setTaskStatus(prev => ({ ...prev, liked: false }));
      } else {
        // 点赞
        await api.post(`/users/tasks/${id}/like`);
        toast.success('点赞成功');
        setTaskStatus(prev => ({ ...prev, liked: true }));
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      toast.error(error.response?.data?.message || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    try {
      setCommentLoading(true);
      await api.post('/comments', {
        task_id: parseInt(id),
        content: newComment,
        parent_id: replyTo
      });
      
      toast.success('评论成功');
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('发表评论失败:', error);
      toast.error(error.response?.data?.message || '评论失败');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const getReplyComment = (parentId) => {
    return comments.find(c => c.id === parentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900">{error || '任务不存在'}</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-6 px-6 py-2 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors"
          >
            返回任务中心
          </button>
        </div>
      </div>
    );
  }

  const isMale = task.gender === 'male';
  const gradientColor = isMale ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-400';

  // 根据任务状态显示不同的按钮
  const renderActionButtons = () => {
    if (taskStatus.completed) {
      return (
        <div className="flex space-x-4">
          <button 
            disabled
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FiCheckCircle size={20} />
            <span>已完成</span>
          </button>
          <button 
            onClick={handleLikeTask}
            disabled={actionLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
              taskStatus.liked 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiHeart size={20} className={taskStatus.liked ? 'fill-current' : ''} />
            <span>{taskStatus.liked ? '已点赞' : '点赞'}</span>
          </button>
        </div>
      );
    }

    if (taskStatus.accepted) {
      return (
        <div className="flex space-x-4">
          <button 
            onClick={handleCompleteTask}
            disabled={actionLoading}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            完成任务
          </button>
          <button 
            onClick={handleCancelTask}
            disabled={actionLoading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <FiX size={20} />
            <span>取消</span>
          </button>
          <button 
            onClick={handleLikeTask}
            disabled={actionLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
              taskStatus.liked 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiHeart size={20} className={taskStatus.liked ? 'fill-current' : ''} />
            <span>{taskStatus.liked ? '已点赞' : '点赞'}</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-4">
        <button 
          onClick={handleAcceptTask}
          disabled={actionLoading}
          className={`flex-1 py-3 bg-gradient-to-r ${gradientColor} text-white rounded-xl font-medium hover:shadow-lg transition-all`}
        >
          {actionLoading ? '处理中...' : '接受任务'}
        </button>
        <button 
          onClick={handleLikeTask}
          disabled={actionLoading}
          className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
            taskStatus.liked 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiHeart size={20} className={taskStatus.liked ? 'fill-current' : ''} />
          <span>{taskStatus.liked ? '已点赞' : '点赞'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 顶部导航 */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full font-medium hover:border-planet-purple hover:text-planet-purple transition-colors"
            >
              <FiArrowLeft size={18} />
              <span>返回</span>
            </button>
          </div>

          {/* 任务详情卡片 */}
          <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8`}>
            {/* 头部 */}
            <div className={`bg-gradient-to-r ${gradientColor} p-8 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{task.icon || (isMale ? '👨' : '👩')}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {task.customType?.name || '任务'}
                  </span>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                  task.difficulty === 'easy' ? 'bg-green-400' :
                  task.difficulty === 'hard' ? 'bg-red-400' : 'bg-yellow-400'
                }`}>
                  {task.difficulty === 'easy' ? '简单' : 
                   task.difficulty === 'hard' ? '困难' : '中等'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
              <p className="text-white/80">{task.customTopic?.name || ''}</p>
            </div>

            {/* 内容 */}
            <div className="p-8">
              {/* 描述 */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3">任务描述</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {task.description || '暂无描述'}
                </p>
              </div>

              {/* 信息网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FiAward size={16} className="mr-2" />
                    <span className="text-sm">奖励积分</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{task.reward}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FiUser size={16} className="mr-2" />
                    <span className="text-sm">参与人数</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {task.currentParticipants || 0}
                    {task.maxParticipants && `/${task.maxParticipants}`}
                  </p>
                </div>

                {task.startTime && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center text-gray-500 mb-1">
                      <FiCalendar size={16} className="mr-2" />
                      <span className="text-sm">开始时间</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(task.startTime).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {task.endTime && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center text-gray-500 mb-1">
                      <FiClock size={16} className="mr-2" />
                      <span className="text-sm">截止时间</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(task.endTime).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              {renderActionButtons()}
            </div>
          </div>

          {/* 评论区 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <FiMessageSquare size={24} className="text-planet-purple mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                任务讨论 ({comments.length})
              </h2>
            </div>

            {/* 评论输入 */}
            <div className="mb-8">
              {replyTo && (
                <div className="flex items-center justify-between mb-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-600">
                    回复: {getReplyComment(replyTo)?.user?.nickname || getReplyComment(replyTo)?.user?.username}
                  </span>
                  <button 
                    onClick={cancelReply}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    取消
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmitComment} className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    id="comment-input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isAuthenticated ? "分享你的想法..." : "请先登录后评论"}
                    disabled={!isAuthenticated || commentLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isAuthenticated || commentLoading || !newComment.trim()}
                  className="px-6 py-3 bg-planet-purple text-white rounded-xl font-medium hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {commentLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <FiSend size={20} />
                  )}
                </button>
              </form>
            </div>

            {/* 评论列表 */}
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex space-x-4">
                      <img
                        src={comment.user?.avatar || 'https://via.placeholder.com/40'}
                        alt={comment.user?.nickname || comment.user?.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {comment.user?.nickname || comment.user?.username}
                            </span>
                            <span className="text-sm text-gray-400">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleReply(comment.id)}
                            className="text-sm text-gray-400 hover:text-planet-purple transition-colors"
                          >
                            回复
                          </button>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>

                        {/* 回复列表 */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex space-x-3">
                                <img
                                  src={reply.user?.avatar || 'https://via.placeholder.com/32'}
                                  alt={reply.user?.nickname || reply.user?.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm text-gray-900">
                                      {reply.user?.nickname || reply.user?.username}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(reply.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiMessageSquare className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500">暂无评论，来说点什么吧~</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
