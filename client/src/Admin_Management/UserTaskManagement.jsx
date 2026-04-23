import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiTrash2, FiUser, FiTarget, FiCalendar, FiAward } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UserTaskManagement() {
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchUserTasks();
  }, [currentPage, statusFilter]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/admin/user-tasks?${params.toString()}`);
      setUserTasks(response.data?.userTasks || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取用户任务列表失败:', error);
      toast.error('获取用户任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/admin/user-tasks/${taskId}/status`, { status });
      toast.success('任务状态更新成功');
      fetchUserTasks();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('确定要删除这条用户任务记录吗？')) {
      try {
        await api.delete(`/admin/user-tasks/${taskId}`);
        toast.success('删除成功');
        fetchUserTasks();
      } catch (error) {
        console.error('删除用户任务失败:', error);
        toast.error('删除失败');
      }
    }
  };

  const filteredTasks = userTasks.filter(task => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      task.user?.username?.toLowerCase().includes(searchLower) ||
      task.user?.nickname?.toLowerCase().includes(searchLower) ||
      task.task?.title?.toLowerCase().includes(searchLower)
    );
  });

  const statusMap = {
    accepted: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' }
  };

  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">用户任务管理</h2>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiTarget className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {userTasks.filter(t => t.status === 'accepted').length}
              </div>
              <div className="text-sm text-gray-500">进行中</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {userTasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">已完成</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <FiXCircle className="text-gray-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {userTasks.filter(t => t.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-500">已取消</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiUser className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(userTasks.map(t => t.user_id)).size}
              </div>
              <div className="text-sm text-gray-500">参与用户</div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索用户或任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">所有状态</option>
              <option value="accepted">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="text-right text-sm text-gray-500">
            共 {filteredTasks.length} 条记录
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p>暂无用户任务记录</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">用户</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">任务</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">奖励</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">接受时间</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((userTask) => (
                  <tr key={userTask.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={(userTask.user?.avatar && userTask.user.avatar.length > 0 && userTask.user.avatar !== '/uploads/avatars/default.png') ? userTask.user.avatar : '/moren.png'}
                          alt={userTask.user?.nickname || userTask.user?.username}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/moren.png';
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {userTask.user?.nickname || userTask.user?.username}
                          </div>
                          <div className="text-sm text-gray-500">@{userTask.user?.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {userTask.task?.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          难度: {difficultyMap[userTask.task?.difficulty] || '未知'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMap[userTask.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusMap[userTask.status]?.label || userTask.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <FiAward className="mr-1 text-yellow-500" size={16} />
                        {userTask.task?.reward || 0} 积分
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(userTask.acceptedAt || userTask.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {userTask.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(userTask.id, 'completed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="标记为完成"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(userTask.id, 'cancelled')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="标记为取消"
                            >
                              <FiXCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(userTask.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除记录"
                        >
                          <FiTrash2 size={18} />
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
    </div>
  );
}
