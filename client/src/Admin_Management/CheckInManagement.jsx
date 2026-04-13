import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiUser, FiFilter, FiRefreshCw, FiMoreHorizontal, FiX } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckInManagement() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ date: '', userId: '' });
  const [stats, setStats] = useState({ todayCount: 0, thirtyDaysCount: 0, totalCount: 0 });
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCheckIns();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.date && { date: filters.date }),
        ...(filters.userId && { userId: filters.userId })
      });
      const response = await api.get(`/check-in/all?${params.toString()}`);
      const checkInsData = response.data?.checkIns || [];
      console.log('CheckIns data:', checkInsData);
      console.log('First check-in:', checkInsData[0]);
      // 手动确保每个用户对象都有uid字段
      const processedCheckIns = checkInsData.map(checkIn => {
        if (checkIn.user) {
          console.log('Original user data:', checkIn.user);
          // 确保user对象有uid字段
          checkIn.user.uid = checkIn.user.uid || checkIn.user.id;
          console.log('Processed user data:', checkIn.user);
        }
        console.log('CheckIn with total:', checkIn.id, checkIn.user_total_checkins);
        return checkIn;
      });
      setCheckIns(processedCheckIns);
      setPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      toast.error('获取打卡记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/check-in/stats');
      setStats(response.data);
    } catch (error) {
      console.error('获取打卡统计失败:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ date: '', userId: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getBrowserName = (userAgent) => {
    if (!userAgent) return '未知';
    
    if (userAgent.includes('Edg')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE';
    
    return '未知';
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">打卡记录管理</h2>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">今日打卡人数</p>
              <p className="text-3xl font-bold text-green-700">{stats.todayCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <FiCalendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">近30天打卡次数</p>
              <p className="text-3xl font-bold text-blue-700">{stats.thirtyDaysCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <FiCalendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">总打卡次数</p>
              <p className="text-3xl font-bold text-purple-700">{stats.totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <FiCalendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter size={18} className="text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">筛选条件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">打卡日期</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="请输入用户ID"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw size={16} className="mr-2" />
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 打卡记录列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow flex flex-col">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : checkIns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无打卡记录
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">打卡日期</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">打卡时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.map((checkIn) => (
                    <tr key={checkIn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        {checkIn.user && (
                          <div className="flex items-center space-x-3">
                            <img
                                src={(checkIn.user.avatar && checkIn.user.avatar.length > 0 && checkIn.user.avatar !== '/uploads/avatars/default.png') ? checkIn.user.avatar : '/moren.png'}
                                alt={checkIn.user.nickname || checkIn.user.username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/moren.png';
                                }}
                              />
                            <div>
                              <p className="font-medium text-gray-900">{checkIn.user.nickname || checkIn.user.username}</p>
                              <p className="text-sm text-gray-500">UID: {checkIn.user.uid || checkIn.user.id}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-700">{checkIn.check_in_date}</td>
                      <td className="py-4 px-4 text-gray-700">{formatDate(checkIn.check_in_time)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          checkIn.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {checkIn.status === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => {
                            console.log('Opening modal for checkIn:', checkIn);
                            setSelectedCheckIn(checkIn);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiMoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-6">
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
          </>
        )}
      </div>

      {/* 更多信息弹窗 */}
      {showModal && selectedCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">打卡详情</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* 用户信息 */}
              {selectedCheckIn.user && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img
                      src={(selectedCheckIn.user.avatar && selectedCheckIn.user.avatar.length > 0 && selectedCheckIn.user.avatar !== '/uploads/avatars/default.png') ? selectedCheckIn.user.avatar : '/moren.png'}
                      alt={selectedCheckIn.user.nickname || selectedCheckIn.user.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/moren.png';
                      }}
                    />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedCheckIn.user.nickname || selectedCheckIn.user.username}
                    </p>
                    <p className="text-sm text-gray-500">UID: {selectedCheckIn.user.uid || selectedCheckIn.user.id}</p>
                    <p className="text-sm text-gray-500">@{selectedCheckIn.user.username}</p>
                  </div>
                </div>
              )}

              {/* 打卡信息 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">打卡日期</span>
                  <span className="font-medium text-gray-900">{selectedCheckIn.check_in_date}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">打卡时间</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedCheckIn.check_in_time)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">打卡状态</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCheckIn.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedCheckIn.status === 'success' ? '成功' : '失败'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">获得经验值</span>
                  <span className="font-bold text-purple-600">+{selectedCheckIn.exp_earned || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">IP地址</span>
                  <span className="font-medium text-gray-900">{selectedCheckIn.ip_address || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">浏览器</span>
                  <span className="font-medium text-gray-900">{getBrowserName(selectedCheckIn.user_agent)}</span>
                </div>
                {selectedCheckIn.user && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">累计打卡天数</span>
                    <span className="font-bold text-orange-600">
                      {selectedCheckIn.user_total_checkins || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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
