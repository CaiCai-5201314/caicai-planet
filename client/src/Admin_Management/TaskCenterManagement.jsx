import { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiCalendar, FiUsers,
  FiChevronLeft, FiChevronRight, FiMoreVertical, FiEye, FiEyeOff,
  FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiLayers, FiMessageSquare,
  FiInbox, FiUser
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TaskCenterManagement() {
  const [activeTab, setActiveTab] = useState('male'); // 'male' 或 'female'
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 自定义类型和话题
  const [customTypes, setCustomTypes] = useState([]);
  const [customTopics, setCustomTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  // 用户提议相关
  const [showProposalsTab, setShowProposalsTab] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalStats, setProposalStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [showEditProposalModal, setShowEditProposalModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [editProposalForm, setEditProposalForm] = useState({
    title: '',
    description: '',
    gender: 'male',
    difficulty: 'medium'
  });
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customTypeId: '',
    customTopicId: '',
    gender: 'male',
    difficulty: 'medium',
    priority: 'medium',
    reward: 0,
    startTime: '',
    endTime: '',
    maxParticipants: '',
    status: 'draft',
    assignedTo: ''
  });

  useEffect(() => {
    if (!showProposalsTab) {
      fetchTasks();
      fetchStats();
      fetchCustomTypes();
    }
  }, [activeTab, currentPage, statusFilter, searchTerm, showProposalsTab]);

  useEffect(() => {
    if (showProposalsTab) {
      fetchProposals();
      fetchProposalStats();
    }
  }, [showProposalsTab]);

  useEffect(() => {
    if (formData.customTypeId) {
      fetchCustomTopics(formData.customTypeId);
    } else {
      setCustomTopics([]);
    }
  }, [formData.customTypeId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // 检查token是否存在
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('没有找到token，需要重新登录');
        toast.error('请重新登录');
        return;
      }
      
      const response = await api.get('/admin/tasks', {
        params: {
          gender: activeTab,
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter
        }
      });
      setTasks(response.data.tasks || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('获取任务列表失败:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);
      const errorMessage = error.response?.data?.message || '获取任务列表失败';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/tasks/stats');
      setStats(response.data);
    } catch (error) {
      console.error('获取任务统计失败:', error);
    }
  };

  const fetchCustomTypes = async () => {
    try {
      const response = await api.get('/admin/task-types');
      setCustomTypes(Array.isArray(response.data.taskTypes) ? response.data.taskTypes : []);
    } catch (error) {
      console.error('获取自定义类型失败:', error);
      setCustomTypes([]);
    }
  };

  const fetchCustomTopics = async (typeId) => {
    if (!typeId) return;
    try {
      setLoadingTopics(true);
      const response = await api.get(`/admin/task-types/${typeId}/topics`);
      setCustomTopics(Array.isArray(response.data.topics) ? response.data.topics : []);
    } catch (error) {
      console.error('获取话题失败:', error);
      setCustomTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  // 获取用户提议列表
  const fetchProposals = async () => {
    try {
      setProposalsLoading(true);
      const response = await api.get('/admin/task-proposals');
      setProposals(Array.isArray(response.data.proposals) ? response.data.proposals : []);
    } catch (error) {
      console.error('获取任务提议失败:', error);
      toast.error('获取任务提议失败');
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  };

  // 获取提议统计
  const fetchProposalStats = async () => {
    try {
      const response = await api.get('/admin/task-proposals/stats');
      setProposalStats(response.data || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('获取提议统计失败:', error);
    }
  };

  // 审核通过提议
  const handleApproveProposal = async (proposalId) => {
    try {
      await api.put(`/admin/task-proposals/${proposalId}/approve`);
      toast.success('已批准该任务提议');
      fetchProposals();
      fetchProposalStats();
    } catch (error) {
      console.error('批准提议失败:', error);
      toast.error('批准失败');
    }
  };

  // 拒绝提议
  const handleRejectProposal = async (proposalId) => {
    if (!window.confirm('确定要拒绝这个任务提议吗？')) return;
    try {
      await api.put(`/admin/task-proposals/${proposalId}/reject`);
      toast.success('已拒绝该任务提议');
      fetchProposals();
      fetchProposalStats();
    } catch (error) {
      console.error('拒绝提议失败:', error);
      toast.error('拒绝失败');
    }
  };

  // 打开编辑提议弹窗
  const handleOpenEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setEditProposalForm({
      title: proposal.title,
      description: proposal.description,
      gender: proposal.gender,
      difficulty: proposal.difficulty
    });
    setShowEditProposalModal(true);
  };

  // 更新提议
  const handleUpdateProposal = async () => {
    if (!editProposalForm.title.trim()) {
      toast.error('请输入任务名称');
      return;
    }
    if (!editProposalForm.description.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    try {
      await api.put(`/admin/task-proposals/${editingProposal.id}`, editProposalForm);
      toast.success('提议已更新');
      setShowEditProposalModal(false);
      fetchProposals();
    } catch (error) {
      console.error('更新提议失败:', error);
      toast.error('更新失败');
    }
  };

  const handleAddTask = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入任务名称');
      return;
    }
    if (!formData.customTypeId) {
      toast.error('请选择任务类型');
      return;
    }

    try {
      const createData = {
        title: formData.title,
        description: formData.description,
        customTypeId: formData.customTypeId,
        customTopicId: formData.customTopicId || null,
        gender: activeTab,
        difficulty: formData.difficulty,
        reward: formData.reward,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        maxParticipants: formData.maxParticipants || null,
        status: formData.status
      };
      
      await api.post('/admin/tasks', createData);
      toast.success('任务创建成功');
      setShowAddModal(false);
      resetForm();
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('创建任务失败:', error.response?.data || error);
      toast.error(error.response?.data?.message || '创建任务失败');
    }
  };

  const handleEditTask = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入任务名称');
      return;
    }
    if (!formData.customTypeId) {
      toast.error('请选择任务类型');
      return;
    }

    try {
      // 只发送后端需要的字段
      const updateData = {
        title: formData.title,
        description: formData.description,
        customTypeId: formData.customTypeId,
        customTopicId: formData.customTopicId || null,
        gender: formData.gender,
        difficulty: formData.difficulty,
        reward: formData.reward,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        maxParticipants: formData.maxParticipants || null,
        status: formData.status
      };
      
      await api.put(`/admin/tasks/${currentTask.id}`, updateData);
      toast.success('任务更新成功');
      setShowEditModal(false);
      setCurrentTask(null);
      resetForm();
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('更新任务失败:', error.response?.data || error);
      toast.error(error.response?.data?.message || '更新任务失败');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        await api.delete(`/admin/tasks/${id}`);
        toast.success('任务删除成功');
        fetchTasks();
        fetchStats();
      } catch (error) {
        console.error('删除任务失败:', error);
        toast.error('删除任务失败');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/tasks/${id}/status`, { status });
      toast.success('任务状态更新成功');
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      customTypeId: '',
      customTopicId: '',
      gender: 'male',
      difficulty: 'medium',
      priority: 'medium',
      reward: 0,
      startTime: '',
      endTime: '',
      maxParticipants: '',
      status: 'draft',
      assignedTo: ''
    });
    setCustomTopics([]);
  };

  const openEditModal = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      customTypeId: task.customTypeId || '',
      customTopicId: task.customTopicId || '',
      gender: task.gender,
      difficulty: task.difficulty,
      priority: task.priority || 'medium',
      reward: task.reward,
      startTime: task.startTime ? new Date(task.startTime).toISOString().slice(0, 16) : '',
      endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0, 16) : '',
      maxParticipants: task.maxParticipants || '',
      status: task.status,
      assignedTo: task.assignedTo || ''
    });
    // 如果有自定义类型，加载对应的话题
    if (task.customTypeId) {
      fetchCustomTopics(task.customTypeId);
    }
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, gender: activeTab }));
    setShowAddModal(true);
  };

  // 渲染统计卡片
  const renderStatsCards = () => {
    if (!stats) return null;
    
    const genderStats = activeTab === 'male' ? stats.gender.male : stats.gender.female;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总任务数</p>
              <p className="text-2xl font-bold text-gray-900">{genderStats}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-planet-purple/10 flex items-center justify-center">
              <FiLayers className="text-planet-purple" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已发布</p>
              <p className="text-2xl font-bold text-green-600">{stats.status.published}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待发布</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.status.draft}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <FiClock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已过期</p>
              <p className="text-2xl font-bold text-gray-600">{stats.status.expired}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FiAlertCircle className="text-gray-600" size={20} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 状态映射
  const statusMap = {
    draft: { label: '待发布', color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
    published: { label: '已发布', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
    expired: { label: '已过期', color: 'bg-gray-100 text-gray-700', icon: FiAlertCircle },
    disabled: { label: '已禁用', color: 'bg-red-100 text-red-700', icon: FiEyeOff }
  };

  // 难度映射
  const difficultyMap = {
    easy: { label: '简单', color: 'text-green-600' },
    medium: { label: '中等', color: 'text-yellow-600' },
    hard: { label: '困难', color: 'text-red-600' }
  };

  // 优先级映射
  const priorityMap = {
    low: { label: '低', color: 'bg-gray-100 text-gray-700' },
    medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
    high: { label: '高', color: 'bg-red-100 text-red-700' }
  };

  // 渲染任务行 - 优化后的排版
  const renderTaskRow = (task, index) => {
    const taskStatus = task?.status || 'draft';
    const taskDifficulty = task?.difficulty || 'medium';
    const taskPriority = task?.priority || 'medium';
    
    const statusInfo = statusMap[taskStatus];
    const difficultyInfo = difficultyMap[taskDifficulty];
    const priorityInfo = priorityMap[taskPriority];
    const StatusIcon = statusInfo?.icon || FiAlertCircle;
    
    // 判断是否使用自定义类型
    const hasCustomType = task?.customType;
    const hasCustomTopic = task?.customTopic;
    
    return (
      <div 
        key={task.id}
        className="task-row group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-planet-purple/20 transition-all duration-200 mb-4"
        style={{
          marginLeft: '10%',
          marginRight: '10%',
          width: '80%'
        }}
      >
        {/* 第一行：标题和状态标签 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* 任务类型图标 */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center flex-shrink-0">
              {hasCustomType ? (
                <span className="text-lg">{task.customType.icon || '📋'}</span>
              ) : (
                <FiLayers className="text-white" size={20} />
              )}
            </div>
            
            {/* 任务标题 */}
            <h3 className="font-bold text-gray-900 text-lg truncate">{task?.title || '未命名任务'}</h3>
          </div>
          
          {/* 状态标签组 */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-700'} flex items-center space-x-1`}>
              <StatusIcon size={12} />
              <span>{statusInfo?.label || '未知'}</span>
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${
              taskDifficulty === 'easy' ? 'border-green-200 text-green-600 bg-green-50' :
              taskDifficulty === 'medium' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
              'border-red-200 text-red-600 bg-red-50'
            }`}>
              {difficultyInfo?.label || '未知'}
            </span>
          </div>
        </div>
        
        {/* 第二行：类型标签和描述 */}
        <div className="mb-3">
          {/* 自定义类型和话题标签 */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            {hasCustomType && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                <FiLayers size={12} className="mr-1.5" />
                {task.customType.name}
              </span>
            )}
            {hasCustomTopic && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                <FiMessageSquare size={12} className="mr-1.5" />
                {task.customTopic.name}
              </span>
            )}
            {task?.assignedTo && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-100 text-teal-700">
                <FiUsers size={12} className="mr-1.5" />
                {task.assignedTo}
              </span>
            )}
          </div>
          
          {/* 描述 */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {task.description || '暂无描述'}
          </p>
        </div>
        
        {/* 第三行：元信息和操作按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* 左侧：时间、参与人数、奖励 */}
          <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1.5">
              <FiCalendar size={14} className="text-gray-400" />
              <span>创建: {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : '未知'}</span>
            </span>
            
            {task?.startTime && (
              <span className="flex items-center space-x-1.5">
                <FiClock size={14} className="text-gray-400" />
                <span>生效: {new Date(task.startTime).toLocaleDateString()}</span>
              </span>
            )}
            
            {task?.endTime && (
              <span className="flex items-center space-x-1.5">
                <FiAlertCircle size={14} className="text-gray-400" />
                <span>过期: {new Date(task.endTime).toLocaleDateString()}</span>
              </span>
            )}
            
            <span className="flex items-center space-x-1.5">
              <FiUsers size={14} className="text-gray-400" />
              <span>参与: {task?.currentParticipants || 0}{task?.maxParticipants ? `/${task.maxParticipants}` : ''}</span>
            </span>
            
            {task?.reward > 0 && (
              <span className="flex items-center space-x-1 text-planet-purple font-medium">
                <span>🎁</span>
                <span>奖励: {task.reward} 积分</span>
              </span>
            )}
          </div>
          
          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* 状态切换 */}
            {task?.status === 'draft' && task?.id && (
              <button
                onClick={() => handleStatusChange(task.id, 'published')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
              >
                发布
              </button>
            )}
            {task?.status === 'published' && task?.id && (
              <button
                onClick={() => handleStatusChange(task.id, 'disabled')}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-sm"
              >
                禁用
              </button>
            )}
            {(task?.status === 'disabled' || task?.status === 'expired') && task?.id && (
              <button
                onClick={() => handleStatusChange(task.id, 'published')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm"
              >
                启用
              </button>
            )}
            
            {/* 编辑按钮 */}
            {task?.id && (
              <button
                onClick={() => openEditModal(task)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="编辑"
              >
                <FiEdit2 size={18} />
              </button>
            )}
            
            {/* 删除按钮 */}
            {task?.id && (
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染任务表单
  const renderTaskForm = (isEdit = false) => {
    // 过滤适用于当前性别的自定义类型
    const availableCustomTypes = customTypes.filter(type => 
      type.gender === activeTab || type.gender === 'both'
    );

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务名称 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入任务名称"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="请输入任务描述"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>
        
        {/* 任务类型选择 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务类型 *</label>
            <select
              value={formData.customTypeId}
              onChange={(e) => setFormData({ ...formData, customTypeId: e.target.value, customTopicId: '' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">选择类型</option>
              {availableCustomTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联话题</label>
            <select
              value={formData.customTopicId}
              onChange={(e) => setFormData({ ...formData, customTopicId: e.target.value })}
              disabled={!formData.customTypeId || loadingTopics}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple disabled:bg-gray-50"
            >
              <option value="">选择话题（可选）</option>
              {customTopics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 难度和优先级 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务难度</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务优先级</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        
        {/* 奖励和人数限制 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">奖励积分</label>
            <input
              type="number"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大参与人数</label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              placeholder="不限"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
        </div>
        
        {/* 任务负责人 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务负责人</label>
          <input
            type="text"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="输入负责人名称（可选）"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>
        
        {/* 生效时间和过期时间 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生效时间</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">过期时间</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
        </div>
        
        {/* 任务状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          >
            <option value="draft">待发布</option>
            <option value="published">已发布</option>
            <option value="disabled">已禁用</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">任务中心管理</h1>
        {!showProposalsTab && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
          >
            <FiPlus size={20} />
            <span>创建任务</span>
          </button>
        )}
      </div>

      {/* 统计卡片 */}
      {!showProposalsTab && renderStatsCards()}

      {/* 专区切换标签 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 inline-flex mb-6">
        <button
          onClick={() => {
            setActiveTab('male');
            setShowProposalsTab(false);
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'male' && !showProposalsTab
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          男版专区
        </button>
        <button
          onClick={() => {
            setActiveTab('female');
            setShowProposalsTab(false);
            setCurrentPage(1);
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'female' && !showProposalsTab
              ? 'bg-pink-100 text-pink-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          女版专区
        </button>
        <button
          onClick={() => {
            setShowProposalsTab(true);
          }}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
            showProposalsTab
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiInbox size={18} />
          <span>用户提议</span>
          {proposalStats.pending > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {proposalStats.pending}
            </span>
          )}
        </button>
      </div>

      {/* 筛选和搜索 */}
      {!showProposalsTab && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索任务名称或描述..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="">所有状态</option>
              <option value="draft">待发布</option>
              <option value="published">已发布</option>
              <option value="expired">已过期</option>
              <option value="disabled">已禁用</option>
            </select>
            
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                清空筛选
              </button>
            )}
          </div>
        </div>
      )}

      {/* 任务列表或用户提议列表 */}
      <div className="min-h-[400px]">
        {showProposalsTab ? (
          // 用户提议列表
          proposalsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiInbox className="text-gray-400" size={40} />
              </div>
              <p className="text-gray-500 text-lg">暂无用户提议</p>
              <p className="text-gray-400 text-sm mt-1">用户提交的任务提议将显示在这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          proposal.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {proposal.status === 'pending' ? '待审核' :
                           proposal.status === 'approved' ? '已通过' : '已拒绝'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          proposal.gender === 'male' ? 'bg-blue-50 text-blue-700' :
                          proposal.gender === 'female' ? 'bg-pink-50 text-pink-700' :
                          'bg-purple-50 text-purple-700'
                        }`}>
                          {proposal.gender === 'male' ? '男生专区' :
                           proposal.gender === 'female' ? '女生专区' : '通用'}
                        </span>
                        <span className={`text-xs font-medium ${
                          proposal.difficulty === 'easy' ? 'text-green-600' :
                          proposal.difficulty === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {proposal.difficulty === 'easy' ? '简单' :
                           proposal.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{proposal.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <FiUser size={14} />
                          <span>提议人: {proposal.user?.username || '未知用户'}</span>
                        </span>
                        <span>提交时间: {new Date(proposal.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleOpenEditProposal(proposal)}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <FiEdit2 size={18} />
                        <span>编辑</span>
                      </button>
                      {proposal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveProposal(proposal.id)}
                            className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <FiCheckCircle size={18} />
                            <span>通过</span>
                          </button>
                          <button
                            onClick={() => handleRejectProposal(proposal.id)}
                            className="flex items-center space-x-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <FiXCircle size={18} />
                            <span>拒绝</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // 任务列表
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiLayers className="text-gray-400" size={40} />
              </div>
              <p className="text-gray-500 text-lg">暂无任务</p>
              <p className="text-gray-400 text-sm mt-1">点击右上角按钮创建新任务</p>
            </div>
          ) : (
            <>
              {/* 任务列表 - 居中70%宽度 */}
              <div className="space-y-0">
                {tasks.map((task, index) => renderTaskRow(task, index))}
              </div>
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <FiChevronLeft size={16} />
                      <span>上一页</span>
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
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === pageNum
                              ? 'bg-planet-purple text-white border-planet-purple'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>下一页</span>
                      <FiChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* 添加任务模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                创建{activeTab === 'male' ? '男版' : '女版'}任务
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            {renderTaskForm(false)}
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑任务模态框 */}
      {showEditModal && currentTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑任务</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentTask(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            {renderTaskForm(true)}
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentTask(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditTask}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑提议模态框 */}
      {showEditProposalModal && editingProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑任务提议</h3>
              <button
                onClick={() => {
                  setShowEditProposalModal(false);
                  setEditingProposal(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称 *</label>
                <input
                  type="text"
                  value={editProposalForm.title}
                  onChange={(e) => setEditProposalForm({ ...editProposalForm, title: e.target.value })}
                  placeholder="请输入任务名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务描述 *</label>
                <textarea
                  value={editProposalForm.description}
                  onChange={(e) => setEditProposalForm({ ...editProposalForm, description: e.target.value })}
                  placeholder="请详细描述任务内容、要求等"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">适用专区</label>
                  <select
                    value={editProposalForm.gender}
                    onChange={(e) => setEditProposalForm({ ...editProposalForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="male">男生专区</option>
                    <option value="female">女生专区</option>
                    <option value="both">通用</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                  <select
                    value={editProposalForm.difficulty}
                    onChange={(e) => setEditProposalForm({ ...editProposalForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowEditProposalModal(false);
                  setEditingProposal(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateProposal}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 响应式样式 */}
      <style>{`
        @media (max-width: 768px) {
          .task-row {
            margin-left: 5% !important;
            margin-right: 5% !important;
            width: 90% !important;
          }
        }
        
        @media (max-width: 640px) {
          .task-row {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
