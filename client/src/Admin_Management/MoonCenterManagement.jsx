import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiRefreshCw, FiX, FiSave, FiUsers, FiMinus, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoonPoints } from '../utils/format';

export default function MoonPointsManagement() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    points: '',
    reason: ''
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
    fetchStats();
  }, [activeTab, pagination.page, logsPagination.page, search]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/moon-points/admin/users?limit=10000');
      const allUsers = response.data?.users || [];
      const totalUsers = allUsers.length;
      const totalPoints = allUsers.reduce((sum, user) => sum + user.moon_points, 0);
      const activeUsers = allUsers.filter(user => user.moon_points > 0).length;
      
      setStats({
        totalUsers,
        totalPoints,
        activeUsers,
        avgPoints: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { search })
      });
      const response = await api.get(`/moon-points/admin/users?${params.toString()}`);
      setUsers(response.data?.users || []);
      setPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams({
        page: logsPagination.page,
        limit: logsPagination.limit
      });
      const response = await api.get(`/moon-points/admin/logs?${params.toString()}`);
      setLogs(response.data?.logs || []);
      setLogsPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('获取记录失败:', error);
      toast.error('获取记录失败');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAddPoints = (user) => {
    setSelectedUser(user);
    setModalType('add');
    setFormData({ points: '', reason: '' });
    setShowModal(true);
  };

  const handleReducePoints = (user) => {
    setSelectedUser(user);
    setModalType('reduce');
    setFormData({ points: '', reason: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = modalType === 'add' 
        ? '/moon-points/admin/add' 
        : '/moon-points/admin/reduce';
      
      await api.post(endpoint, {
        user_id: selectedUser.id,
        points: parseInt(formData.points),
        reason: formData.reason,
        reason_type: 'admin'
      });
      
      toast.success(modalType === 'add' ? '发放成功' : '扣除成功');
      setShowModal(false);
      fetchUsers();
      fetchStats();
      if (activeTab === 'logs') {
        fetchLogs();
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(error.response?.data?.message || '操作失败');
    }
  };

  const getReasonTypeLabel = (type) => {
    const typeMap = {
      'task_completion': '系统发放',
      'check_in': '系统发放',
      'activity': '系统发放',
      'admin': '管理员操作',
      'other': '其他',
      'create_post': '系统发放',
      'share_post': '系统发放',
      'invite': '系统发放'
    };
    return typeMap[type] || '系统发放';
  };

  const getPointsColor = (points) => {
    return points > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPointsIcon = (points) => {
    return points > 0 ? <FiArrowUp /> : <FiArrowDown />;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">月球分管理</h2>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">总用户数</p>
                <p className="text-3xl font-bold text-purple-700">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">月球分总量</p>
                <p className="text-3xl font-bold text-green-700">{formatMoonPoints(stats.totalPoints)}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <FiPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">活跃用户</p>
                <p className="text-3xl font-bold text-blue-700">{stats.activeUsers}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">平均月球分</p>
                <p className="text-3xl font-bold text-orange-700">{formatMoonPoints(stats.avgPoints)}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <FiPlus className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab切换 */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          用户列表
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'logs'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          发放记录
        </button>
      </div>

      {/* 用户列表 */}
      {activeTab === 'users' && (
        <>
          {/* 搜索栏 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FiSearch className="text-gray-400" />
              <h3 className="font-semibold text-gray-700">搜索用户</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="搜索用户名、昵称或UID..."
                />
              </div>
              <button
                onClick={fetchUsers}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiSearch />
                <span>搜索</span>
              </button>
              <button
                onClick={() => {
                  setSearch('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiRefreshCw />
                <span>重置</span>
              </button>
            </div>
          </div>

          {/* 用户列表 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">用户</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">UID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">月球分</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">注册时间</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        暂无用户数据
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={(user.avatar && user.avatar.length > 0 && user.avatar !== '/uploads/avatars/default.png') ? user.avatar : '/moren.png'}
                              alt={user.nickname || user.username}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = '/moren.png';
                              }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{user.nickname || user.username}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-mono">{user.uid}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xl font-bold ${user.moon_points > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                            {formatMoonPoints(user.moon_points)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FiClock size={14} />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddPoints(user)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <FiPlus size={14} />
                              <span>发放</span>
                            </button>
                            <button
                              onClick={() => handleReducePoints(user)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <FiMinus size={14} />
                              <span>扣除</span>
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
        </>
      )}

      {/* 发放记录 */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">变化</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">原因</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">时间</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {logsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      暂无记录
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {log.user && (
                            <>
                              <img
                                src={(log.user.avatar && log.user.avatar.length > 0 && log.user.avatar !== '/uploads/avatars/default.png') ? log.user.avatar : '/moren.png'}
                                alt={log.user.nickname || log.user.username}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/moren.png';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{log.user.nickname || log.user.username}</p>
                                <p className="text-sm text-gray-500">@{log.user.username}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center space-x-1 text-lg font-bold ${getPointsColor(log.points)}`}>
                          {getPointsIcon(log.points)}
                          <span>{log.points > 0 ? `+${formatMoonPoints(log.points)}` : formatMoonPoints(log.points)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{log.reason}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {getReasonTypeLabel(log.reason_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiClock size={14} />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
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
              共 {logsPagination.total || 0} 条记录，第 {logsPagination.page} / {logsPagination.totalPages || 1} 页
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setLogsPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={logsPagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                onClick={() => setLogsPagination(prev => ({ ...prev, page: Math.min(prev.totalPages || 1, prev.page + 1) }))}
                disabled={logsPagination.page >= (logsPagination.totalPages || 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 发放/扣除弹窗 */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'add' ? '发放月球分' : '扣除月球分'}
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
                <img
                  src={(selectedUser.avatar && selectedUser.avatar.length > 0 && selectedUser.avatar !== '/uploads/avatars/default.png') ? selectedUser.avatar : '/moren.png'}
                  alt={selectedUser.nickname || selectedUser.username}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/moren.png';
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.nickname || selectedUser.username}</p>
                  <p className="text-sm text-gray-500">当前月球分: <span className="font-bold text-purple-600">{formatMoonPoints(selectedUser.moon_points)}</span></p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {modalType === 'add' ? '发放数量' : '扣除数量'} *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入数量"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">原因 *</label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入原因"
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
                      modalType === 'add' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    <FiSave />
                    <span>确认{modalType === 'add' ? '发放' : '扣除'}</span>
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
