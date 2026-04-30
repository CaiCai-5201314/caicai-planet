import React, { useState, useEffect } from 'react';
import { FiGift, FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiDownload, FiBarChart2, FiX, FiCalendar, FiUsers, FiStar } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const CDKManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [cdks, setCdks] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCdk, setSelectedCdk] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [generateForm, setGenerateForm] = useState({
    type: 'single',
    count: 1,
    rewards: { moon_points: 100, exp: 50 },
    reward_type: '',
    pool_id: null,
    selected_files: [],
    expire_at: '',
    min_level: 0,
    min_moon_points: 0,
    max_use_per_user: 1,
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    fetchCDKs();
    fetchStatistics();
  }, [activeTab, currentPage, searchTerm, filterType, filterStatus]);

  const fetchCDKs = async () => {
    try {
      console.log('=== 开始获取CDK列表 ===');
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage);
      params.set('limit', 20);
      if (searchTerm) params.set('code', searchTerm);
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      console.log('请求参数:', params.toString());
      const response = await api.get(`/cdk?${params}`);
      console.log('CDK列表响应:', response.data);
      if (response.data.success) {
        setCdks(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
        console.log('CDK列表更新成功，数量:', response.data.data?.length || 0);
      } else {
        console.error('CDK列表查询失败:', response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('=== 获取CDK列表错误详情 ===');
      console.error('错误对象:', error);
      console.error('错误消息:', error.message);
      console.error('响应状态:', error.response?.status);
      console.error('响应数据:', error.response?.data);
      if (error.response?.status === 401) {
        toast.error('登录已过期，请重新登录');
      } else if (error.response?.status === 403) {
        toast.error('权限不足');
      } else if (error.code === 'ECONNREFUSED') {
        toast.error('无法连接到服务器');
      } else {
        toast.error('获取CDK列表失败');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/cdk/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cdk/records?limit=50');
      if (response.data.success) {
        setRecords(response.data.data || []);
      }
    } catch (error) {
      console.error('获取兑换记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableFiles = async () => {
    try {
      const response = await api.get('/file-storage');
      if (response.data.success) {
        setAvailableFiles(response.data.data || []);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get('/file-storage');
      if (response.data.success) {
        setFiles(response.data.data || []);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  const fetchPools = async () => {
    try {
      const response = await api.get('/pools');
      if (response.data.success) {
        setPools(response.data.data || []);
      }
    } catch (error) {
      console.error('获取池列表失败:', error);
    }
  };

  

  const handleGenerate = async () => {
    try {
      console.log('=== 开始生成CDK ===');
      console.log('表单数据:', generateForm);
      console.log('rewards JSON:', JSON.stringify(generateForm.rewards));
      
      const requestData = {
        ...generateForm,
        rewards: JSON.stringify(generateForm.rewards)
      };
      
      if (generateForm.reward_type === 'random' && generateForm.pool_id) {
        requestData.pool_info = {
          type: 'random',
          pool_id: generateForm.pool_id
        };
      } else if (generateForm.reward_type === 'fixed' && generateForm.selected_files?.length > 0) {
        requestData.selected_files = generateForm.selected_files;
      }
      
      const response = await api.post('/cdk/generate', requestData);
      
      console.log('CDK生成成功:', response.data);
      if (response.data.success) {
        toast.success(`成功生成${response.data.codes.length}个CDK`);
        setShowGenerateModal(false);
        setGenerateForm({
          type: 'single',
          count: 1,
          rewards: { moon_points: 100, exp: 50 },
          reward_type: '',
          pool_id: null,
          selected_files: [],
          expire_at: '',
          min_level: 0,
          min_moon_points: 0,
          max_use_per_user: 1,
          description: ''
        });
        fetchCDKs();
        fetchStatistics();
      } else {
        console.error('CDK生成失败（业务错误）:', response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('=== CDK生成错误详情 ===');
      console.error('错误对象:', error);
      console.error('错误消息:', error.message);
      console.error('响应状态:', error.response?.status);
      console.error('响应数据:', error.response?.data);
      console.error('请求配置:', error.config);
      
      if (error.response?.status === 401) {
        toast.error('登录已过期，请重新登录');
      } else if (error.response?.status === 403) {
        toast.error('权限不足，需要管理员权限');
      } else if (error.response?.status === 404) {
        toast.error('API接口未找到');
      } else if (error.response?.status === 500) {
        toast.error('服务器内部错误');
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error('无法连接到服务器，请检查服务器是否正常运行');
      } else {
        toast.error('生成失败，请稍后重试');
      }
    }
  };

  const handleEdit = async () => {
    try {
      const response = await api.put(`/cdk/${selectedCdk.id}`, {
        status: selectedCdk.status,
        expire_at: selectedCdk.expire_at,
        description: selectedCdk.description,
        min_level: selectedCdk.min_level,
        min_moon_points: selectedCdk.min_moon_points,
        max_use_per_user: selectedCdk.max_use_per_user
      });
      if (response.data.success) {
        toast.success('CDK更新成功');
        setShowEditModal(false);
        fetchCDKs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('更新CDK失败:', error);
      toast.error('更新失败，请稍后重试');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个CDK吗？删除后无法恢复。')) return;
    
    try {
      const response = await api.delete(`/cdk/${id}`);
      if (response.data.success) {
        toast.success('CDK删除成功');
        fetchCDKs();
        fetchStatistics();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('删除CDK失败:', error);
      toast.error('删除失败，请稍后重试');
    }
  };

  const handleView = (cdk) => {
    setSelectedCdk(cdk);
    setShowViewModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '永久有效';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatRewards = (rewards) => {
    if (!rewards) return '-';
    const r = typeof rewards === 'string' ? JSON.parse(rewards) : rewards;
    const parts = [];
    if (r.moon_points) parts.push(`${r.moon_points}月球分`);
    if (r.exp) parts.push(`${r.exp}经验值`);
    if (r.items) parts.push(r.items.join(','));
    if (r.fixed_files && r.fixed_files.length > 0) {
      parts.push(`固定文件(${r.fixed_files.length}个)`);
    }
    if (r.random_pool) {
      parts.push(`随机文件(${r.random_pool.name})`);
    }
    return parts.join(' + ') || '-';
  };

  const getTypeLabel = (type) => {
    const labels = { single: '单码', batch: '批次', vip: 'VIP专属' };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = { active: '有效', inactive: '已用完', expired: '已过期' };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      expired: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FiGift className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CDK管理</h1>
                <p className="text-sm text-gray-500">管理兑换码的生成、查看和统计</p>
              </div>
            </div>
            {activeTab === 'list' && (
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <FiPlus className="w-4 h-4" />
                生成CDK
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            CDK列表
          </button>
          <button
            onClick={() => { setActiveTab('records'); fetchRecords(); }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            兑换记录
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'statistics'
                ? 'bg-amber-100 text-amber-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            统计报表
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      placeholder="搜索CDK码..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                      className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
                    >
                      <option value="">全部类型</option>
                      <option value="single">单码</option>
                      <option value="batch">批次</option>
                      <option value="vip">VIP专属</option>
                    </select>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">全部状态</option>
                    <option value="active">有效</option>
                    <option value="inactive">已用完</option>
                    <option value="expired">已过期</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">CDK码</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">奖励</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">有效期</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">使用情况</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                          加载中...
                        </div>
                      </td>
                    </tr>
                  ) : cdks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                        暂无CDK记录
                      </td>
                    </tr>
                  ) : (
                    cdks.map((cdk) => (
                      <tr key={cdk.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-gray-900">{cdk.code}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cdk.type === 'vip' ? 'bg-purple-100 text-purple-700' :
                            cdk.type === 'batch' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {getTypeLabel(cdk.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatRewards(cdk.rewards)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(cdk.expire_at)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-gray-900 font-medium">{cdk.used_count}</span>
                          <span className="text-gray-400"> / {cdk.total_count}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cdk.status)}`}>
                            {getStatusLabel(cdk.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(cdk)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="查看详情"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedCdk({ ...cdk, rewards: typeof cdk.rewards === 'string' ? JSON.parse(cdk.rewards) : cdk.rewards }); setShowEditModal(true); }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="编辑"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cdk.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="删除"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!isLoading && cdks.length > 0 && totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">共 {totalPages} 页</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">{currentPage}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">CDK码</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">获得奖励</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">兑换时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        加载中...
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      暂无兑换记录
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiUsers className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-900">{record.user?.username || '未知'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{record.cdk?.code}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.cdk?.type === 'vip' ? 'bg-purple-100 text-purple-700' :
                          record.cdk?.type === 'batch' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getTypeLabel(record.cdk?.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {record.rewards_received && (
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(record.rewards_received).moon_points && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                +{JSON.parse(record.rewards_received).moon_points} 月球分
                              </span>
                            )}
                            {JSON.parse(record.rewards_received).exp && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                +{JSON.parse(record.rewards_received).exp} 经验值
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.used_at ? new Date(record.used_at).toLocaleString('zh-CN') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'statistics' && statistics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FiGift className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CDK总数</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalCDK}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiStar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">有效CDK</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.activeCDK}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiDownload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已兑换</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.usedCDK}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiBarChart2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">兑换率</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.usageRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-amber-600" />
                  累计发放奖励
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-600">月球分</span>
                    <span className="text-2xl font-bold text-green-600">
                      +{statistics.totalRewards?.total_moon_points || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-600">经验值</span>
                    <span className="text-2xl font-bold text-blue-600">
                      +{statistics.totalRewards?.total_exp || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-amber-600" />
                  最近兑换记录
                </h3>
                <div className="space-y-3">
                  {statistics.recentUses?.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <FiGift className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{record.user?.username}</p>
                          <p className="text-xs text-gray-400 font-mono">{record.cdk?.code}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {record.used_at ? new Date(record.used_at).toLocaleTimeString('zh-CN') : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">生成CDK</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  value={generateForm.type}
                  onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value, count: e.target.value === 'single' ? 1 : generateForm.count })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="single">单码（单个兑换码）</option>
                  <option value="batch">批次（多个相同奖励的兑换码）</option>
                  <option value="vip">VIP专属（限特定用户）</option>
                </select>
              </div>

              {generateForm.type !== 'single' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={generateForm.count}
                    onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">奖励设置</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">月球分</label>
                    <input
                      type="number"
                      min="0"
                      value={generateForm.rewards.moon_points || 0}
                      onChange={(e) => setGenerateForm({ ...generateForm, rewards: { ...generateForm.rewards, moon_points: parseInt(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">经验值</label>
                    <input
                      type="number"
                      min="0"
                      value={generateForm.rewards.exp || 0}
                      onChange={(e) => setGenerateForm({ ...generateForm, rewards: { ...generateForm.rewards, exp: parseInt(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文件奖励</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setGenerateForm({ ...generateForm, reward_type: '', pool_id: null, selected_files: [] }); }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        !generateForm.reward_type ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      无文件奖励
                    </button>
                    <button
                      onClick={() => { fetchFiles(); setGenerateForm({ ...generateForm, reward_type: 'fixed', pool_id: null }); }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        generateForm.reward_type === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      指定文件（自选）
                    </button>
                    <button
                      onClick={() => { fetchPools(); setGenerateForm({ ...generateForm, reward_type: 'random', selected_files: [] }); }}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        generateForm.reward_type === 'random' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      随机池（随机抽取）
                    </button>
                  </div>
                  
                  {generateForm.reward_type === 'fixed' && (
                    <div>
                      <label className="block text-sm text-gray-500 mb-2">选择文件（可多选）</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {files.length > 0 ? (
                          files.map(file => (
                            <label key={file.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={generateForm.selected_files?.includes(file.id)}
                                onChange={(e) => {
                                  const current = generateForm.selected_files || [];
                                  const updated = e.target.checked 
                                    ? [...current, file.id] 
                                    : current.filter(id => id !== file.id);
                                  setGenerateForm({ ...generateForm, selected_files: updated });
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="text-sm text-gray-700">{file.file_name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">暂无文件，请先上传</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {generateForm.reward_type === 'random' && (
                    <select
                      value={generateForm.pool_id || ''}
                      onChange={(e) => setGenerateForm({ ...generateForm, pool_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">请选择随机池</option>
                      {pools.filter(p => p.type === 'random').map(pool => (
                        <option key={pool.id} value={pool.id}>
                          {pool.name} (随机池 - 每次抽取{pool.random_count}个文件)
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {generateForm.reward_type === 'random' && !pools.filter(p => p.type === 'random').length && (
                    <p className="text-sm text-red-500">暂无随机池，请先在文件存储管理中创建</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                <input
                  type="datetime-local"
                  value={generateForm.expire_at}
                  onChange={(e) => setGenerateForm({ ...generateForm, expire_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-400 mt-1">留空表示永久有效</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用限制</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">最低等级</label>
                    <input
                      type="number"
                      min="0"
                      value={generateForm.min_level || 0}
                      onChange={(e) => setGenerateForm({ ...generateForm, min_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">最低月球分</label>
                    <input
                      type="number"
                      min="0"
                      value={generateForm.min_moon_points || 0}
                      onChange={(e) => setGenerateForm({ ...generateForm, min_moon_points: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">每人限兑</label>
                    <input
                      type="number"
                      min="1"
                      value={generateForm.max_use_per_user || 1}
                      onChange={(e) => setGenerateForm({ ...generateForm, max_use_per_user: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述说明</label>
                <textarea
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                  placeholder="可选：添加描述说明，方便管理"
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600"
                >
                  生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedCdk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">编辑CDK</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">CDK码</p>
                <p className="font-mono text-gray-900">{selectedCdk.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={selectedCdk.status}
                  onChange={(e) => setSelectedCdk({ ...selectedCdk, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="active">有效</option>
                  <option value="inactive">已用完</option>
                  <option value="expired">已过期</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                <input
                  type="datetime-local"
                  value={selectedCdk.expire_at ? new Date(selectedCdk.expire_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setSelectedCdk({ ...selectedCdk, expire_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用限制</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">最低等级</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedCdk.min_level || 0}
                      onChange={(e) => setSelectedCdk({ ...selectedCdk, min_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">最低月球分</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedCdk.min_moon_points || 0}
                      onChange={(e) => setSelectedCdk({ ...selectedCdk, min_moon_points: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">每人限兑</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedCdk.max_use_per_user || 1}
                      onChange={(e) => setSelectedCdk({ ...selectedCdk, max_use_per_user: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述说明</label>
                <textarea
                  value={selectedCdk.description || ''}
                  onChange={(e) => setSelectedCdk({ ...selectedCdk, description: e.target.value })}
                  placeholder="添加描述说明"
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedCdk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">CDK详情</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-gray-500">CDK码</p>
                <p className="font-mono text-xl font-bold text-amber-600">{selectedCdk.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">类型</p>
                  <p className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${
                    selectedCdk.type === 'vip' ? 'bg-purple-100 text-purple-700' :
                    selectedCdk.type === 'batch' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getTypeLabel(selectedCdk.type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">状态</p>
                  <p className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${getStatusColor(selectedCdk.status)}`}>
                    {getStatusLabel(selectedCdk.status)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">奖励内容</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formatRewards(selectedCdk.rewards).split(' + ').map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">使用情况</p>
                  <p className="font-semibold text-gray-900">{selectedCdk.used_count} / {selectedCdk.total_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">有效期</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedCdk.expire_at)}</p>
                </div>
              </div>

              {selectedCdk.description && (
                <div>
                  <p className="text-sm text-gray-500">描述</p>
                  <p className="text-gray-900 mt-1">{selectedCdk.description}</p>
                </div>
              )}

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default CDKManagement;