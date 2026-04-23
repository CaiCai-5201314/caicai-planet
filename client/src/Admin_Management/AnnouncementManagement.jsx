import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiEye } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    level: 'light'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/announcements?page=${currentPage}&limit=20`);
      setAnnouncements(response.data?.announcements || response.data?.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取公告列表失败:', error);
      toast.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast.error('标题和内容不能为空');
        return;
      }

      const response = await api.post('/admin/announcements', formData);
      toast.success('公告创建成功');
      setShowCreateModal(false);
      setFormData({ title: '', content: '', level: 'light' });
      fetchAnnouncements();
    } catch (error) {
      console.error('创建公告失败:', error);
      toast.error('创建公告失败');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast.error('标题和内容不能为空');
        return;
      }

      const response = await api.put(`/admin/announcements/${editing}`, formData);
      toast.success('公告更新成功');
      setEditing(null);
      setFormData({ title: '', content: '', level: 'light' });
      fetchAnnouncements();
    } catch (error) {
      console.error('更新公告失败:', error);
      toast.error('更新公告失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条公告吗？')) {
      try {
        await api.delete(`/admin/announcements/${id}`);
        toast.success('公告删除成功');
        fetchAnnouncements();
      } catch (error) {
        console.error('删除公告失败:', error);
        toast.error('删除公告失败');
      }
    }
  };

  const handleEdit = (announcement) => {
    setEditing(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      level: announcement.level
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setShowCreateModal(false);
    setFormData({ title: '', content: '', level: 'light' });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900">公告管理</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors text-sm"
          >
            <FiPlus size={16} />
            <span>创建公告</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FiPlus size={16} />
            <span>下一期公告</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">级别</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.level === 'heavy' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {announcement.level === 'heavy' ? '重度' : '轻度'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${announcement.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {announcement.status === 'active' ? '活跃' : '已停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {format(new Date(announcement.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
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
        
        {/* 分页 */}
        {!loading && (
          <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-center mt-auto">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
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
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* 创建/编辑模态框 */}
      {(showCreateModal || editing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">
                {editing ? '编辑公告' : '创建公告'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-planet-purple focus:border-planet-purple outline-none"
                  placeholder="请输入公告标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <ReactQuill
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  placeholder="请输入公告内容（支持富文本格式）"
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-planet-purple focus:border-planet-purple outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  级别
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-planet-purple focus:border-planet-purple outline-none"
                >
                  <option value="light">轻度</option>
                  <option value="heavy">重度</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 flex-shrink-0">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={editing ? handleUpdate : handleCreate}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}