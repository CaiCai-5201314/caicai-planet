import { useState, useEffect } from 'react';
import { FiFilter, FiRefreshCw, FiX, FiCheck, FiX as FiReject, FiClock, FiUsers, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * 格式化月球分显示（小数点后1位）
 * @param {number} points - 月球分数值
 * @returns {string} 格式化后的字符串
 */
const formatMoonPoints = (points) => {
  const num = parseFloat(points) || 0;
  return num.toFixed(1);
};

export default function MoonPointRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '', reason_type: '' });
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: 'approved',
    note: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/moon-points/admin/requests?limit=10000');
      const allRequests = response.data?.requests || [];
      const totalRequests = allRequests.length;
      const pendingRequests = allRequests.filter(req => req.status === 'pending').length;
      const approvedRequests = allRequests.filter(req => req.status === 'approved').length;
      const rejectedRequests = allRequests.filter(req => req.status === 'rejected').length;
      
      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.reason_type && { reason_type: filters.reason_type })
      });
      const response = await api.get(`/moon-points/admin/requests?${params.toString()}`);
      setRequests(response.data?.requests || []);
      setPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('获取申请列表失败:', error);
      toast.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setFormData({ status: 'approved', note: '' });
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setFormData({ status: 'rejected', note: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/moon-points/admin/requests/${selectedRequest.id}/approve`, formData);
      toast.success(formData.status === 'approved' ? '审批通过' : '审批拒绝');
      setShowModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('审批失败:', error);
      toast.error(error.response?.data?.message || '审批失败');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '待审核' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: '已通过' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '已拒绝' }
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getReasonTypeLabel = (type) => {
    const typeMap = {
      'task_completion': '任务完成',
      'check_in': '签到',
      'activity': '活动',
      'admin': '管理员操作',
      'other': '其他'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">月球分审核中心</h2>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">总申请数</p>
                <p className="text-3xl font-bold text-purple-700">{stats.totalRequests}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <FiPlus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">待审核</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">已通过</p>
                <p className="text-3xl font-bold text-green-700">{stats.approvedRequests}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">已拒绝</p>
                <p className="text-3xl font-bold text-red-700">{stats.rejectedRequests}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <FiReject className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter className="text-gray-400" />
          <h3 className="font-semibold text-gray-700">筛选条件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">状态</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">类型</label>
            <select
              value={filters.reason_type}
              onChange={(e) => setFilters(prev => ({ ...prev, reason_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">全部类型</option>
              <option value="task_completion">任务完成</option>
              <option value="check_in">签到</option>
              <option value="activity">活动</option>
              <option value="admin">管理员操作</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: '', reason_type: '' });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 申请列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">月球分</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">原因</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">提交时间</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    暂无申请数据
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {request.user && (
                          <>
                            <img
                              src={(request.user.avatar && request.user.avatar.length > 0 && request.user.avatar !== '/uploads/avatars/default.png') ? request.user.avatar : '/moren.png'}
                              alt={request.user.nickname || request.user.username}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/moren.png';
                              }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{request.user.nickname || request.user.username}</p>
                              <p className="text-sm text-gray-500">@{request.user.username}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-bold text-purple-600">+{formatMoonPoints(request.points)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{request.reason}</td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiClock size={14} />
                        <span>{new Date(request.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(request)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <FiCheck size={14} />
                            <span>通过</span>
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <FiReject size={14} />
                            <span>拒绝</span>
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && request.approver && (
                        <div className="text-sm text-gray-500">
                          审核人: {request.approver.nickname || request.approver.username}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            共 {pagination.total || 0} 条记录，第 {pagination.page} / {pagination.totalPages || 1} 页
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages || 1, prev.page + 1) }))}
              disabled={pagination.page >= (pagination.totalPages || 1)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 审批弹窗 */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {formData.status === 'approved' ? '审批通过' : '审批拒绝'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
                {selectedRequest.user && (
                  <>
                    <img
                      src={(selectedRequest.user.avatar && selectedRequest.user.avatar.length > 0 && selectedRequest.user.avatar !== '/uploads/avatars/default.png') ? selectedRequest.user.avatar : '/moren.png'}
                      alt={selectedRequest.user.nickname || selectedRequest.user.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/moren.png';
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedRequest.user.nickname || selectedRequest.user.username}</p>
                      <p className="text-sm text-gray-500">申请月球分: <span className="font-bold text-purple-600">+{formatMoonPoints(selectedRequest.points)}</span></p>
                    </div>
                  </>
                )}
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">申请原因</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">审核备注</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入审核备注（可选）"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${
                      formData.status === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {formData.status === 'approved' ? <FiCheck /> : <FiReject />}
                    <span>确认{formData.status === 'approved' ? '通过' : '拒绝'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
