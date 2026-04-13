import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiFilter, FiRefreshCw, FiX, FiSave, FiUsers, FiAward, FiActivity, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ExpManagement() {
  const [activeTab, setActiveTab] = useState('logs');
  const [levels, setLevels] = useState([]);
  const [expLogs, setExpLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ user_id: '', reason_type: '', start_date: '', end_date: '' });
  const [stats, setStats] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelFormData, setLevelFormData] = useState({
    level: '',
    name: '',
    min_exp: '',
    max_exp: '',
    icon: '',
    color: '#8b5cf6',
    privileges: {},
    description: '',
    is_active: true
  });
  const [adjustFormData, setAdjustFormData] = useState({
    user_id: '',
    exp_change: '',
    reason: '',
    remark: ''
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (activeTab === 'levels') {
      fetchLevels();
    } else {
      fetchExpLogs();
    }
    fetchStats();
  }, [activeTab, pagination.page, filters]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exp-management/levels');
      setLevels(response.data?.levels || []);
    } catch (error) {
      console.error('获取经验值等级失败:', error);
      toast.error('获取经验值等级失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.reason_type && { reason_type: filters.reason_type }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });
      const response = await api.get(`/exp-management/logs?${params.toString()}`);
      setExpLogs(response.data?.expLogs || []);
      setPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('获取经验值记录失败:', error);
      toast.error('获取经验值记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/exp-management/stats');
      setStats(response.data?.stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleInitLevels = async () => {
    if (!window.confirm('确定要初始化等级体系吗？这将删除现有等级并创建新的等级体系。')) return;
    
    try {
      // 删除现有等级
      for (const level of levels) {
        try {
          await api.delete(`/exp-management/levels/${level.id}`);
        } catch (e) {
          // 忽略删除错误
        }
      }
      
      // 等级架构表数据
      const levelData = [
        { level: 1, name: 'Lv.1', min_exp: 0, max_exp: 49, color: '#ffffff', description: '初始等级', point_bonus: 0, moon_points_bonus: 0 },
        { level: 2, name: 'Lv.2', min_exp: 50, max_exp: 149, color: '#ffffff', description: '初级等级', point_bonus: 5, moon_points_bonus: 5 },
        { level: 3, name: 'Lv.3', min_exp: 150, max_exp: 349, color: '#ffffff', description: '入门等级', point_bonus: 10, moon_points_bonus: 10 },
        { level: 4, name: 'Lv.4', min_exp: 350, max_exp: 699, color: '#ffffff', description: '成长等级', point_bonus: 15, moon_points_bonus: 15 },
        { level: 5, name: 'Lv.5', min_exp: 700, max_exp: 1299, color: '#8b5cf6', description: '进阶等级', point_bonus: 20, moon_points_bonus: 20 },
        { level: 6, name: 'Lv.6', min_exp: 1300, max_exp: 2299, color: '#8b5cf6', description: '精英等级', point_bonus: 25, moon_points_bonus: 25 },
        { level: 7, name: 'Lv.7', min_exp: 2300, max_exp: 3899, color: '#8b5cf6', description: '专家等级', point_bonus: 30, moon_points_bonus: 30 },
        { level: 8, name: 'Lv.8', min_exp: 3900, max_exp: 6399, color: '#8b5cf6', description: '大师等级', point_bonus: 35, moon_points_bonus: 35 },
        { level: 9, name: 'Lv.9', min_exp: 6400, max_exp: 9999, color: '#ef4444', description: '宗师等级', point_bonus: 40, moon_points_bonus: 40 },
        { level: 10, name: 'Lv.10', min_exp: 10000, max_exp: null, color: '#f59e0b', description: '传奇等级', point_bonus: 50, moon_points_bonus: 50 }
      ];
      
      // 创建新等级
      for (const data of levelData) {
        await api.post('/exp-management/levels', data);
      }
      
      toast.success('等级体系初始化成功！');
      fetchLevels();
    } catch (error) {
      console.error('初始化等级体系失败:', error);
      toast.error(error.response?.data?.message || '初始化等级体系失败');
    }
  };

  // 搜索用户
  const handleSearchUser = async (email) => {
    if (!email) {
      setSearchedUser(null);
      setAdjustFormData(prev => ({ ...prev, user_id: '' }));
      return;
    }

    try {
      setSearching(true);
      // 使用用户管理API搜索用户
      const params = new URLSearchParams({
        search: email,
        page: 1,
        limit: 10
      });
      const response = await api.get(`/admin/users?${params.toString()}`);
      
      const users = response.data?.users || [];
      // 找到邮箱匹配的用户
      const matchedUser = users.find(user => 
        user.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (matchedUser) {
        setSearchedUser(matchedUser);
        setAdjustFormData(prev => ({ ...prev, user_id: matchedUser.id }));
      } else if (users.length > 0) {
        // 如果没有完全匹配，但有搜索结果，使用第一个
        const user = users[0];
        setSearchedUser(user);
        setAdjustFormData(prev => ({ ...prev, user_id: user.id }));
      } else {
        setSearchedUser(null);
        setAdjustFormData(prev => ({ ...prev, user_id: '' }));
        toast.error('未找到该邮箱对应的用户');
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      setSearchedUser(null);
      setAdjustFormData(prev => ({ ...prev, user_id: '' }));
    } finally {
      setSearching(false);
    }
  };

  // 重置搜索状态
  const resetSearch = () => {
    setSearchEmail('');
    setSearchedUser(null);
    setAdjustFormData({
      user_id: '',
      exp_change: '',
      reason: '',
      remark: ''
    });
  };

  const handleCreateLevel = () => {
    setEditingLevel(null);
    setLevelFormData({
      level: '',
      name: '',
      min_exp: '',
      max_exp: '',
      icon: '',
      color: '#8b5cf6',
      privileges: {},
      description: '',
      point_bonus: 0,
      moon_points_bonus: 0,
      is_active: true
    });
    setShowLevelModal(true);
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setLevelFormData({
      level: level.level,
      name: level.name,
      min_exp: level.min_exp,
      max_exp: level.max_exp || '',
      icon: level.icon || '',
      color: level.color || '#8b5cf6',
      privileges: level.privileges || {},
      description: level.description || '',
      point_bonus: level.point_bonus || 0,
      moon_points_bonus: level.moon_points_bonus || 0,
      is_active: level.is_active
    });
    setShowLevelModal(true);
  };

  const handleDeleteLevel = async (level) => {
    if (!window.confirm(`确定要删除等级"${level.name}"吗？`)) return;
    
    try {
      await api.delete(`/exp-management/levels/${level.id}`);
      toast.success('等级删除成功');
      fetchLevels();
    } catch (error) {
      console.error('删除等级失败:', error);
      toast.error(error.response?.data?.message || '删除等级失败');
    }
  };

  const handleSubmitLevel = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...levelFormData,
        min_exp: parseInt(levelFormData.min_exp),
        max_exp: levelFormData.max_exp ? parseInt(levelFormData.max_exp) : null,
        point_bonus: parseInt(levelFormData.point_bonus) || 0,
        moon_points_bonus: parseInt(levelFormData.moon_points_bonus) || 0
      };
      
      if (editingLevel) {
        await api.put(`/exp-management/levels/${editingLevel.id}`, data);
        toast.success('等级更新成功');
      } else {
        await api.post('/exp-management/levels', data);
        toast.success('等级创建成功');
      }
      setShowLevelModal(false);
      fetchLevels();
    } catch (error) {
      console.error('保存等级失败:', error);
      toast.error(error.response?.data?.message || '保存等级失败');
    }
  };

  const handleAdjustExp = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...adjustFormData,
        user_id: parseInt(adjustFormData.user_id),
        exp_change: parseInt(adjustFormData.exp_change)
      };
      await api.post('/exp-management/adjust', data);
      toast.success('经验值调整成功');
      resetSearch();
      setShowAdjustModal(false);
      fetchExpLogs();
      fetchStats();
    } catch (error) {
      console.error('调整经验值失败:', error);
      toast.error(error.response?.data?.message || '调整经验值失败');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  const getReasonTypeText = (type) => {
    const typeMap = {
      check_in: '打卡',
      task: '任务',
      post: '发帖',
      comment: '评论',
      like: '点赞',
      admin: '管理员',
      other: '其他'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">账号经验值管理</h2>
        {activeTab === 'logs' ? (
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FiSettings />
            <span>调整经验值</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInitLevels}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw />
              <span>初始化等级</span>
            </button>
            <button
              onClick={handleCreateLevel}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus />
              <span>新建等级</span>
            </button>
          </div>
        )}
      </div>

      {/* 标签页 */}
      <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'logs'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiActivity />
          <span>经验值记录</span>
        </button>
        <button
          onClick={() => setActiveTab('levels')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'levels'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiAward />
          <span>等级体系</span>
        </button>
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
                <p className="text-green-600 text-sm font-medium">总经验值</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalExp?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <FiAward className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">平均经验值</p>
                <p className="text-3xl font-bold text-blue-700">{stats.avgExp?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">今日变动</p>
                <p className={`text-3xl font-bold ${stats.todayExpChange >= 0 ? 'text-orange-700' : 'text-red-700'}`}>
                  {stats.todayExpChange >= 0 ? '+' : ''}{stats.todayExpChange?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <FiActivity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'levels' ? (
        /* 等级体系 */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">等级</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">经验值范围</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">积分加成</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">月球分加成</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : levels.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      暂无等级数据
                    </td>
                  </tr>
                ) : (
                  levels.map((level) => {
                    // 为白色昵称添加边框，让它在白色背景上更明显
                    const isWhiteColor = level.color === '#ffffff' || level.color === '#fff' || level.color === 'white';
                    const levelStyle = isWhiteColor 
                      ? { backgroundColor: '#f3f4f6', border: '2px solid #9ca3af', color: '#374151' }
                      : { backgroundColor: level.color, color: '#ffffff' };
                    
                    return (
                    <tr key={level.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={levelStyle}
                        >
                          {level.level}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium" style={{ color: level.color === '#ffffff' || level.color === '#fff' || level.color === 'white' ? '#374151' : level.color }}>
                            {level.name}
                          </p>
                          {level.description && (
                            <p className="text-sm text-gray-500">{level.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {level.min_exp.toLocaleString()} - {level.max_exp ? level.max_exp.toLocaleString() : '∞'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          level.point_bonus > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {level.point_bonus || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          level.moon_points_bonus > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {level.moon_points_bonus || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          level.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {level.is_active ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditLevel(level)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(level)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );})
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 经验值记录 */
        <>
          {/* 筛选 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FiFilter className="text-gray-400" />
              <h3 className="font-semibold text-gray-700">筛选条件</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">用户ID</label>
                <input
                  type="text"
                  value={filters.user_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入用户ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">变动类型</label>
                <select
                  value={filters.reason_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, reason_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">全部类型</option>
                  <option value="check_in">打卡</option>
                  <option value="task">任务</option>
                  <option value="post">发帖</option>
                  <option value="comment">评论</option>
                  <option value="like">点赞</option>
                  <option value="admin">管理员</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">开始日期</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">结束日期</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      setFilters({ user_id: '', reason_type: '', start_date: '', end_date: '' });
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 记录列表 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">用户</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">经验值变动</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">变动原因</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">操作人</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : expLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        暂无经验值记录
                      </td>
                    </tr>
                  ) : (
                    expLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {log.user && (
                            <div className="flex items-center space-x-3">
                              <img
                                src={(log.user.avatar && log.user.avatar.length > 0 && log.user.avatar !== '/uploads/avatars/default.png') ? log.user.avatar : '/moren.png'}
                                alt={log.user.nickname || log.user.username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/moren.png';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">{log.user.nickname || log.user.username}</p>
                                <p className="text-sm text-gray-500">UID: {log.user.uid || log.user.id}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`font-bold text-lg ${log.exp_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {log.exp_change >= 0 ? '+' : ''}{log.exp_change}
                            </p>
                            <p className="text-sm text-gray-500">
                              {log.exp_before.toLocaleString()} → {log.exp_after.toLocaleString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{log.reason}</p>
                            <p className="text-sm text-gray-500">{getReasonTypeText(log.reason_type)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {log.operator ? (log.operator.nickname || log.operator.username) : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {formatDate(log.created_at)}
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

      {/* 等级管理弹窗 */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLevel ? '编辑等级' : '新建等级'}
              </h3>
              <button
                onClick={() => setShowLevelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitLevel} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">等级编号 *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={levelFormData.level}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入等级编号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">等级名称 *</label>
                  <input
                    type="text"
                    required
                    value={levelFormData.name}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入等级名称"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最低经验值 *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={levelFormData.min_exp}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, min_exp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入最低经验值"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最高经验值</label>
                  <input
                    type="number"
                    min="0"
                    value={levelFormData.max_exp}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, max_exp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="留空表示无上限"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">积分加成 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={levelFormData.point_bonus}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, point_bonus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入积分加成百分比"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月球分加成 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={levelFormData.moon_points_bonus}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, moon_points_bonus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入月球分加成百分比"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">等级颜色</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={levelFormData.color}
                      onChange={(e) => setLevelFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={levelFormData.color}
                      onChange={(e) => setLevelFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                  <select
                    value={levelFormData.is_active ? 'true' : 'false'}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="true">启用</option>
                    <option value="false">禁用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">等级描述</label>
                <textarea
                  value={levelFormData.description}
                  onChange={(e) => setLevelFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入等级描述"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowLevelModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FiSave />
                  <span>保存</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 调整经验值弹窗 */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">调整用户经验值</h3>
              <button
                onClick={() => {
                  resetSearch();
                  setShowAdjustModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAdjustExp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户邮箱 *</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onBlur={(e) => e.target.value && handleSearchUser(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchEmail && handleSearchUser(searchEmail))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="请输入用户邮箱"
                    />
                    <button
                      type="button"
                      onClick={() => searchEmail && handleSearchUser(searchEmail)}
                      disabled={searching || !searchEmail}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {searching ? '搜索中...' : '搜索'}
                    </button>
                  </div>
                  {searchedUser && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={(searchedUser.avatar && searchedUser.avatar.length > 0 && searchedUser.avatar !== '/uploads/avatars/default.png') ? searchedUser.avatar : '/moren.png'}
                          alt={searchedUser.nickname || searchedUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/moren.png';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{searchedUser.nickname || searchedUser.username}</p>
                          <p className="text-sm text-green-600">UID: {searchedUser.uid || searchedUser.id}</p>
                          <p className="text-xs text-gray-500">{searchedUser.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 隐藏的用户ID输入 */}
                  <input
                    type="hidden"
                    value={adjustFormData.user_id}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">经验值变动 *</label>
                <input
                  type="number"
                  required
                  value={adjustFormData.exp_change}
                  onChange={(e) => setAdjustFormData(prev => ({ ...prev, exp_change: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="正数增加，负数减少"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">变动原因 *</label>
                <input
                  type="text"
                  required
                  value={adjustFormData.reason}
                  onChange={(e) => setAdjustFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="请输入变动原因"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={adjustFormData.remark}
                  onChange={(e) => setAdjustFormData(prev => ({ ...prev, remark: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="可选备注"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetSearch();
                    setShowAdjustModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <FiSave />
                  <span>确认调整</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
