import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiSearch, FiFilter, FiTrash2, FiRefreshCw, FiDownload, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-hot-toast';

function ErrorLogs() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [filters]);

  const fetchErrors = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getErrorTypeIcon = (type) => {
    if (type.includes('javascript')) return 'FiCode';
    if (type.includes('api')) return 'FiServer';
    if (type.includes('resource')) return 'FiDownload';
    if (type.includes('promise')) return 'FiGitBranch';
    return 'FiAlertTriangle';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiAlertTriangle className="mr-2 text-red-500" />
            错误日志管理
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchErrors}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
            >
              <FiRefreshCw size={16} />
              <span>刷新</span>
            </button>
            <button
              onClick={clearAllErrors}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center space-x-2 hover:bg-red-600"
            >
              <FiTrash2 size={16} />
              <span>清除所有</span>
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">筛选器</h2>
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
                {loading ? (
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => clearError(error.error_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="清除"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                显示 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 条
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page + 1) })}
                  disabled={filters.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-200 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorLogs;
