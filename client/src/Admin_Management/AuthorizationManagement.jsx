import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

function AuthorizationManagement() {
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [logs, setLogs] = useState([]);
  // 权限选项配置
  const permissionOptions = [
    { key: 'dashboard', label: '仪表盘' },
    { key: 'userManagement', label: '用户管理' },
    { key: 'postManagement', label: '文章管理' },
    { key: 'commentManagement', label: '评论管理' },
    { key: 'friendLinkManagement', label: '友链管理' },
    { key: 'bannedWordManagement', label: '违禁词管理' },
    { key: 'taskTypeManagement', label: '任务类型管理' },
    { key: 'announcementManagement', label: '公告管理' },
    { key: 'taskCenter', label: '任务中心管理' },
    { key: 'userTaskManagement', label: '用户任务管理' },
    { key: 'errorManagement', label: '错误管理' },
    { key: 'siteConfig', label: '网站配置' },
    { key: 'authorization', label: '授权中心' }
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
  }, []);

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
      const response = await api.get('/authorization/sub-accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('获取子权限账号列表成功:', response.data);
      setSubAccounts(response.data.subAccounts);
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
          }
        } else {
          setIsExistingUser(false);
        }
      } catch (error) {
        console.error('检查邮箱失败:', error);
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

  const handleDeleteAccount = async (id, username) => {
    if (!confirm(`确定要将子权限账号 ${username} 降级为普通用户吗？`)) return;

    // 检查token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('没有找到token，需要重新登录');
      toast.error('请重新登录');
      return;
    }

    try {
      // 手动设置请求头
      await api.delete(`/authorization/sub-accounts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('子权限账号已降级为普通用户');
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
    const permissions = permissionOptions.reduce((acc, option) => {
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
    <div className="p-6">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
        </div>
      )}

      {/* 添加子权限账号弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">创建子权限账号</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setIsExistingUser(false);
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  nickname: '',
                  permissions: { taskCenter: true }
                });
              }} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="输入用户名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="输入邮箱"
                  />
                  {checkingEmail && (
                    <div className="absolute right-3 top-2.5 animate-spin rounded-full h-4 w-4 border-b-2 border-planet-purple" />
                  )}
                </div>
              </div>

              {!isExistingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="输入密码"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="输入昵称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">权限</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissionOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
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
                        className="h-4 w-4 text-planet-purple focus:ring-planet-purple border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
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
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  <FiSave size={16} className="inline mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑子权限账号弹窗 */}
      {showEditModal && currentAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑子权限账号</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="输入用户名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="输入邮箱"
                  />
                  {checkingEmail && (
                    <div className="absolute right-3 top-2.5 animate-spin rounded-full h-4 w-4 border-b-2 border-planet-purple" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码 <span className="text-gray-400 text-xs">(留空则不修改)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="输入新密码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="输入昵称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <select
                  value={formData.status || currentAccount.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">未激活</option>
                  <option value="banned">封禁</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">权限</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {permissionOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
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
                        className="h-4 w-4 text-planet-purple focus:ring-planet-purple border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">{option.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleEditAccount}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  <FiSave size={16} className="inline mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 操作日志弹窗 */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">操作日志</h3>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无操作日志</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">资源:</span> {log.resource}
                    </div>
                    {log.ip_address && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">IP:</span> {log.ip_address}
                      </div>
                    )}
                    {log.details && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">详情:</span>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
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

export default AuthorizationManagement;