import { useState, useEffect } from 'react';
import { FiAlertCircle, FiTrash2, FiCheck, FiFilter, FiDownload, FiBarChart2, FiClock, FiUser, FiGlobe, FiCpu } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

function ErrorLogManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchErrorLogs();
    fetchErrorStats();
  }, [currentPage, typeFilter, severityFilter, searchTerm]);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (typeFilter) params.append('type', typeFilter);
      if (severityFilter) params.append('severity', severityFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/error/logs?${params.toString()}`);
      console.log('获取错误日志成功:', response.data);
      setLogs(response.data?.data?.logs || []);
      setTotalPages(response.data?.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('获取错误日志失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误响应数据:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('请先登录');
        // 重定向到登录页面
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else if (error.response?.status === 403) {
        toast.error('需要管理员权限');
      } else {
        toast.error(`获取错误日志失败: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorStats = async () => {
    try {
      setStatsLoading(true);
      const response = await api.get('/error/statistics');
      console.log('获取错误统计成功:', response.data);
      setStats(response.data?.data);
    } catch (error) {
      console.error('获取错误统计失败:', error);
      console.error('错误响应:', error.response);
      if (error.response?.status === 401) {
        toast.error('请先登录');
        // 重定向到登录页面
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } else if (error.response?.status === 403) {
        toast.error('需要管理员权限');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const response = await api.post('/error/logs/clear', {
        type: typeFilter,
        severity: severityFilter
      });
      toast.success(response.data?.message || '错误日志清除成功');
      setShowClearModal(false);
      fetchErrorLogs();
      fetchErrorStats();
    } catch (error) {
      console.error('清除错误日志失败:', error);
      toast.error('清除错误日志失败');
    }
  };

  const handleMarkAsHandled = async (id) => {
    try {
      await api.patch(`/error/logs/${id}/handled`);
      toast.success('错误已标记为已处理');
      fetchErrorLogs();
    } catch (error) {
      console.error('标记错误为已处理失败:', error);
      toast.error('标记错误为已处理失败');
    }
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const severityColorMap = {
    critical: 'bg-red-100 text-red-700',
    error: 'bg-orange-100 text-orange-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700'
  };

  const severityTextMap = {
    critical: '严重',
    error: '错误',
    warning: '警告',
    info: '信息'
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">错误日志管理</h2>
        <button
          onClick={() => setShowClearModal(true)}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
        >
          <FiTrash2 />
          <span>清除日志</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总错误数</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.bySeverity?.find(s => s.severity === 'error')?.count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <FiBarChart2 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">严重错误</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.bySeverity?.find(s => s.severity === 'critical')?.count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日错误</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.daily?.[0]?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">错误类型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">所有类型</option>
              {stats?.byType?.map(stat => (
                <option key={stat.type} value={stat.type}>
                  {stat.type} ({stat.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">严重程度</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">所有严重程度</option>
              {stats?.bySeverity?.map(stat => (
                <option key={stat.severity} value={stat.severity}>
                  {severityTextMap[stat.severity] || stat.severity} ({stat.count})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              placeholder="搜索错误信息..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
        </div>
      </div>

      {/* 错误日志列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow flex flex-col">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无错误日志
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => openDetailModal(log)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColorMap[log.severity] || 'bg-gray-100 text-gray-700'}`}>
                        {severityTextMap[log.severity] || log.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.type}</span>
                      <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-gray-700 mb-3 line-clamp-2">
                      {log.message}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {log.url && (
                        <div className="flex items-center space-x-1">
                          <FiGlobe size={12} />
                          <span className="line-clamp-1 max-w-xs">{log.url}</span>
                        </div>
                      )}
                      {log.user_id && (
                        <div className="flex items-center space-x-1">
                          <FiUser size={12} />
                          <span>用户 ID: {log.user_id}</span>
                        </div>
                      )}
                      {log.context?.location?.file && (
                        <div className="flex items-center space-x-1">
                          <FiCpu size={12} />
                          <span className="line-clamp-1 max-w-xs">
                            {log.context.location.file}:{log.context.location.line}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsHandled(log.id);
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                    >
                      <FiCheck size={12} />
                      <span>标记已处理</span>
                    </button>
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

      {/* 错误详情模态框 */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">错误详情</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">错误类型</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">{selectedLog.type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">严重程度</label>
                  <div className={`px-4 py-2 rounded-lg ${severityColorMap[selectedLog.severity] || 'bg-gray-50'}`}>
                    {severityTextMap[selectedLog.severity] || selectedLog.severity}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">错误信息</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">{selectedLog.message}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发生时间</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">{new Date(selectedLog.created_at).toLocaleString()}</div>
                </div>
                {selectedLog.url && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">请求URL</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg break-all">{selectedLog.url}</div>
                  </div>
                )}
                {selectedLog.user_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">{selectedLog.user_id}</div>
                  </div>
                )}
                {selectedLog.environment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">环境</label>
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">{selectedLog.environment}</div>
                  </div>
                )}
              </div>
              
              {selectedLog.chinese_description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">中文说明</label>
                  <div className="px-4 py-2 bg-blue-50 rounded-lg">{selectedLog.chinese_description}</div>
                </div>
              )}
              
              {selectedLog.troubleshooting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">故障排除建议</label>
                  <div className="px-4 py-2 bg-green-50 rounded-lg">{selectedLog.troubleshooting}</div>
                </div>
              )}
              
              {selectedLog.stack && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">错误堆栈</label>
                  <div className="px-4 py-2 bg-gray-900 text-gray-100 rounded-lg font-mono text-xs overflow-auto max-h-64">
                    {selectedLog.stack}
                  </div>
                </div>
              )}
              
              {selectedLog.context && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">上下文信息</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg font-mono text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </div>
                </div>
              )}
              
              {selectedLog.device_info && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">设备信息</label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg font-mono text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.device_info, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 清除日志模态框 */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">清除错误日志</h3>
            <p className="text-gray-600 mb-6">
              确定要清除当前筛选条件下的所有错误日志吗？此操作不可恢复。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确定清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorLogManagement;