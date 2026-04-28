import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX, FiCheck, FiClock } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

function AuthorizationManagement() {
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [deleteAccountName, setDeleteAccountName] = useState('');
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // 权限选项配置 - 按功能分组
  const permissionGroups = [
    {
      label: '基础功能',
      permissions: [
        { key: 'dashboard', label: '仪表盘' }
      ]
    },
    {
      label: '用户与星球广场',
      permissions: [
        { key: 'userManagement', label: '用户管理' },
        { key: 'postManagement', label: '文章管理' },
        { key: 'commentManagement', label: '评论管理' },
        { key: 'friendLinkManagement', label: '星际传送门管理' },
        { key: 'bannedWordManagement', label: '违禁词管理' }
      ]
    },
    {
      label: '任务系统',
      permissions: [
        { key: 'taskTypeManagement', label: '任务类型管理' },
        { key: 'taskCenter', label: '任务中心管理' },
        { key: 'userTaskManagement', label: '用户任务管理' }
      ]
    },
    {
      label: '月球分与经验',
      permissions: [
        { key: 'checkInManagement', label: '打卡记录管理' },
        { key: 'moonCenterManagement', label: '月球中心管理' },
        { key: 'moonPointRequestManagement', label: '月球分申请管理' },
        { key: 'moonPointRuleManagement', label: '月球分规则管理' },
        { key: 'expManagement', label: '经验值管理' }
      ]
    },
    {
      label: '其他管理',
      permissions: [
        { key: 'announcementManagement', label: '公告管理' },
        { key: 'errorManagement', label: '错误管理' },
        { key: 'siteConfig', label: '网站配置' },
        { key: 'authorization', label: '授权中心' }
      ]
    }
  ];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nickname: '',
    permissions: { taskCenter: true }
  });
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  
  // 从authStore中获取token
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSubAccounts();
  }, [currentPage]);

  const fetchSubAccounts = async () => {
    try {
      setLoading(true);
      console.log('开始获取子权限账号列表...');
      console.log('API基础URL:', api.defaults.baseURL);
      
      // 检查localStorage中的token
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      if (!token) {
        console.error('没有找到token，需要重新登录');
        toast.error('请重新登录');
        setLoading(false);
        return;
      }
      
      // 使用正确的API路径
      console.log('API路径:', '/authorization/sub-accounts');
      
      // 手动设置请求头
      const response = await api.get(`/authorization/sub-accounts?page=${currentPage}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('获取子权限账号列表成功:', response.data);
      setSubAccounts(response.data.subAccounts || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取子权限账号列表失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      toast.error('获取子权限账号列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    // 只有当邮箱格式基本正确时才检查
    if (email.includes('@')) {
      setCheckingEmail(true);
      try {
        // 检查token
        const token = localStorage.getItem('token');
        if (!token) {
          setCheckingEmail(false);
          return;
        }

        // 调用API检查用户是否存在
        const response = await api.get(`/admin/users?search=${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.users && response.data.users.length > 0) {
          const existingUser = response.data.users.find(user => user.email === email);
          if (existingUser) {
            // 自动填充用户名和昵称
            setFormData(prev => ({
              ...prev,
              username: existingUser.username,
              nickname: existingUser.nickname || existingUser.username
            }));
            // 标记为已存在用户
            setIsExistingUser(true);
            // 显示提示信息
            toast.success('找到用户，将授权该用户为子权限账号');
          } else {
            setIsExistingUser(false);
            toast.error('未查到该账号');
          }
        } else {
          setIsExistingUser(false);
          toast.error('未查到该账号');
        }
      } catch (error) {
        console.error('检查邮箱失败:', error);
        setIsExistingUser(false);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleAddAccount = async () => {
    if (!formData.username || !formData.email) {
      toast.error('用户名和邮箱不能为空');
      return;
    }

    // 只有新用户才需要密码
    if (!isExistingUser && !formData.password) {
      toast.error('新用户需要设置密码');
      return;
    }

    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('没有找到token，需要重新登录');
      toast.error('请重新登录');
      return;
    }

    try {
      // 手动设置请求头
      const response = await api.post('/authorization/sub-accounts', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('操作成功:', response.data);
      toast.success(response.data.message || '子权限账号操作成功');
      setShowAddModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        nickname: '',
        permissions: { taskCenter: true }
      });
      setIsExistingUser(false);
      fetchSubAccounts();
    } catch (error) {
      console.error('操作失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      const errorMessage = error.response?.data?.message || '操作失败';
      toast.error(errorMessage);
    }
  };

  const handleEditAccount = async () => {
    if (!currentAccount) return;

    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('没有找到token，需要重新登录');
      toast.error('请重新登录');
      return;
    }

    try {
      // 手动设置请求头
      console.log('更新子权限账号:', formData);
      const response = await api.put(`/authorization/sub-accounts/${currentAccount.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('更新成功:', response.data);
      toast.success('子权限账号更新成功');
      setShowEditModal(false);
      setCurrentAccount(null);
      fetchSubAccounts();
    } catch (error) {
      console.error('更新子权限账号失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      const errorMessage = error.response?.data?.message || '更新子权限账号失败';
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = (id, username) => {
    setDeleteAccountId(id);
    setDeleteAccountName(username);
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deleteAccountId) return;

    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('没有找到token，需要重新登录');
      toast.error('请重新登录');
      return;
    }

    try {
      // 手动设置请求头
      await api.delete(`/authorization/sub-accounts/${deleteAccountId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('子权限账号已降级为普通用户');
      setShowDeleteModal(false);
      setDeleteAccountId(null);
      setDeleteAccountName('');
      fetchSubAccounts();
    } catch (error) {
      console.error('删除子权限账号失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      const errorMessage = error.response?.data?.message || '删除子权限账号失败';
      toast.error(errorMessage);
    }
  };

  const handleViewLogs = async (id) => {
    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('没有找到token，需要重新登录');
      toast.error('请重新登录');
      return;
    }

    try {
      // 手动设置请求头
      const response = await api.get(`/authorization/sub-accounts/${id}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLogs(response.data.logs);
      setShowLogsModal(true);
    } catch (error) {
      console.error('获取操作日志失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      const errorMessage = error.response?.data?.message || '获取操作日志失败';
      toast.error(errorMessage);
    }
  };

  const openEditModal = (account) => {
    setCurrentAccount(account);
    // 确保权限对象包含所有权限选项
    const allPermissions = permissionGroups.flatMap(group => group.permissions);
    const permissions = allPermissions.reduce((acc, option) => {
      acc[option.key] = account.permissions?.[option.key] || false;
      return acc;
    }, {});
    setFormData({
      username: account.username,
      email: account.email,
      password: '',
      nickname: account.nickname,
      status: account.status,
      permissions
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">授权中心</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
        >
          <FiPlus size={18} />
          <span>创建子权限账号</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-planet-purple"></div>
        </div>
      ) : subAccounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无子权限账号</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-grow flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    昵称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.nickname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${account.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : account.status === 'banned' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.status === 'active' ? '活跃' : account.status === 'banned' ? '封禁' : '未激活'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewLogs(account.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(account)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id, account.username)}
                          className="text-red-600 hover:text-red-900"
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
      )}

      {/* 添加子权限账号模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">创建子权限账号</h3>
                  <p className="text-purple-100 mt-1">为团队成员分配后台管理权限</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setIsExistingUser(false);
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      nickname: '',
                      permissions: { taskCenter: true }
                    });
                  }} 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all bg-gray-50/50"
                    placeholder="请输入用户名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">邮箱地址</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all bg-gray-50/50 pr-12"
                      placeholder="请输入邮箱地址"
                    />
                    {checkingEmail && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                    )}
                  </div>
                </div>

                {!isExistingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">登录密码</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all bg-gray-50/50"
                      placeholder="请设置登录密码"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">用户昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all bg-gray-50/50"
                    placeholder="请输入用户昵称"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">权限配置</label>
                <div className="bg-gray-50/80 rounded-2xl p-5 border-2 border-gray-100 space-y-5">
                  {permissionGroups.map((group) => (
                    <div key={group.label} className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        {group.label}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {group.permissions.map((option) => (
                          <label 
                            key={option.key} 
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 cursor-pointer transition-colors"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={formData.permissions[option.key] || false}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  permissions: { 
                                    ...formData.permissions, 
                                    [option.key]: e.target.checked 
                                  } 
                                })}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                formData.permissions[option.key] 
                                  ? 'bg-purple-500 border-purple-500' 
                                  : 'bg-white border-gray-300 hover:border-purple-300'
                              }`}>
                                {formData.permissions[option.key] && (
                                  <FiCheck size={14} className="text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 select-none">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setIsExistingUser(false);
                    setFormData({
                      username: '',
                      email: '',
                      password: '',
                      nickname: '',
                      permissions: { taskCenter: true }
                    });
                  }}
                  className="flex-1 px-8 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="flex-1 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center"
                >
                  <FiSave size={20} className="mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑子权限账号弹窗 */}
      {showEditModal && currentAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">编辑子权限账号</h3>
                  <p className="text-blue-100 mt-1">修改账号信息和权限配置</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white transition-colors">
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50"
                    placeholder="请输入用户名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">邮箱地址</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50 pr-12"
                      placeholder="请输入邮箱地址"
                    />
                    {checkingEmail && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    新密码 <span className="text-gray-400 text-sm">(留空则不修改)</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50"
                    placeholder="请输入新密码"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">用户昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50"
                    placeholder="请输入用户昵称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">账号状态</label>
                  <select
                    value={formData.status || currentAccount.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50/50"
                  >
                    <option value="active">活跃</option>
                    <option value="inactive">未激活</option>
                    <option value="banned">封禁</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">权限配置</label>
                <div className="bg-gray-50/80 rounded-2xl p-5 border-2 border-gray-100 space-y-5">
                  {permissionGroups.map((group) => (
                    <div key={group.label} className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        {group.label}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {group.permissions.map((option) => (
                          <label 
                            key={option.key} 
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 cursor-pointer transition-colors"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={formData.permissions[option.key] || false}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  permissions: { 
                                    ...formData.permissions, 
                                    [option.key]: e.target.checked 
                                  } 
                                })}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                formData.permissions[option.key] 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'bg-white border-gray-300 hover:border-blue-300'
                              }`}>
                                {formData.permissions[option.key] && (
                                  <FiCheck size={14} className="text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 select-none">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-8 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleEditAccount}
                  className="flex-1 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center"
                >
                  <FiSave size={20} className="mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 操作日志弹窗 */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">操作日志</h3>
                  <p className="text-emerald-100 mt-1">查看账号的操作历史记录</p>
                </div>
                <button onClick={() => setShowLogsModal(false)} className="text-white/80 hover:text-white transition-colors">
                  <FiX size={28} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-300 mb-4">
                    <FiClock size={64} />
                  </div>
                  <p className="text-gray-500 text-lg">暂无操作日志</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-5 bg-gray-50/80 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-emerald-100 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                          <FiEye size={18} className="text-white" />
                        </div>
                        <div>
                          <span className="text-base font-semibold text-gray-900">{log.action}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg">
                        {new Date(log.created_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-semibold text-gray-700 mr-2">资源:</span>
                        <span className="bg-white px-3 py-1 rounded-lg">{log.resource}</span>
                      </div>
                      {log.ip_address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-semibold text-gray-700 mr-2">IP地址:</span>
                          <span className="bg-white px-3 py-1 rounded-lg font-mono">{log.ip_address}</span>
                        </div>
                      )}
                      {log.details && (
                        <div>
                          <span className="font-semibold text-gray-700 text-sm block mb-2">操作详情:</span>
                          <pre className="bg-white p-4 rounded-xl text-xs border border-gray-200 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>

            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 降级确认弹窗 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">确认降级</h3>
                  <p className="text-red-100 mt-1">将子权限账号降级为普通用户</p>
                </div>
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAccountId(null);
                    setDeleteAccountName('');
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
                  确定要将子权限账号 <span className="font-bold text-red-600">{deleteAccountName}</span> 降级为普通用户吗？
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  此操作将移除该用户的所有后台管理权限
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAccountId(null);
                    setDeleteAccountName('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAccount}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center"
                >
                  <FiTrash2 size={18} className="mr-2" />
                  确认降级
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthorizationManagement;