import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiFileText, FiMessageSquare, FiLink, FiLogOut,
  FiTrendingUp, FiActivity, FiCalendar, FiMoreVertical, FiEdit2,
  FiLock, FiUnlock, FiVolumeX, FiVolume2, FiSend, FiX,
  FiCamera, FiSave, FiCheck, FiAlertCircle, FiSettings, FiShield
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import ErrorLogs from './ErrorLogs';
import SiteConfig from './SiteConfig';

// 友链管理组件
function FriendLinkManagement() {
  const [friendLinks, setFriendLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentLink, setCurrentLink] = useState(null);
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    avatar: '',
    description: '',
    category: 'other',
    reciprocal_url: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchFriendLinks();
  }, [searchTerm, statusFilter]);

  const fetchFriendLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const response = await api.get(`/admin/friend-links?${params.toString()}`);
      setFriendLinks(response.data.friendLinks);
    } catch (error) {
      console.error('获取友链列表失败:', error);
      toast.error('获取友链列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      toast.error('请填写网站名称和URL');
      return;
    }

    // 验证URL格式
    try {
      new URL(newLink.url);
    } catch (error) {
      toast.error('请输入有效的URL');
      return;
    }

    try {
      await api.post('/admin/friend-links', newLink);
      toast.success('友链添加成功');
      setShowAddModal(false);
      setNewLink({
        name: '',
        url: '',
        avatar: '',
        description: '',
        category: 'other',
        reciprocal_url: ''
      });
      fetchFriendLinks();
    } catch (error) {
      console.error('添加友链失败:', error);
      toast.error('添加友链失败');
    }
  };

  const handleEditLink = async () => {
    if (!currentLink.name.trim() || !currentLink.url.trim()) {
      toast.error('请填写网站名称和URL');
      return;
    }

    // 验证URL格式
    try {
      new URL(currentLink.url);
    } catch (error) {
      toast.error('请输入有效的URL');
      return;
    }

    try {
      await api.put(`/admin/friend-links/${currentLink.id}`, currentLink);
      toast.success('友链更新成功');
      setShowEditModal(false);
      setCurrentLink(null);
      fetchFriendLinks();
    } catch (error) {
      console.error('更新友链失败:', error);
      toast.error('更新友链失败');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('确定要删除这个友链吗？')) {
      try {
        await api.delete(`/admin/friend-links/${id}`);
        toast.success('友链删除成功');
        fetchFriendLinks();
      } catch (error) {
        console.error('删除友链失败:', error);
        toast.error('删除友链失败');
      }
    }
  };

  const handleApproveLink = async (id, status) => {
    try {
      await api.put(`/admin/friend-links/${id}/approve`, { status });
      toast.success(status === 'approved' ? '友链审核通过' : '友链已拒绝');
      fetchFriendLinks();
    } catch (error) {
      console.error('审核友链失败:', error);
      toast.error('审核友链失败');
    }
  };

  const categoryMap = {
    tech: '技术',
    life: '生活',
    design: '设计',
    other: '其他'
  };

  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  };

  const statusColorMap = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusOptions = [
    { value: '', label: '所有状态' },
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '已通过' },
    { value: 'rejected', label: '已拒绝' }
  ];

  const categoryOptions = [
    { value: 'tech', label: '技术' },
    { value: 'life', label: '生活' },
    { value: 'design', label: '设计' },
    { value: 'other', label: '其他' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">友链管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
        >
          添加友链
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索友链..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : friendLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无友链
          </div>
        ) : (
          <div className="space-y-4">
            {friendLinks.map((link) => (
              <div key={link.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img
                      src={link.avatar || '/uploads/avatars/default.png'}
                      alt={link.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-planet-purple hover:underline"
                        >
                          {link.name}
                        </a>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorMap[link.status]}`}>
                          {statusMap[link.status]}
                        </span>
                      </div>
                      <div className="mt-1 text-gray-600 text-sm">
                        {link.description || '无描述'}
                      </div>
                      <div className="mt-2 text-gray-500 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {categoryMap[link.category]}
                        </span>
                        {link.reciprocal_url && (
                          <span className="ml-2 text-blue-500">
                            回链: {link.reciprocal_url}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentLink({ ...link });
                          setShowEditModal(true);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                    {link.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveLink(link.id, 'approved')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleApproveLink(link.id, 'rejected')}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加友链模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  placeholder="请输入网站名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="请输入网站URL"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站Logo</label>
                <input
                  type="text"
                  value={newLink.avatar}
                  onChange={(e) => setNewLink({ ...newLink, avatar: e.target.value })}
                  placeholder="请输入Logo URL"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  placeholder="请输入网站描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回链URL</label>
                <input
                  type="url"
                  value={newLink.reciprocal_url}
                  onChange={(e) => setNewLink({ ...newLink, reciprocal_url: e.target.value })}
                  placeholder="请输入回链URL（可选）"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑友链模态框 */}
      {showEditModal && currentLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑友链</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                <input
                  type="text"
                  value={currentLink.name}
                  onChange={(e) => setCurrentLink({ ...currentLink, name: e.target.value })}
                  placeholder="请输入网站名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站URL</label>
                <input
                  type="url"
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  placeholder="请输入网站URL"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站Logo</label>
                <input
                  type="text"
                  value={currentLink.avatar}
                  onChange={(e) => setCurrentLink({ ...currentLink, avatar: e.target.value })}
                  placeholder="请输入Logo URL"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
                <textarea
                  value={currentLink.description}
                  onChange={(e) => setCurrentLink({ ...currentLink, description: e.target.value })}
                  placeholder="请输入网站描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={currentLink.category}
                  onChange={(e) => setCurrentLink({ ...currentLink, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回链URL</label>
                <input
                  type="url"
                  value={currentLink.reciprocal_url}
                  onChange={(e) => setCurrentLink({ ...currentLink, reciprocal_url: e.target.value })}
                  placeholder="请输入回链URL（可选）"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditLink}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 评论管理组件
function CommentManagement() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/admin/comments?${params.toString()}`);
      setComments(response.data.comments);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('获取评论列表失败:', error);
      toast.error('获取评论列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId, status) => {
    try {
      await api.put(`/admin/comments/${commentId}/status`, { status });
      toast.success('评论状态更新成功');
      fetchComments();
    } catch (error) {
      console.error('更新评论状态失败:', error);
      toast.error('更新评论状态失败');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    try {
      await api.post(`/admin/comments/${currentComment.id}/reply`, { content: replyContent });
      toast.success('回复成功');
      setShowReplyModal(false);
      setCurrentComment(null);
      setReplyContent('');
      fetchComments();
    } catch (error) {
      console.error('回复评论失败:', error);
      toast.error('回复评论失败');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('确定要删除这个评论吗？')) {
      try {
        await api.delete(`/comments/${commentId}`);
        toast.success('评论删除成功');
        fetchComments();
      } catch (error) {
        console.error('删除评论失败:', error);
        toast.error('删除评论失败');
      }
    }
  };

  const statusMap = {
    active: '已通过',
    pending: '待审核',
    deleted: '已删除'
  };

  const statusColorMap = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700'
  };

  const statusOptions = [
    { value: '', label: '所有状态' },
    { value: 'active', label: '已通过' },
    { value: 'pending', label: '待审核' },
    { value: 'deleted', label: '已删除' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">评论管理</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索评论内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无评论
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.user?.avatar || '/uploads/avatars/default.png'}
                      alt={comment.user?.nickname || comment.user?.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.user?.nickname || comment.user?.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-gray-700">
                        {comment.content}
                      </div>
                      {comment.parent && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
                          <div className="text-gray-500">
                            回复 <span className="font-medium">{comment.parent.user?.nickname || comment.parent.user?.username}</span>:
                          </div>
                          <div className="mt-1 text-gray-600">{comment.parent.content}</div>
                        </div>
                      )}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {comment.replies.slice(0, 2).map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg text-sm">
                              <img
                                src={reply.user?.avatar || '/uploads/avatars/default.png'}
                                alt={reply.user?.nickname || reply.user?.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {reply.user?.nickname || reply.user?.username}
                                </div>
                                <div className="mt-1 text-gray-700">{reply.content}</div>
                              </div>
                            </div>
                          ))}
                          {comment.replies.length > 2 && (
                            <div className="text-xs text-gray-500">
                              还有 {comment.replies.length - 2} 条回复...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorMap[comment.status]}`}>
                      {statusMap[comment.status]}
                    </span>
                    <div className="flex space-x-2">
                      {comment.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'active')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          通过
                        </button>
                      )}
                      {comment.status !== 'deleted' && (
                        <button
                          onClick={() => handleStatusChange(comment.id, 'deleted')}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          删除
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCurrentComment(comment);
                          setShowReplyModal(true);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        回复
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <a
                    href={`/post/${comment.post?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-planet-purple hover:underline"
                  >
                    查看文章: {comment.post?.title}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md border ${currentPage === pageNum
                      ? 'bg-planet-purple text-white border-planet-purple'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 回复评论模态框 */}
      {showReplyModal && currentComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">回复评论</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={currentComment.user?.avatar || '/uploads/avatars/default.png'}
                  alt={currentComment.user?.nickname || currentComment.user?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-gray-900">
                  {currentComment.user?.nickname || currentComment.user?.username}
                </span>
              </div>
              <div className="text-gray-700">{currentComment.content}</div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回复内容</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="请输入回复内容"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setCurrentComment(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReply}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  回复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 违禁词管理组件
function BannedWords() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [newWord, setNewWord] = useState('');
  const [newLevel, setNewLevel] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBannedWords();
  }, []);

  const fetchBannedWords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/banned-words');
      setWords(response.data.words);
    } catch (error) {
      console.error('获取违禁词列表失败:', error);
      toast.error('获取违禁词列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      toast.error('请输入违禁词');
      return;
    }

    try {
      await api.post('/admin/banned-words', { word: newWord, level: newLevel });
      toast.success('添加违禁词成功');
      setShowAddModal(false);
      setNewWord('');
      setNewLevel('light');
      fetchBannedWords();
    } catch (error) {
      console.error('添加违禁词失败:', error);
      toast.error('添加违禁词失败');
    }
  };

  const handleEditWord = async () => {
    if (!currentWord.word.trim()) {
      toast.error('请输入违禁词');
      return;
    }

    try {
      await api.put(`/admin/banned-words/${currentWord.id}`, { 
        word: currentWord.word, 
        level: currentWord.level 
      });
      toast.success('更新违禁词成功');
      setShowEditModal(false);
      setCurrentWord(null);
      fetchBannedWords();
    } catch (error) {
      console.error('更新违禁词失败:', error);
      toast.error('更新违禁词失败');
    }
  };

  const handleDeleteWord = async (id) => {
    if (window.confirm('确定要删除这个违禁词吗？')) {
      try {
        await api.delete(`/admin/banned-words/${id}`);
        toast.success('删除违禁词成功');
        fetchBannedWords();
      } catch (error) {
        console.error('删除违禁词失败:', error);
        toast.error('删除违禁词失败');
      }
    }
  };

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const levelMap = {
    light: '轻度',
    medium: '中度',
    high: '高度',
    severe: '重度'
  };

  const levelColorMap = {
    light: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">违禁词管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
        >
          添加违禁词
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索违禁词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无违禁词
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">违禁词</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">等级</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredWords.map((word) => (
                  <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{word.word}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColorMap[word.level]}`}>
                        {levelMap[word.level]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentWord({ ...word });
                            setShowEditModal(true);
                          }}
                          className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteWord(word.id)}
                          className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 添加违禁词模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加违禁词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">违禁词</label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="请输入违禁词"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="light">轻度</option>
                  <option value="medium">中度</option>
                  <option value="high">高度</option>
                  <option value="severe">重度</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWord}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑违禁词模态框 */}
      {showEditModal && currentWord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑违禁词</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">违禁词</label>
                <input
                  type="text"
                  value={currentWord.word}
                  onChange={(e) => setCurrentWord({ ...currentWord, word: e.target.value })}
                  placeholder="请输入违禁词"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级</label>
                <select
                  value={currentWord.level}
                  onChange={(e) => setCurrentWord({ ...currentWord, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="light">轻度</option>
                  <option value="medium">中度</option>
                  <option value="high">高度</option>
                  <option value="severe">重度</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditWord}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLayout({ children }) {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const menuItems = [
    { path: '/admin', icon: FiHome, label: '仪表盘' },
    { path: '/admin/users', icon: FiUsers, label: '用户管理' },
    { path: '/admin/posts', icon: FiFileText, label: '文章管理' },
    { path: '/admin/comments', icon: FiMessageSquare, label: '评论管理' },
    { path: '/admin/friend-links', icon: FiLink, label: '友链管理' },
    { path: '/admin/site-configs', icon: FiSettings, label: '网站配置' },
    { path: '/admin/banned-words', icon: FiShield, label: '违禁词管理' },
    { path: '/admin/error-logs', icon: FiAlertCircle, label: '错误日志' },
  ];

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
              <span className="text-white font-bold">菜</span>
            </div>
            <span className="font-bold text-xl">后台管理</span>
          </div>
        </div>

        <nav className="px-4 pb-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-planet-purple/10 text-planet-purple'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FiLogOut size={20} />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">菜菜星球管理后台</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.nickname || user?.username}</span>
              <img
                src={user?.avatar || '/uploads/avatars/default.png'}
                alt={user?.nickname || user?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// 统计卡片组件
function StatCard({ label, value, icon: Icon, color, trend }) {
  const getIconBgClass = (c) => {
    switch(c) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'green': return 'bg-green-50 text-green-600';
      case 'yellow': return 'bg-yellow-50 text-yellow-600';
      case 'red': return 'bg-red-50 text-red-600';
      case 'purple': return 'bg-purple-50 text-purple-600';
      case 'pink': return 'bg-pink-50 text-pink-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <FiTrendingUp className={`mr-1 ${trend < 0 && 'rotate-180'}`} size={14} />
              {Math.abs(trend)}% 较上周
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getIconBgClass(color)}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

// 仪表盘首页
function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiAlertCircle size={48} className="mx-auto mb-4" />
        <p>无法加载统计数据</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">仪表盘</h2>
        <span className="text-sm text-gray-500 flex items-center">
          <FiCalendar className="mr-2" />
          {new Date().toLocaleDateString('zh-CN')}
        </span>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="总用户数" 
          value={stats.stats.userCount} 
          icon={FiUsers} 
          color="blue" 
          trend={12}
        />
        <StatCard 
          label="文章数量" 
          value={stats.stats.postCount} 
          icon={FiFileText} 
          color="green" 
          trend={8}
        />
        <StatCard 
          label="评论数量" 
          value={stats.stats.commentCount} 
          icon={FiMessageSquare} 
          color="yellow" 
          trend={-3}
        />
        <StatCard 
          label="待审核友链" 
          value={stats.stats.pendingFriendLinks} 
          icon={FiLink} 
          color="red" 
        />
      </div>

      {/* 系统活动 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 最近注册用户 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <FiUsers className="mr-2 text-planet-purple" />
              最近注册用户
            </h3>
            <Link to="/admin/users" className="text-sm text-planet-purple hover:text-planet-pink">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUsers?.length > 0 ? stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <img
                  src={user.avatar || '/uploads/avatars/default.png'}
                  alt={user.nickname || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.nickname || user.username}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">暂无新用户</p>
            )}
          </div>
        </div>

        {/* 最近发布文章 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-green-500" />
              最近发布文章
            </h3>
            <Link to="/admin/posts" className="text-sm text-planet-purple hover:text-planet-pink">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentPosts?.length > 0 ? stats.recentPosts.map((post) => (
              <div key={post.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-lg bg-planet-purple/10 flex items-center justify-center flex-shrink-0">
                  <FiFileText className="text-planet-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.author?.nickname || post.author?.username}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">暂无新文章</p>
            )}
          </div>
        </div>

        {/* 系统概览 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <FiActivity className="mr-2 text-pink-500" />
            系统概览
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">今日新增用户</span>
              <span className="font-bold text-gray-900">+{stats.stats.todayNewUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">今日新增文章</span>
              <span className="font-bold text-gray-900">+{stats.stats.todayNewPosts || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">今日新增评论</span>
              <span className="font-bold text-gray-900">+{stats.stats.todayNewComments || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">系统运行天数</span>
              <span className="font-bold text-gray-900">{stats.stats.runningDays || 1} 天</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 用户编辑弹窗
function UserEditModal({ user, isOpen, onClose, onSave, onAvatarUpload }) {
  const [formData, setFormData] = useState({
    nickname: '',
    password: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        password: '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(user.id, formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post(`/admin/users/${user.id}/avatar`, formData);
      setFormData(prev => ({ ...prev, avatar: response.data.avatar }));
      if (onAvatarUpload) {
        onAvatarUpload();
      }
      toast.success('头像上传成功');
    } catch (error) {
      toast.error('上传失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">编辑用户</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 头像上传 */}
          <div className="flex items-center space-x-4">
            <img
              src={`${formData.avatar || '/uploads/avatars/default.png'}?t=${Date.now()}`}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
              <FiCamera size={18} />
              <span className="text-sm">更换头像</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="输入昵称"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新密码 <span className="text-gray-400 text-xs">(留空则不修改)</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="输入新密码"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 封禁用户弹窗
function UserBanModal({ user, isOpen, onClose, onBan }) {
  const [reason, setReason] = useState('');
  const [banDuration, setBanDuration] = useState('7'); // 默认7天
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('请输入封禁原因');
      return;
    }

    setLoading(true);
    try {
      await onBan(user.id, user.status !== 'banned', reason, parseInt(banDuration));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {user.status === 'banned' ? '解封用户' : '封禁用户'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        {user.status !== 'banned' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 封禁原因 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">封禁原因</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                placeholder="请输入封禁原因（将发送到用户邮箱）"
              />
            </div>

            {/* 封禁时长 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">封禁时长</label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              >
                <option value="1">1天</option>
                <option value="3">3天</option>
                <option value="7">7天</option>
                <option value="14">14天</option>
                <option value="30">30天</option>
                <option value="90">90天</option>
                <option value="-1">永久</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? '处理中...' : '确认封禁'}
              </button>
            </div>
          </form>
        )}

        {user.status === 'banned' && (
          <div className="space-y-4">
            <p className="text-gray-600">确定要解封此用户吗？</p>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onBan(user.id, false);
                    onClose();
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? '处理中...' : '确认解封'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 用户管理
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 封禁/解封账号
  const handleBanUser = async (userId, isBanned, reason = '', duration = 7) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { 
        banned: isBanned, 
        reason, 
        duration 
      });
      toast.success(isBanned ? '账号已封禁' : '账号已解封');
      fetchUsers();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 禁言/解除禁言
  const handleMuteUser = async (userId, isMuted) => {
    try {
      await api.put(`/admin/users/${userId}/mute`, { muted: isMuted });
      toast.success(isMuted ? '用户已禁言' : '禁言已解除');
      fetchUsers();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 禁止/允许发布
  const handlePostBanUser = async (userId, isPostBanned) => {
    try {
      await api.put(`/admin/users/${userId}/post-ban`, { postBanned: isPostBanned });
      toast.success(isPostBanned ? '已禁止发布' : '已允许发布');
      fetchUsers();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 保存用户编辑
  const handleSaveUser = async (userId, data) => {
    try {
      await api.put(`/admin/users/${userId}`, data);
      toast.success('用户信息更新成功');
      fetchUsers();
    } catch (error) {
      toast.error('更新失败');
      throw error;
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (user) => {
    if (user.status === 'banned') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">已封禁</span>;
    }
    if (user.is_muted) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">已禁言</span>;
    }
    if (user.is_post_banned) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">禁发布</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">正常</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">用户信息</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">UID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">角色</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">注册时间</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`${user.avatar || '/uploads/avatars/default.png'}?t=${Date.now()}`}
                      alt={user.nickname || user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.nickname || user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-gray-600">{user.uid}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {/* 编辑 */}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <FiEdit2 size={18} />
                    </button>

                    {/* 封禁/解封 */}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsBanModalOpen(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        user.status === 'banned' 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={user.status === 'banned' ? '解封' : '封禁'}
                    >
                      {user.status === 'banned' ? <FiUnlock size={18} /> : <FiLock size={18} />}
                    </button>

                    {/* 禁言/解除禁言 */}
                    <button
                      onClick={() => handleMuteUser(user.id, !user.is_muted)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_muted 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-orange-600 hover:bg-orange-50'
                      }`}
                      title={user.is_muted ? '解除禁言' : '禁言'}
                    >
                      {user.is_muted ? <FiVolume2 size={18} /> : <FiVolumeX size={18} />}
                    </button>

                    {/* 禁止/允许发布 */}
                    <button
                      onClick={() => handlePostBanUser(user.id, !user.is_post_banned)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_post_banned 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={user.is_post_banned ? '允许发布' : '禁止发布'}
                    >
                      {user.is_post_banned ? <FiSend size={18} /> : <FiX size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiUsers size={48} className="mx-auto mb-4" />
            <p>没有找到用户</p>
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        onAvatarUpload={fetchUsers}
      />

      {/* 封禁用户弹窗 */}
      <UserBanModal
        user={selectedUser}
        isOpen={isBanModalOpen}
        onClose={() => {
          setIsBanModalOpen(false);
          setSelectedUser(null);
        }}
        onBan={handleBanUser}
      />
    </div>
  );
}

// 文章管理
function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/admin/posts?${params.toString()}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, status) => {
    try {
      await api.put(`/posts/${postId}`, { status });
      toast.success('文章状态更新成功');
      fetchPosts();
    } catch (error) {
      console.error('更新文章状态失败:', error);
      toast.error('更新文章状态失败');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await api.delete(`/posts/${postId}`);
        toast.success('文章删除成功');
        fetchPosts();
      } catch (error) {
        console.error('删除文章失败:', error);
        toast.error('删除文章失败');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">待审核</span>;
      case 'published':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">已发布</span>;
      case 'hidden':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">已隐藏</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">未知</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">文章管理</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchPosts()}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
          >
            <option value="">所有状态</option>
            <option value="pending">待审核</option>
            <option value="published">已发布</option>
            <option value="hidden">已隐藏</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">文章信息</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">作者</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">发布时间</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{post.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{post.summary}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author?.avatar || '/uploads/avatars/default.png'}
                      alt={post.author?.nickname || post.author?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">{post.author?.nickname || post.author?.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(post.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {post.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(post.id, 'published')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        通过
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(post.id, post.status === 'published' ? 'hidden' : 'published')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        post.status === 'published'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-planet-purple/10 text-planet-purple hover:bg-planet-purple/20'
                      }`}
                    >
                      {post.status === 'published' ? '隐藏' : '发布'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiFileText size={48} className="mx-auto mb-4" />
            <p>没有找到文章</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/posts" element={<PostManagement />} />
        <Route path="/comments" element={<CommentManagement />} />
        <Route path="/friend-links" element={<FriendLinkManagement />} />
        <Route path="/site-configs" element={<SiteConfig />} />
        <Route path="/banned-words" element={<BannedWords />} />
        <Route path="/error-logs" element={<ErrorLogs />} />
      </Routes>
    </AdminLayout>
  );
}
