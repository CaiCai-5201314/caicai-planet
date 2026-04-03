import { useState, useEffect } from 'react';
import { 
  FiAlertCircle, FiEdit2, FiTrash2, FiPlus, FiClock, FiSave, FiX, FiCheck,
  FiAlertTriangle, FiSearch, FiFilter, FiRefreshCw, FiBarChart2, FiList,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ErrorManagement = () => {
  // 标签页状态
  const [activeTab, setActiveTab] = useState('types'); // 'types' 或 'logs'
  
  // ========== 错误类型管理状态 ==========
  const [errorTypes, setErrorTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [currentErrorType, setCurrentErrorType] = useState(null);
  const [currentVersions, setCurrentVersions] = useState([]);
  const [newErrorType, setNewErrorType] = useState({
    error_code: '',
    error_name: '',
    error_description: '',
    solution: '',
    category: 'general',
    severity: 'medium',
    http_status: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // ========== 错误日志状态 ==========
  const [errors, setErrors] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    if (activeTab === 'types') {
      fetchErrorTypes();
      fetchCategories();
    } else {
      fetchErrors();
      fetchStats();
    }
  }, [activeTab, searchTerm, categoryFilter, severityFilter, filters]);

  // ========== 错误类型管理函数 ==========
  const fetchErrorTypes = async () => {
    try {
      setLoadingTypes(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (severityFilter) params.append('severity', severityFilter);
      const response = await api.get(`/admin/error-types?${params.toString()}`);
      setErrorTypes(response.data.errorTypes);
    } catch (error) {
      console.error('获取错误类型列表失败:', error);
      toast.error('获取错误类型列表失败');
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/error-type-categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('获取错误类型分类失败:', error);
    }
  };

  const handleAddErrorType = async () => {
    if (!newErrorType.error_code || !newErrorType.error_name || !newErrorType.error_description) {
      toast.error('请填写完整的错误类型信息');
      return;
    }
    try {
      await api.post('/admin/error-types', newErrorType);
      toast.success('创建错误类型成功');
      setShowAddModal(false);
      setNewErrorType({
        error_code: '',
        error_name: '',
        error_description: '',
        solution: '',
        category: 'general',
        severity: 'medium',
        http_status: null
      });
      fetchErrorTypes();
    } catch (error) {
      console.error('创建错误类型失败:', error);
      toast.error('创建错误类型失败');
    }
  };

  const handleEditErrorType = async () => {
    if (!currentErrorType.error_code || !currentErrorType.error_name || !currentErrorType.error_description) {
      toast.error('请填写完整的错误类型信息');
      return;
    }
    try {
      await api.put(`/admin/error-types/${currentErrorType.id}`, currentErrorType);
      toast.success('更新错误类型成功');
      setShowEditModal(false);
      setCurrentErrorType(null);
      fetchErrorTypes();
    } catch (error) {
      console.error('更新错误类型失败:', error);
      toast.error('更新错误类型失败');
    }
  };

  const handleDeleteErrorType = async (id) => {
    if (window.confirm('确定要删除这个错误类型吗？')) {
      try {
        await api.delete(`/admin/error-types/${id}`);
        toast.success('删除错误类型成功');
        fetchErrorTypes();
      } catch (error) {
        console.error('删除错误类型失败:', error);
        toast.error('删除错误类型失败');
      }
    }
  };

  const handleViewVersions = async (id) => {
    try {
      const response = await api.get(`/admin/error-types/${id}/versions`);
      setCurrentVersions(response.data.versions);
      setShowVersionsModal(true);
    } catch (error) {
      console.error('获取版本历史失败:', error);
      toast.error('获取版本历史失败');
    }
  };

  // ========== 错误日志函数 ==========
  const fetchErrors = async () => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/error/list?${params.toString()}`);
      setErrors(response.data.data.errors);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('获取错误列表失败');
      console.error('Error fetching errors:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/error/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const clearError = async (errorId) => {
    if (window.confirm('确定要清除这个错误吗？')) {
      try {
        await api.delete(`/error/${errorId}`);
        toast.success('错误已清除');
        fetchErrors();
      } catch (error) {
        toast.error('清除错误失败');
      }
    }
  };

  const clearAllErrors = async () => {
    if (window.confirm('确定要清除所有错误吗？')) {
      try {
        await api.delete('/error/clear/all');
        toast.success('所有错误已清除');
        fetchErrors();
        fetchStats();
      } catch (error) {
        toast.error('清除所有错误失败');
      }
    }
  };

  // ========== 辅助函数 ==========
  const severityMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  };

  const severityColorMap = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const severityOptions = [
    { value: '', label: '所有级别' },
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '严重' }
  ];

  const categoryOptions = [
    { value: '', label: '所有分类' },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和标签切换 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">错误管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理系统错误类型和查看错误日志</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'types'
                ? 'bg-white text-planet-purple shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiAlertCircle size={18} />
            <span>错误类型</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-planet-purple shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiAlertTriangle size={18} />
            <span>错误日志</span>
          </button>
        </div>
      </div>

      {/* ========== 错误类型管理内容 ========== */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors flex items-center"
            >
              <FiPlus className="mr-2" />
              添加错误类型
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="搜索错误类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {severityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingTypes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
              </div>
            ) : errorTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无错误类型
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">错误代码</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">错误名称</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">级别</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">HTTP状态</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorTypes.map((errorType) => (
                      <tr key={errorType.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{errorType.error_code}</td>
                        <td className="py-3 px-4 text-gray-900">{errorType.error_name}</td>
                        <td className="py-3 px-4 text-gray-600">{errorType.category}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColorMap[errorType.severity]}`}>
                            {severityMap[errorType.severity]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{errorType.http_status || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setCurrentErrorType({ ...errorType });
                                setShowEditModal(true);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleViewVersions(errorType.id)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="版本历史"
                            >
                              <FiClock size={18} />
                            </button>
                            {errorType.is_custom && (
                              <button
                                onClick={() => handleDeleteErrorType(errorType.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="删除"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 错误日志内容 ========== */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">总错误数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalErrors}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FiAlertTriangle size={24} className="text-red-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">24小时内</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentErrors}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiBarChart2 size={24} className="text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">错误类型</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.typeStats?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiFilter size={24} className="text-purple-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">严重级别</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.severityStats?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FiAlertTriangle size={24} className="text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchErrors}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
              >
                <FiRefreshCw size={16} />
                <span>刷新</span>
              </button>
            </div>
            <button
              onClick={clearAllErrors}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-600"
            >
              <FiTrash2 size={16} />
              <span>清除所有</span>
            </button>
          </div>

          {/* 筛选器 */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">筛选器</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiFilter size={20} />
              </button>
            </div>
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">错误类型</label>
                  <input
                    type="text"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="如：javascript"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">严重级别</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="">全部</option>
                    <option value="error">错误</option>
                    <option value="warning">警告</option>
                    <option value="info">信息</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                      placeholder="搜索错误消息或URL"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 错误列表 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      错误类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      消息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      严重级别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发生次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最后发生
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple mx-auto" />
                        <p className="mt-2 text-gray-600">加载中...</p>
                      </td>
                    </tr>
                  ) : errors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="text-gray-400 mb-2">
                          <FiAlertTriangle size={48} />
                        </div>
                        <p className="text-gray-600">暂无错误记录</p>
                      </td>
                    </tr>
                  ) : (
                    errors.map((error) => (
                      <tr key={error.error_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <FiAlertTriangle size={16} className="text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">{error.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <p className="text-sm text-gray-900 truncate" title={error.message}>
                              {error.message}
                            </p>
                            {error.url && (
                              <p className="text-xs text-gray-500 mt-1 truncate" title={error.url}>
                                {error.url}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.severity)} text-white`}>
                            {error.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{error.count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(error.last_seen).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => clearError(error.error_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="清除"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {!loadingLogs && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  显示 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 条
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <FiChevronLeft size={16} className="mr-1" />
                    上一页
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page + 1) })}
                    disabled={filters.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    下一页
                    <FiChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 添加错误类型模态框 ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">添加错误类型</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误代码 *</label>
                <input
                  type="text"
                  value={newErrorType.error_code}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="例如: ERROR_404"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误名称 *</label>
                <input
                  type="text"
                  value={newErrorType.error_name}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="例如: 资源未找到"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误描述 *</label>
                <textarea
                  value={newErrorType.error_description}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="详细描述错误情况..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">解决方案</label>
                <textarea
                  value={newErrorType.solution}
                  onChange={(e) => setNewErrorType({ ...newErrorType, solution: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="建议的解决方案..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={newErrorType.category}
                    onChange={(e) => setNewErrorType({ ...newErrorType, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="general">通用</option>
                    <option value="authentication">认证</option>
                    <option value="authorization">授权</option>
                    <option value="database">数据库</option>
                    <option value="network">网络</option>
                    <option value="validation">验证</option>
                    <option value="system">系统</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">级别</label>
                  <select
                    value={newErrorType.severity}
                    onChange={(e) => setNewErrorType({ ...newErrorType, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="critical">严重</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTTP状态码</label>
                  <input
                    type="number"
                    value={newErrorType.http_status || ''}
                    onChange={(e) => setNewErrorType({ ...newErrorType, http_status: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="例如: 404"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddErrorType}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 编辑错误类型模态框 ========== */}
      {showEditModal && currentErrorType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑错误类型</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误代码 *</label>
                <input
                  type="text"
                  value={currentErrorType.error_code}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误名称 *</label>
                <input
                  type="text"
                  value={currentErrorType.error_name}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误描述 *</label>
                <textarea
                  value={currentErrorType.error_description}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">解决方案</label>
                <textarea
                  value={currentErrorType.solution || ''}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, solution: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={currentErrorType.category}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="general">通用</option>
                    <option value="authentication">认证</option>
                    <option value="authorization">授权</option>
                    <option value="database">数据库</option>
                    <option value="network">网络</option>
                    <option value="validation">验证</option>
                    <option value="system">系统</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">级别</label>
                  <select
                    value={currentErrorType.severity}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="critical">严重</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTTP状态码</label>
                  <input
                    type="number"
                    value={currentErrorType.http_status || ''}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, http_status: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">修改说明</label>
                <input
                  type="text"
                  value={currentErrorType.change_note || ''}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, change_note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="描述本次修改的内容..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditErrorType}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 版本历史模态框 ========== */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">版本历史</h3>
              <button onClick={() => setShowVersionsModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {currentVersions.length === 0 ? (
                <p className="text-center py-4 text-gray-500">暂无版本历史</p>
              ) : (
                <div className="space-y-4">
                  {currentVersions.map((version) => (
                    <div key={version.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">版本 {version.version}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>错误代码:</strong> {version.error_code}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>错误名称:</strong> {version.error_name}
                      </div>
                      {version.change_note && (
                        <div className="text-sm text-gray-600">
                          <strong>修改说明:</strong> {version.change_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorManagement;