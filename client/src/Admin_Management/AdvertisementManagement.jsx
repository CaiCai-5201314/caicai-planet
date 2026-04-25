import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiUpload, FiImage } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    position: 'community_sidebar',
    content: '',
    image_url: '',
    link_url: '',
    status: 'draft',
    start_time: '',
    end_time: '',
    priority: 0
  });
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const positions = [
    { value: 'community_sidebar', label: '社区侧边栏' }
  ];

  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'testing', label: '测试中' },
    { value: 'published', label: '已发布' }
  ];

  useEffect(() => {
    fetchAdvertisements();
  }, [filterPosition, filterStatus]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPosition) params.append('position', filterPosition);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await api.get(`/advertisements?${params.toString()}`);
      setAdvertisements(response.data.advertisements);
    } catch (error) {
      console.error('获取广告列表失败:', error);
      toast.error('获取广告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await api.put(`/advertisements/${editingAd.id}`, formData);
        toast.success('广告更新成功');
      } else {
        await api.post('/advertisements', formData);
        toast.success('广告创建成功');
      }
      setShowModal(false);
      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('保存广告失败:', error);
      toast.error('保存广告失败');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      position: ad.position,
      content: ad.content || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      status: ad.status,
      start_time: ad.start_time ? new Date(ad.start_time).toISOString().slice(0, 16) : '',
      end_time: ad.end_time ? new Date(ad.end_time).toISOString().slice(0, 16) : '',
      priority: ad.priority || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个广告吗？')) return;
    
    try {
      await api.delete(`/advertisements/${id}`);
      toast.success('广告删除成功');
      fetchAdvertisements();
    } catch (error) {
      console.error('删除广告失败:', error);
      toast.error('删除广告失败');
    }
  };

  const resetForm = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      position: 'community_sidebar',
      content: '',
      image_url: '',
      link_url: '',
      status: 'draft',
      start_time: '',
      end_time: '',
      priority: 0
    });
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/advertisements', formData);
      
      setFormData(prev => ({
        ...prev,
        image_url: response.data.url
      }));
      
      toast.success('图片上传成功');
    } catch (error) {
      console.error('上传图片失败:', error);
      toast.error('上传图片失败');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const filteredAdvertisements = advertisements.filter(ad =>
    ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ad.content && ad.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusText = (status) => {
    const option = statusOptions.find(o => o.value === status);
    return option ? option.label : status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'testing': return 'bg-yellow-100 text-yellow-700';
      case 'published': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPositionText = (position) => {
    const option = positions.find(o => o.value === position);
    return option ? option.label : position;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">广告位管理</h1>
            <p className="text-gray-600 mt-1">管理网站广告位内容</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 bg-planet-purple text-white px-6 py-3 rounded-xl font-medium hover:bg-planet-purple/90 transition-colors"
          >
            <FiPlus size={20} />
            <span>添加广告</span>
          </button>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索广告..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                />
              </div>
            </div>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
            >
              <option value="">所有位置</option>
              {positions.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
            >
              <option value="">所有状态</option>
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 广告列表 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
          </div>
        ) : filteredAdvertisements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无广告</h3>
            <p className="text-gray-600">点击上方按钮添加第一个广告</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAdvertisements.map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {ad.image_url && (
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={ad.image_url.startsWith('http') ? ad.image_url : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${ad.image_url}`}
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded-lg"

                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{ad.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.status)}`}>
                            {getStatusText(ad.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {getPositionText(ad.position)}
                          </span>
                          <span className="text-sm text-gray-500">
                            优先级: {ad.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            点击: {ad.clicks}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ad.link_url && (
                          <a
                            href={ad.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="预览链接"
                          >
                            <FiEye size={20} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-2 text-gray-400 hover:text-planet-purple rounded-lg hover:bg-planet-purple/10 transition-colors"
                          title="编辑"
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="删除"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                    {ad.content && (
                      <p className="text-gray-600 mb-4">{ad.content}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      创建时间: {new Date(ad.created_at).toLocaleString('zh-CN')}
                      {ad.start_time && (
                        <span className="ml-4">开始时间: {new Date(ad.start_time).toLocaleString('zh-CN')}</span>
                      )}
                      {ad.end_time && (
                        <span className="ml-4">结束时间: {new Date(ad.end_time).toLocaleString('zh-CN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加/编辑弹窗 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAd ? '编辑广告' : '添加广告'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    广告标题 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    placeholder="输入广告标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    广告位置 *
                  </label>
                  <select
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                  >
                    {positions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    广告内容
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none resize-none"
                    placeholder="输入广告内容（可选）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    图片
                  </label>
                  <div className="space-y-3">
                    {/* 图片预览 */}
                    {formData.image_url && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={formData.image_url.startsWith('http') ? formData.image_url : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${formData.image_url}`}
                            alt="广告图片"
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          移除图片
                        </button>
                      </div>
                    )}
                    
                    {/* 文件上传 */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder="输入图片URL（可选）"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          className="flex items-center space-x-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                          {uploading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-planet-purple" />
                          ) : (
                            <FiUpload size={18} />
                          )}
                          <span>上传</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    跳转链接
                  </label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    placeholder="输入跳转URL（可选）"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      状态
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      优先级
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      开始时间
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束时间
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-planet-purple text-white font-medium hover:bg-planet-purple/90 transition-colors"
                  >
                    {editingAd ? '保存修改' : '创建广告'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
