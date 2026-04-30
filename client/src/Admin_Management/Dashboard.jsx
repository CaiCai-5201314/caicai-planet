import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiFileText, FiMessageSquare, FiLink, FiLogOut,
  FiTrendingUp, FiActivity, FiCalendar, FiMoreVertical, FiEdit2,
  FiLock, FiUnlock, FiVolumeX, FiVolume2, FiSend, FiX, FiTrash2,
  FiCamera, FiSave, FiCheck, FiAlertCircle, FiSettings, FiShield, FiAlertTriangle,
  FiTarget, FiLayers, FiChevronLeft, FiChevronRight, FiMoon, FiStar, FiMenu, FiGift
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import SiteConfig from './SiteConfig';
import AdvertisementManagement from './AdvertisementManagement';
import ErrorLogManagement from './ErrorLogManagement';

import TaskCenterManagement from './TaskCenterManagement';
import TaskTypeManagement from './TaskTypeManagement';
import UserTaskManagement from './UserTaskManagement';
import AnnouncementManagement from './AnnouncementManagement';
import AuthorizationManagement from './AuthorizationManagement';
import CheckInManagement from './CheckInManagement';
import MoonCenterManagement from './MoonCenterManagement';
import MoonPointRequestManagement from './MoonPointRequestManagement';
import MoonPointRuleManagement from './MoonPointRuleManagement';
import ExpManagement from './ExpManagement';
import LabManagement from './LabManagement';
import ShopManagement from './ShopManagement';
import CDKManagement from './CDKManagement';
import FileStorageManagement from './FileStorageManagement';

// 星际传送门管理组件
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
    reciprocal_url: ''
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFriendLinks();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchFriendLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const response = await api.get(`/admin/friend-links?${params.toString()}`);
      setFriendLinks(response.data?.friendLinks || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取星际传送门列表失败:', error);
      toast.error('获取星际传送门列表失败');
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
      toast.success('星际传送门添加成功');
      setShowAddModal(false);
      setNewLink({
        name: '',
        url: '',
        avatar: '',
        description: '',
        reciprocal_url: ''
      });
      fetchFriendLinks();
    } catch (error) {
      console.error('添加星际传送门失败:', error);
      toast.error('添加星际传送门失败');
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
      toast.success('星际传送门更新成功');
      setShowEditModal(false);
      setCurrentLink(null);
      fetchFriendLinks();
    } catch (error) {
      console.error('更新星际传送门失败:', error);
      toast.error('更新星际传送门失败');
    }
  };

  const handleDeleteLink = async (id) => {
    if (window.confirm('确定要删除这个星际传送门吗？')) {
      try {
        await api.delete(`/admin/friend-links/${id}`);
        toast.success('星际传送门删除成功');
        fetchFriendLinks();
      } catch (error) {
        console.error('删除星际传送门失败:', error);
        toast.error('删除星际传送门失败');
      }
    }
  };
  
  // 生成外链接
  const handleGenerateShareLink = async () => {
    try {
      const response = await api.post(`/admin/friend-links/${currentLink.id}/share`, {
        friendLinkId: currentLink.id
      });
      toast.success('外链接生成成功');
      setShowShareModal(false);
      fetchFriendLinks();
    } catch (error) {
      console.error('生成外链接失败:', error);
      toast.error('生成外链接失败');
    }
  };
  
  // 重置外链接
  const handleResetShareLink = async (id) => {
    if (window.confirm('确定要重置这个星际传送门的外链接吗？')) {
      try {
        await api.post(`/admin/friend-links/${id}/share/reset`);
        toast.success('外链接已重置');
        fetchFriendLinks();
      } catch (error) {
        console.error('重置外链接失败:', error);
        toast.error('重置外链接失败');
      }
    }
  };
  
  // 打开分享模态框
  const openShareModal = (link) => {
    setCurrentLink(link);
    setShowShareModal(true);
  };

  const handleApproveLink = async (id, status) => {
    try {
      await api.put(`/admin/friend-links/${id}/approve`, { status });
      toast.success(status === 'approved' ? '星际传送门审核通过' : '星际传送门已拒绝');
      fetchFriendLinks();
    } catch (error) {
      console.error('审核星际传送门失败:', error);
      toast.error('审核星际传送门失败');
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">星际传送门管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
        >
          添加星际传送门
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索星际传送门..."
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
            暂无星际传送门
          </div>
        ) : (
          <div className="space-y-4">
            {friendLinks.map((link) => (
              <div key={link.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img
                      src={(link.avatar && link.avatar.length > 0 && link.avatar !== '/uploads/avatars/default.png') ? link.avatar : '/moren.png'}
                      alt={link.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/moren.png';
                      }}
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
                        {link.reciprocal_url && (
                          <span className="text-blue-500">
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
                        onClick={() => openShareModal(link)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        分享
                      </button>
                      {link.share_code && (
                        <button
                          onClick={() => handleResetShareLink(link.id)}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                        >
                          重置外链接
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                    {link.share_code && (
                      <div className="text-xs text-gray-500 text-right">
                        <div className="flex items-center justify-between">
                          <span>短链接: {link.shortUrl || `${window.location.origin}/short/${link.share_code}`}</span>
                          <button
                            onClick={() => {
                              const shortUrl = link.shortUrl || `${window.location.origin}/short/${link.share_code}`;
                              navigator.clipboard.writeText(shortUrl).then(() => {
                                alert('短链接已复制到剪贴板');
                              });
                            }}
                            className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors ml-2"
                          >
                            复制
                          </button>
                        </div>
                        {link.share_expires_at && (
                          <div>有效期: {new Date(link.share_expires_at).toLocaleString()}</div>
                        )}
                      </div>
                    )}
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

        {/* 分页 */}
        {!loading && (
          <div className="mt-6 flex items-center justify-center mt-auto py-6 border-t border-gray-100">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    className={`px-4 py-2 rounded-md border ${currentPage === pageNum
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
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 添加星际传送门模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加星际传送门</h3>
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
                <div className="flex items-center space-x-4">
                  {newLink.avatar && (
                    <img
                      src={newLink.avatar}
                      alt="Logo预览"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newLink.avatar}
                      onChange={(e) => setNewLink({ ...newLink, avatar: e.target.value })}
                      placeholder="请输入Logo URL或上传图片"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                    />
                    <label className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <FiCamera className="mr-2" />
                      <span>上传图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append('file', file);
                          
                          try {
                            const response = await api.post('/upload/friend-links', formData, {
                              headers: {
                                'Content-Type': 'multipart/form-data'
                              }
                            });
                            setNewLink({ ...newLink, avatar: response.data.url });
                            toast.success('图片上传成功');
                          } catch (error) {
                            console.error('上传失败:', error);
                            toast.error('图片上传失败');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
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

      {/* 编辑星际传送门模态框 */}
      {showEditModal && currentLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑星际传送门</h3>
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
                <div className="flex items-center space-x-4">
                  {currentLink.avatar && (
                    <img
                      src={currentLink.avatar}
                      alt="Logo预览"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentLink.avatar}
                      onChange={(e) => setCurrentLink({ ...currentLink, avatar: e.target.value })}
                      placeholder="请输入Logo URL或上传图片"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                    />
                    <label className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <FiCamera className="mr-2" />
                      <span>上传图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append('file', file);
                          
                          try {
                            const response = await api.post('/upload/friend-links', formData, {
                              headers: {
                                'Content-Type': 'multipart/form-data'
                              }
                            });
                            setCurrentLink({ ...currentLink, avatar: response.data.url });
                            toast.success('图片上传成功');
                          } catch (error) {
                            console.error('上传失败:', error);
                            toast.error('图片上传失败');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
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
      
      {/* 生成外链接模态框 */}
      {showShareModal && currentLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">生成外链接</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">星际传送门名称</label>
                <input
                  type="text"
                  value={currentLink.name}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerateShareLink}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  生成外链接
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 评论列表组件
function CommentList({ type, comments, loading, onStatusChange, onDelete, onReply }) {
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无{type === 'post' ? '星球广场' : '任务'}评论
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <img
                src={(comment.user?.avatar && comment.user.avatar.length > 0 && comment.user.avatar !== '/uploads/avatars/default.png') ? comment.user.avatar : '/moren.png'}
                alt={comment.user?.nickname || comment.user?.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/moren.png';
                }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.nickname || comment.user?.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[comment.status]}`}>
                    {statusMap[comment.status]}
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
                          src={(reply.user?.avatar && reply.user.avatar.length > 0 && reply.user.avatar !== '/uploads/avatars/default.png') ? reply.user.avatar : '/moren.png'}
                          alt={reply.user?.nickname || reply.user?.username}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/moren.png';
                          }}
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
              <div className="flex space-x-2">
                {comment.status !== 'active' && (
                  <button
                    onClick={() => onStatusChange(comment.id, 'active')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    通过
                  </button>
                )}
                {comment.status !== 'deleted' && (
                  <button
                    onClick={() => onStatusChange(comment.id, 'deleted')}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    删除
                  </button>
                )}
                <button
                  onClick={() => onReply(comment)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  回复
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            {type === 'post' && comment.post && (
              <a
                href={`/post/${comment.post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-planet-purple hover:underline"
              >
                查看文章: {comment.post.title}
              </a>
            )}
            {type === 'task' && comment.task && (
              <a
                href={`/task/${comment.task.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-planet-purple hover:underline"
              >
                查看任务: {comment.task.title}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 评论管理组件
function CommentManagement() {
  const [activeTab, setActiveTab] = useState('post'); // 'post' 或 'task'
  const [postComments, setPostComments] = useState([]);
  const [taskComments, setTaskComments] = useState([]);
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
  }, [currentPage, statusFilter, searchTerm, activeTab]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        type: activeTab
      });
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/admin/comments?${params.toString()}`);
      if (activeTab === 'post') {
        setPostComments(response.data?.comments || []);
      } else {
        setTaskComments(response.data?.comments || []);
      }
      setTotalPages(response.data?.pagination?.totalPages || 1);
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

  const openReplyModal = (comment) => {
    setCurrentComment(comment);
    setShowReplyModal(true);
  };

  const statusOptions = [
    { value: '', label: '所有状态' },
    { value: 'active', label: '已通过' },
    { value: 'pending', label: '待审核' },
    { value: 'deleted', label: '已删除' }
  ];

  const tabs = [
    { key: 'post', label: '星球广场评论', count: postComments.length },
    { key: 'task', label: '任务评论', count: taskComments.length }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">评论管理</h2>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-grow flex flex-col">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`
                  py-4 px-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'border-planet-purple text-planet-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-planet-purple/10 text-planet-purple' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 md:p-6 flex-grow flex flex-col">
          {/* 筛选栏 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

          {/* 评论列表 */}
          <CommentList
            type={activeTab}
            comments={activeTab === 'post' ? postComments : taskComments}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReply={openReplyModal}
          />

          {/* 分页 */}
        {!loading && (
          <div className="mt-6 flex items-center justify-center mt-auto py-6 border-t border-gray-100">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    className={`px-4 py-2 rounded-md border ${currentPage === pageNum
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
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
        </div>
      </div>

      {/* 回复评论模态框 */}
      {showReplyModal && currentComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">回复评论</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={(currentComment.user?.avatar && currentComment.user.avatar.length > 0 && currentComment.user.avatar !== '/uploads/avatars/default.png') ? currentComment.user.avatar : '/moren.png'}
                  alt={currentComment.user?.nickname || currentComment.user?.username}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/moren.png';
                  }}
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [newLevel, setNewLevel] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // 批量添加相关状态
  const [bulkWords, setBulkWords] = useState('');
  const [bulkCategory, setBulkCategory] = useState('other');
  const [bulkLevel, setBulkLevel] = useState('light');
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    fetchBannedWords();
    fetchBannedWordStats();
  }, [categoryFilter, levelFilter, currentPage, searchTerm]);

  const fetchBannedWords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      if (levelFilter) {
        params.append('level', levelFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/admin/banned-words?${params.toString()}`);
      setWords(response.data?.words || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取违禁词列表失败:', error);
      toast.error('获取违禁词列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedWordStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/admin/banned-words/stats');
      setStats(response.data);
    } catch (error) {
      console.error('获取违禁词统计失败:', error);
      toast.error('获取违禁词统计失败');
    } finally {
      setStatsLoading(false);
    }
  };

  // 批量添加违禁词处理函数
  const handleBulkAdd = async () => {
    if (!bulkWords.trim() && !bulkFile) {
      toast.error('请输入违禁词或上传文件');
      return;
    }

    try {
      setBulkLoading(true);
      setBulkResult(null);

      let response;
      if (bulkFile) {
        // 文件上传方式
        const formData = new FormData();
        formData.append('file', bulkFile);
        formData.append('category', bulkCategory);
        formData.append('level', bulkLevel);
        response = await api.post('/admin/banned-words/bulk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // 文本输入方式
        const words = bulkWords.split('\n').filter(word => word.trim());
        response = await api.post('/admin/banned-words/bulk', {
          words,
          category: bulkCategory,
          level: bulkLevel
        });
      }

      setBulkResult(response.data);
      toast.success('批量添加完成');
      fetchBannedWords();
      fetchBannedWordStats();
    } catch (error) {
      console.error('批量添加违禁词失败:', error);
      toast.error('批量添加违禁词失败');
    } finally {
      setBulkLoading(false);
    }
  };

  // 处理文件上传
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['.txt', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('仅支持 .txt 和 .csv 文件');
        return;
      }
      setBulkFile(file);
      setBulkWords(''); // 清空文本输入
    }
  };

  // 重置批量添加表单
  const resetBulkForm = () => {
    setBulkWords('');
    setBulkCategory('other');
    setBulkLevel('light');
    setBulkFile(null);
    setBulkResult(null);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      toast.error('请输入违禁词');
      return;
    }

    try {
      await api.post('/admin/banned-words', { 
        word: newWord, 
        category: newCategory, 
        level: newLevel 
      });
      toast.success('添加违禁词成功');
      setShowAddModal(false);
      setNewWord('');
      setNewCategory('other');
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
        category: currentWord.category, 
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

  const categoryMap = {
    political: '政治敏感',
    obscene: '低俗辱骂',
    advertisement: '广告营销',
    violence: '暴力血腥',
    discrimination: '歧视性',
    other: '其他'
  };

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

  const categoryColorMap = {
    political: 'bg-blue-100 text-blue-700',
    obscene: 'bg-pink-100 text-pink-700',
    advertisement: 'bg-purple-100 text-purple-700',
    violence: 'bg-red-100 text-red-700',
    discrimination: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const categoryOptions = [
    { value: '', label: '全部分类' },
    { value: 'political', label: '政治敏感' },
    { value: 'obscene', label: '低俗辱骂' },
    { value: 'advertisement', label: '广告营销' },
    { value: 'violence', label: '暴力血腥' },
    { value: 'discrimination', label: '歧视性' },
    { value: 'other', label: '其他' }
  ];

  const levelOptions = [
    { value: '', label: '全部等级' },
    { value: 'light', label: '轻度' },
    { value: 'medium', label: '中度' },
    { value: 'high', label: '高度' },
    { value: 'severe', label: '重度' }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">违禁词管理</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkAddModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            批量添加
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
          >
            添加违禁词
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">总违禁词数</h3>
          {statsLoading ? (
            <div className="animate-pulse text-3xl font-bold text-planet-purple">--</div>
          ) : (
            <div className="text-3xl font-bold text-planet-purple">{stats?.total || 0}</div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">分类分布</h3>
          {statsLoading ? (
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          ) : (
            <div className="space-y-2">
              {stats?.categoryStats?.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{categoryMap[item.category]}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">等级分布</h3>
          {statsLoading ? (
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          ) : (
            <div className="space-y-2">
              {stats?.levelStats?.map((item) => (
                <div key={item.level} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{levelMap[item.level]}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索违禁词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchBannedWords()}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              {levelOptions.map((option) => (
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
        ) : words.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无违禁词
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">违禁词</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">等级</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{word.word}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColorMap[word.category]}`}>
                        {categoryMap[word.category]}
                      </span>
                    </td>
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
        
        {/* 分页 */}
        {!loading && (
          <div className="mt-6 flex items-center justify-center mt-auto py-6 border-t border-gray-100">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    className={`px-4 py-2 rounded-md border ${currentPage === pageNum
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
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                下一页
              </button>
            </nav>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="political">政治敏感</option>
                  <option value="obscene">低俗辱骂</option>
                  <option value="advertisement">广告营销</option>
                  <option value="violence">暴力血腥</option>
                  <option value="discrimination">歧视性</option>
                  <option value="other">其他</option>
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={currentWord.category}
                  onChange={(e) => setCurrentWord({ ...currentWord, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="political">政治敏感</option>
                  <option value="obscene">低俗辱骂</option>
                  <option value="advertisement">广告营销</option>
                  <option value="violence">暴力血腥</option>
                  <option value="discrimination">歧视性</option>
                  <option value="other">其他</option>
                </select>
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

      {/* 批量添加违禁词模态框 */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">批量添加违禁词</h3>
            <div className="space-y-4">
              {/* 文本输入方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文本输入（每行一个违禁词）
                </label>
                <textarea
                  value={bulkWords}
                  onChange={(e) => setBulkWords(e.target.value)}
                  placeholder="请输入违禁词，每行一个"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              {/* 文件上传方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文件上传（支持 .txt 和 .csv 格式）
                </label>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
                {bulkFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    已选择文件: {bulkFile.name}
                  </p>
                )}
              </div>

              {/* 分类和等级设置 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="political">政治敏感</option>
                    <option value="obscene">低俗辱骂</option>
                    <option value="advertisement">广告营销</option>
                    <option value="violence">暴力血腥</option>
                    <option value="discrimination">歧视性</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">等级</label>
                  <select
                    value={bulkLevel}
                    onChange={(e) => setBulkLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="light">轻度</option>
                    <option value="medium">中度</option>
                    <option value="high">高度</option>
                    <option value="severe">重度</option>
                  </select>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowBulkAddModal(false);
                    resetBulkForm();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={bulkLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkLoading ? '添加中...' : '批量添加'}
                </button>
              </div>

              {/* 批量添加结果 */}
              {bulkResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">添加结果</h4>
                  <div className="space-y-2 text-sm">
                    <p>成功添加: <span className="font-medium text-green-600">{bulkResult.successCount}</span></p>
                    <p>重复数量: <span className="font-medium text-yellow-600">{bulkResult.duplicateCount}</span></p>
                    <p>失败数量: <span className="font-medium text-red-600">{bulkResult.failureCount}</span></p>
                    {bulkResult.failures && bulkResult.failures.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700">失败原因:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {bulkResult.failures.slice(0, 5).map((failure, index) => (
                            <li key={index}>{failure}</li>
                          ))}
                          {bulkResult.failures.length > 5 && (
                            <li>...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLayout({ children }) {
  const location = useLocation();
  const { logout, user, isAuthenticated, fetchUser } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 调试信息
  console.log('AdminLayout - user:', user);
  console.log('AdminLayout - isAuthenticated:', isAuthenticated);

  // 如果没有用户信息，尝试获取
  if (!user && localStorage.getItem('token')) {
    console.log('AdminLayout - fetching user...');
    fetchUser();
  }

  // 根据用户角色和权限过滤菜单项目
  const getMenuItems = () => {
    const allMenuItems = [
      { path: '/admin-caicai0304', icon: FiHome, label: '仪表盘', permission: 'dashboard' },
      { 
        label: '用户中心', 
        icon: FiUsers, 
        permission: 'userManagement',
        children: [
          { path: '/admin-caicai0304/users', label: '用户管理', permission: 'userManagement' },
          { path: '/admin-caicai0304/authorization', label: '授权中心', permission: 'authorization' },
          { path: '/admin-caicai0304/check-ins', label: '打卡记录管理', permission: 'checkInManagement' }
        ]
      },
      { 
        label: '星球广场中心', 
        icon: FiFileText, 
        permission: 'postManagement',
        children: [
          { path: '/admin-caicai0304/posts', label: '文章管理', permission: 'postManagement' },
          { path: '/admin-caicai0304/comments', label: '评论管理', permission: 'commentManagement' },
          { path: '/admin-caicai0304/banned-words', label: '违禁词管理', permission: 'bannedWordManagement' }
        ]
      },
      { 
        label: '月球分中心', 
        icon: FiMoon, 
        permission: 'moonCenterManagement',
        children: [
          { path: '/admin-caicai0304/moon-centers', label: '月球分管理', permission: 'moonCenterManagement' },
          { path: '/admin-caicai0304/moon-point-requests', label: '月球分审核', permission: 'moonPointRequestManagement' },
          { path: '/admin-caicai0304/moon-point-rules', label: '月球分规则', permission: 'moonPointRuleManagement' },
          { path: '/admin-caicai0304/exp-management', label: '经验值管理', permission: 'expManagement' }
        ]
      },
      { 
        label: '任务中心', 
        icon: FiMoon, 
        permission: 'taskCenter',
        children: [
          { path: '/admin-caicai0304/task-types', label: '任务类型管理', permission: 'taskTypeManagement' },
          { path: '/admin-caicai0304/task-center', label: '任务中心管理', permission: 'taskCenter' },
          { path: '/admin-caicai0304/user-tasks', label: '用户任务管理', permission: 'userTaskManagement' }
        ]
      },
      { path: '/admin-caicai0304/site-configs', icon: FiSettings, label: '网站配置', permission: 'siteConfig' },
      { path: '/admin-caicai0304/announcements', icon: FiFileText, label: '公告管理', permission: 'announcementManagement' },
      { path: '/admin-caicai0304/friend-links', icon: FiLink, label: '星际传送门管理', permission: 'friendLinkManagement' },
      { path: '/admin-caicai0304/advertisements', icon: FiTarget, label: '广告位管理', permission: 'siteConfig' },
      { path: '/admin-caicai0304/error-logs', icon: FiAlertCircle, label: '错误日志管理', permission: 'errorLogManagement' },
      { path: '/admin-caicai0304/lab', icon: FiSettings, label: '星球实验室管理', permission: 'labManagement' },
      { path: '/admin-caicai0304/cdk', icon: FiGift, label: 'CDK兑换码管理', permission: 'cdkManagement' },
      { path: '/admin-caicai0304/file-storage', icon: FiSave, label: '文件存储管理', permission: 'fileStorageManagement' },
      { path: '/admin-caicai0304/shop', icon: FiStar, label: '星星小卖部管理', permission: 'shopManagement' },
    ];

    // 管理员显示所有菜单
    if (user?.role === 'admin') {
      return allMenuItems;
    }

    // 子权限账号根据权限显示菜单
    if (user?.role === 'sub_admin') {
      return allMenuItems.filter(item => {
        if (item.children) {
          // 对于有子菜单的项目，检查是否有任何子菜单有权限
          const hasPermission = item.children.some(child => user.permissions?.[child.permission]);
          if (hasPermission) {
            // 过滤子菜单，只显示有权限的
            item.children = item.children.filter(child => user.permissions?.[child.permission]);
          }
          return hasPermission;
        }
        return user.permissions?.[item.permission];
      });
    }

    // 默认返回空数组
    return [];
  };

  const menuItems = getMenuItems();

  // 检查当前路径是否在子菜单中
  const isActive = (item) => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return location.pathname === item.path;
  };

  // 切换下拉菜单
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  if (!user) {
    console.log('AdminLayout - no user, redirecting to login');
    return <Navigate to="/admin-caicai0304/login" />;
  }

  if (user?.role !== 'admin' && user?.role !== 'sub_admin') {
    console.log('AdminLayout - not admin or sub_admin, redirecting to login');
    return <Navigate to="/admin-caicai0304/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:block ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
                <span className="text-white font-bold">菜</span>
              </div>
              <span className="font-bold text-xl">后台管理</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
              <span className="text-white font-bold">菜</span>
            </div>
            <span className="font-bold text-xl">后台管理</span>
          </div>
        </div>

        <nav className="px-4 pb-20 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.path || item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-colors ${
                      isActive(item)
                        ? 'bg-planet-purple/10 text-planet-purple'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <FiChevronRight 
                      size={16} 
                      className={`transition-transform ${
                        openDropdown === item.label ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="pl-10 pr-4 py-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-4 py-2 rounded-xl transition-colors ${
                            location.pathname === child.path
                              ? 'bg-planet-purple/10 text-planet-purple'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    location.pathname === item.path
                      ? 'bg-planet-purple/10 text-planet-purple'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FiLogOut size={20} />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* 移动端顶部栏 */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <FiMenu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
              <span className="text-white font-bold text-sm">菜</span>
            </div>
            <span className="font-bold text-lg">后台管理</span>
          </div>
          <div className="w-10"></div>
        </div>
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </div>
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
          trend={stats.stats.userTrend}
        />
        <StatCard 
          label="文章数量" 
          value={stats.stats.postCount} 
          icon={FiFileText} 
          color="green" 
          trend={stats.stats.postTrend}
        />
        <StatCard 
          label="评论数量" 
          value={stats.stats.commentCount} 
          icon={FiMessageSquare} 
          color="yellow" 
          trend={stats.stats.commentTrend}
        />
        <StatCard 
          label="待审核星际传送门" 
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
            <Link to="/admin-caicai0304/users" className="text-sm text-planet-purple hover:text-planet-pink">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentUsers?.length > 0 ? stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <img
                  src={(user.avatar && user.avatar.length > 0 && user.avatar !== '/uploads/avatars/default.png') ? user.avatar : '/moren.png'}
                  alt={user.nickname || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/moren.png';
                  }}
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
            <Link to="/admin-caicai0304/posts" className="text-sm text-planet-purple hover:text-planet-pink">
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
    email: '',
    password: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        email: user.email || '',
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
              src={formData.avatar && formData.avatar.length > 0 ? formData.avatar : '/moren.png'}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                if (!e.target.dataset.errorHandled) {
                  e.target.dataset.errorHandled = 'true';
                  e.target.src = '/moren.png';
                }
              }}
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

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="输入邮箱"
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUserId, setStatusUserId] = useState(null);
  const [statusUserName, setStatusUserName] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [lastLoginFrom, setLastLoginFrom] = useState('');
  const [lastLoginTo, setLastLoginTo] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortBy, sortOrder, lastLoginFrom, lastLoginTo]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      if (sortOrder) {
        params.append('sortOrder', sortOrder);
      }
      if (lastLoginFrom) {
        params.append('lastLoginFrom', lastLoginFrom);
      }
      if (lastLoginTo) {
        params.append('lastLoginTo', lastLoginTo);
      }
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
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

  // 删除用户
  const handleDeleteUser = (userId, username) => {
    setDeleteUserId(userId);
    setDeleteUserName(username);
    setIsDeleteModalOpen(true);
  };

  // 确认删除用户
  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      toast.success('用户删除成功');
      setIsDeleteModalOpen(false);
      setDeleteUserId(null);
      setDeleteUserName('');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error('删除用户失败');
    }
  };

  // 激活/停用用户
  const handleToggleStatus = (userId, username, currentStatus) => {
    const newStatus = currentStatus === 'inactive' ? 'active' : 'inactive';
    setStatusUserId(userId);
    setStatusUserName(username);
    setTargetStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  // 确认激活/停用用户
  const confirmToggleStatus = async () => {
    if (!statusUserId || !targetStatus) return;

    try {
      await api.put(`/admin/users/${statusUserId}/status`, { status: targetStatus });
      toast.success(`用户已${targetStatus === 'active' ? '激活' : '停用'}`);
      setIsStatusModalOpen(false);
      setStatusUserId(null);
      setStatusUserName('');
      setTargetStatus('');
      fetchUsers();
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('更新用户状态失败');
    }
  };




  const getStatusBadge = (user) => {
    if (user.status === 'banned') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">已封禁</span>;
    }
    if (user.status === 'inactive') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">未激活</span>;
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
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <input
              type="text"
              placeholder="搜索用户..."
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
              <option value="">所有状态</option>
              <option value="active">正常</option>
              <option value="banned">已封禁</option>
            </select>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">所有角色</option>
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="created_at">按注册时间</option>
              <option value="last_login">按最后登录时间</option>
            </select>
          </div>
          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="DESC">降序</option>
              <option value="ASC">升序</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setRoleFilter('');
                setSortBy('created_at');
                setSortOrder('DESC');
                setLastLoginFrom('');
                setLastLoginTo('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重置筛选
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <input
              type="date"
              placeholder="最后登录开始时间"
              value={lastLoginFrom}
              onChange={(e) => setLastLoginFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="最后登录结束时间"
              value={lastLoginTo}
              onChange={(e) => setLastLoginTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户信息</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">UID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">注册时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">最后登录</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">注册IP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={(user.avatar && user.avatar.length > 0 && user.avatar !== '/uploads/avatars/default.png') ? user.avatar : '/moren.png'}
                        alt={user.nickname || user.username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          if (!e.target.dataset.errorHandled) {
                            e.target.dataset.errorHandled = 'true';
                            e.target.src = '/moren.png';
                          }
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.nickname || user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-600">{user.uid}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {user.register_ip || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      {/* 编辑 */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* 激活/停用 */}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.nickname || user.username, user.status)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'inactive' 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title={user.status === 'inactive' ? '激活用户' : '停用用户'}
                      >
                        {user.status === 'inactive' ? <FiCheck size={16} /> : <FiX size={16} />}
                      </button>

                      {/* 封禁/解封 */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsBanModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.status === 'banned' 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.status === 'banned' ? '解封' : '封禁'}
                      >
                        {user.status === 'banned' ? <FiUnlock size={16} /> : <FiLock size={16} />}
                      </button>

                      {/* 禁言/解除禁言 */}
                      <button
                        onClick={() => handleMuteUser(user.id, !user.is_muted)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.is_muted 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-orange-600 hover:bg-orange-50'
                        }`}
                        title={user.is_muted ? '解除禁言' : '禁言'}
                      >
                        {user.is_muted ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
                      </button>

                      {/* 禁止/允许发布 */}
                      <button
                        onClick={() => handlePostBanUser(user.id, !user.is_post_banned)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.is_post_banned 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={user.is_post_banned ? '允许发布' : '禁止发布'}
                      >
                        {user.is_post_banned ? <FiSend size={16} /> : <FiX size={16} />}
                      </button>

                      {/* 删除用户 */}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.nickname || user.username)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除用户"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FiUsers size={32} className="mx-auto mb-2" />
              <p className="text-sm">没有找到用户</p>
            </div>
          )}
        </div>

        {/* 分页 */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 flex items-center justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                <FiChevronLeft size={14} className="mr-1" />
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
                    className={`px-3 py-1.5 rounded-md border text-sm ${currentPage === pageNum
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
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                下一页
                <FiChevronRight size={14} className="ml-1" />
              </button>
            </nav>
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

      {/* 删除用户确认弹窗 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">确认删除</h3>
                  <p className="text-red-100 mt-1">永久删除用户账户</p>
                </div>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteUserId(null);
                    setDeleteUserName('');
                  }} 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 size={32} className="text-red-500" />
                </div>
                <p className="text-gray-700 text-lg">
                  确定要删除用户 <span className="font-bold text-red-600">{deleteUserName}</span> 吗？
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  此操作不可恢复，将删除该用户的所有数据
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteUserId(null);
                    setDeleteUserName('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center"
                >
                  <FiTrash2 size={18} className="mr-2" />
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 激活/停用用户确认弹窗 */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`bg-gradient-to-r px-8 py-5 ${
              targetStatus === 'active' 
                ? 'from-green-500 to-emerald-600' 
                : 'from-yellow-500 to-orange-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {targetStatus === 'active' ? '确认激活' : '确认停用'}
                  </h3>
                  <p className="text-white/90 mt-1">
                    {targetStatus === 'active' ? '激活用户账户' : '停用用户账户'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setStatusUserId(null);
                    setStatusUserName('');
                    setTargetStatus('');
                  }} 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  targetStatus === 'active' 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  {targetStatus === 'active' ? (
                    <FiCheck size={32} className="text-green-500" />
                  ) : (
                    <FiX size={32} className="text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-700 text-lg">
                  确定要{targetStatus === 'active' ? '激活' : '停用'}用户 <span className={`font-bold ${
                    targetStatus === 'active' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>{statusUserName}</span> 吗？
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {targetStatus === 'active' 
                    ? '用户将可以正常登录和使用系统' 
                    : '用户将无法登录和使用系统'
                  }
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setStatusUserId(null);
                    setStatusUserName('');
                    setTargetStatus('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmToggleStatus}
                  className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all flex items-center justify-center ${
                    targetStatus === 'active' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                  }`}
                >
                  {targetStatus === 'active' ? (
                    <><FiCheck size={18} className="mr-2" />确认激活</>
                  ) : (
                    <><FiX size={18} className="mr-2" />确认停用</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 文章管理
function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewPost, setPreviewPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, currentPage, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/admin/posts?${params.toString()}`);
      setPosts(response.data?.posts || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
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

  const handleTogglePin = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/toggle-pin`);
      toast.success(response.data.message);
      fetchPosts();
    } catch (error) {
      console.error('置顶文章失败:', error);
      toast.error(error.response?.data?.message || '置顶文章失败');
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
  
  const handlePreviewPost = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      setPreviewPost(response.data.post);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('获取文章详情失败:', error);
      toast.error('获取文章详情失败');
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">文章管理</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchPosts()}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col">
        <div className="overflow-x-auto">
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
                    <div className="flex items-center gap-2 mb-1">
                      {post.is_pinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          <FiStar size={12} className="fill-yellow-500" />
                          置顶
                        </span>
                      )}
                      <p className="font-medium text-gray-900">{post.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{post.summary}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={(post.author?.avatar && post.author.avatar.length > 0 && post.author.avatar !== '/uploads/avatars/default.png') ? post.author.avatar : '/moren.png'}
                      alt={post.author?.nickname || post.author?.username}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/moren.png';
                      }}
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
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <button
                      onClick={() => handlePreviewPost(post.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="预览文章"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleTogglePin(post.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${post.is_pinned ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                      {post.is_pinned ? '取消置顶' : '置顶'}
                    </button>
                    {post.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(post.id, 'published')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        通过
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(post.id, post.status === 'published' ? 'hidden' : 'published')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${post.status === 'published' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-planet-purple/10 text-planet-purple hover:bg-planet-purple/20'}`}
                    >
                      {post.status === 'published' ? '隐藏' : '发布'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
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
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiFileText size={48} className="mx-auto mb-4" />
            <p>没有找到文章</p>
          </div>
        )}

        {/* 分页 */}
        {!loading && (
          <div className="px-6 py-6 border-t border-gray-100 flex items-center justify-center mt-auto">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    className={`px-4 py-2 rounded-md border ${currentPage === pageNum
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
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 文章预览弹窗 */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">文章预览</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{previewPost.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <img
                    src={(previewPost.author?.avatar && previewPost.author.avatar.length > 0 && previewPost.author.avatar !== '/uploads/avatars/default.png') ? previewPost.author.avatar : '/moren.png'}
                    alt={previewPost.author?.nickname || previewPost.author?.username}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/moren.png';
                    }}
                  />
                  <span>{previewPost.author?.nickname || previewPost.author?.username}</span>
                </div>
                <span>{new Date(previewPost.created_at).toLocaleString('zh-CN')}</span>
                <span>浏览 {previewPost.view_count || 0}</span>
              </div>
              {previewPost.image && (
                <div className="w-full">
                  <img
                    src={previewPost.image}
                    alt={previewPost.title}
                    className="w-full h-auto rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = '/moren.png';
                    }}
                  />
                </div>
              )}
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: previewPost.content }} />
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  标签: {previewPost.tags?.map(tag => tag.name).join(', ') || '无'}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  分类: {previewPost.category?.name || '未分类'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 路由保护组件
function ProtectedRoute({ children, requiredRole = 'admin', requiredPermission }) {
  const { user } = useAuthStore();
  
  // 检查权限
  if (user?.role === 'sub_admin') {
    // 如果需要特定权限，检查用户是否有该权限
    if (requiredPermission && !user.permissions?.[requiredPermission]) {
      return <Navigate to="/admin-caicai0304" />;
    }
  }
  
  return children;
}

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<ProtectedRoute requiredPermission="dashboard"><DashboardHome /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute requiredPermission="userManagement"><UserManagement /></ProtectedRoute>} />
        <Route path="/authorization" element={<ProtectedRoute requiredPermission="authorization"><AuthorizationManagement /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute requiredPermission="postManagement"><PostManagement /></ProtectedRoute>} />
        <Route path="/comments" element={<ProtectedRoute requiredPermission="commentManagement"><CommentManagement /></ProtectedRoute>} />
        <Route path="/friend-links" element={<ProtectedRoute requiredPermission="friendLinkManagement"><FriendLinkManagement /></ProtectedRoute>} />
        <Route path="/banned-words" element={<ProtectedRoute requiredPermission="bannedWordManagement"><BannedWords /></ProtectedRoute>} />
        <Route path="/task-types" element={<ProtectedRoute requiredPermission="taskTypeManagement"><TaskTypeManagement /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute requiredPermission="announcementManagement"><AnnouncementManagement /></ProtectedRoute>} />
        <Route path="/task-center" element={<ProtectedRoute requiredPermission="taskCenter"><TaskCenterManagement /></ProtectedRoute>} />
        <Route path="/user-tasks" element={<ProtectedRoute requiredPermission="userTaskManagement"><UserTaskManagement /></ProtectedRoute>} />

        <Route path="/site-configs" element={<ProtectedRoute requiredPermission="siteConfig"><SiteConfig /></ProtectedRoute>} />
        <Route path="/advertisements" element={<ProtectedRoute requiredPermission="siteConfig"><AdvertisementManagement /></ProtectedRoute>} />
        <Route path="/check-ins" element={<ProtectedRoute requiredPermission="checkInManagement"><CheckInManagement /></ProtectedRoute>} />
        <Route path="/moon-centers" element={<ProtectedRoute requiredPermission="moonCenterManagement"><MoonCenterManagement /></ProtectedRoute>} />
        <Route path="/moon-point-requests" element={<ProtectedRoute requiredPermission="moonPointRequestManagement"><MoonPointRequestManagement /></ProtectedRoute>} />
        <Route path="/moon-point-rules" element={<ProtectedRoute requiredPermission="moonPointRuleManagement"><MoonPointRuleManagement /></ProtectedRoute>} />
        <Route path="/exp-management" element={<ProtectedRoute requiredPermission="expManagement"><ExpManagement /></ProtectedRoute>} />
        <Route path="/error-logs" element={<ProtectedRoute requiredPermission="errorLogManagement"><ErrorLogManagement /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute requiredPermission="labManagement"><LabManagement /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute requiredPermission="shopManagement"><ShopManagement /></ProtectedRoute>} />
        <Route path="/cdk" element={<ProtectedRoute requiredPermission="cdkManagement"><CDKManagement /></ProtectedRoute>} />
        <Route path="/file-storage" element={<ProtectedRoute requiredPermission="fileStorageManagement"><FileStorageManagement /></ProtectedRoute>} />
      </Routes>
    </AdminLayout>
  );
}
