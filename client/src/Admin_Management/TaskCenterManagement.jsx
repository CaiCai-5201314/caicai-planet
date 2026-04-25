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
    difficulty: 'medium',
    suggestedTime: '',
    items: ''
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
    endTime: '',
    status: 'draft',
    suggestedTime: '',
    items: ''
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingProposal, setApprovingProposal] = useState(null);
  const [approveForm, setApproveForm] = useState({ difficulty: 'medium' });

  const handleOpenApproveModal = (proposal) => {
    setApprovingProposal(proposal);
    setApproveForm({ difficulty: proposal.difficulty });
    setShowApproveModal(true);
  };

  const handleApproveProposal = async () => {
    if (!approvingProposal) return;
    
    try {
      await api.put(`/admin/task-proposals/${approvingProposal.id}/approve`, {
        difficulty: approveForm.difficulty
      });
      toast.success('已批准该任务提议');
      setShowApproveModal(false);
      setApprovingProposal(null);
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

  // 删除提议
  const handleDeleteProposal = async (proposalId) => {
    if (!window.confirm('确定要删除这个任务提议吗？')) return;
    try {
      await api.delete(`/admin/task-proposals/${proposalId}`);
      toast.success('任务提议已删除');
      fetchProposals();
      fetchProposalStats();
    } catch (error) {
      console.error('删除提议失败:', error);
      toast.error('删除失败');
    }
  };

  // 打开编辑提议弹窗
  const handleOpenEditProposal = (proposal) => {
    setEditingProposal(proposal);
    setEditProposalForm({
      title: proposal.title,
      description: proposal.description,
      gender: proposal.gender,
      difficulty: proposal.difficulty,
      suggestedTime: proposal.suggestedTime || '',
      items: proposal.items || ''
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
        endTime: formData.endTime || null,
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
        endTime: formData.endTime || null,
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
      endTime: '',
      status: 'draft',
      suggestedTime: '',
      items: ''
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
      endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0, 16) : '',
      status: task.status,
      suggestedTime: task.suggestedTime || '',
      items: task.items || ''
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">总任务数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{genderStats}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center shadow-lg shadow-planet-purple/20">
              <FiLayers className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已发布</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.status.published}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <FiCheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">待发布</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.status.draft}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <FiClock className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已过期</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.status.expired}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/20">
              <FiAlertCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染用户提议统计卡片
  const renderProposalStatsCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">总提议数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{proposalStats.pending + proposalStats.approved + proposalStats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center shadow-lg shadow-planet-purple/20">
              <FiInbox className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">待审核</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{proposalStats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <FiClock className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已通过</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{proposalStats.approved}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <FiCheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">已拒绝</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{proposalStats.rejected}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <FiXCircle className="text-white" size={24} />
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
        className="task-row group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-planet-purple/20 transition-all duration-300 transform hover:-translate-y-1 mb-4"
      >
        {/* 第一行：标题和状态标签 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* 任务类型图标 */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center flex-shrink-0 shadow-lg shadow-planet-purple/20">
              {hasCustomType ? (
                <span className="text-xl">{task.customType.icon || '📋'}</span>
              ) : (
                <FiLayers className="text-white" size={24} />
              )}
            </div>
            
            {/* 任务标题 */}
            <h3 className="font-bold text-gray-900 text-lg truncate">{task?.title || '未命名任务'}</h3>
          </div>
          
          {/* 状态标签组 */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-700'} flex items-center space-x-2`}>
              <StatusIcon size={14} />
              <span>{statusInfo?.label || '未知'}</span>
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              taskDifficulty === 'easy' ? 'border-green-200 text-green-600 bg-green-50' :
              taskDifficulty === 'medium' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
              'border-red-200 text-red-600 bg-red-50'
            }`}>
              {difficultyInfo?.label || '未知'}
            </span>
          </div>
        </div>
        
        {/* 第二行：类型标签和描述 */}
        <div className="mb-4">
          {/* 自定义类型和话题标签 */}
            <div className="flex items-center flex-wrap gap-3 mb-3">
              {hasCustomType && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                  <FiLayers size={14} className="mr-2" />
                  {task.customType.name}
                </span>
              )}
              {hasCustomTopic && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <FiMessageSquare size={14} className="mr-2" />
                  {task.customTopic.name}
                </span>
              )}
            </div>
          
          {/* 描述 */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {task.description || '暂无描述'}
          </p>
        </div>
        
        {/* 第三行：元信息和操作按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-4">
          {/* 左侧：时间、参与人数、奖励 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <FiCalendar size={14} className="text-gray-400" />
              <span>创建: {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : '未知'}</span>
            </span>
            
            {task?.endTime && (
              <span className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <FiAlertCircle size={14} className="text-gray-400" />
                <span>过期: {new Date(task.endTime).toLocaleDateString()}</span>
              </span>
            )}
            
            <span className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <FiUsers size={14} className="text-gray-400" />
              <span>参与: {task?.currentParticipants || 0}</span>
            </span>
            
            {task?.reward > 0 && (
              <span className="flex items-center space-x-2 bg-gradient-to-r from-planet-purple to-planet-pink px-3 py-1.5 rounded-lg text-white font-medium">
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
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiCheckCircle size={16} />
                <span>发布</span>
              </button>
            )}
            {task?.status === 'published' && task?.id && (
              <button
                onClick={() => handleStatusChange(task.id, 'disabled')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiEyeOff size={16} />
                <span>禁用</span>
              </button>
            )}
            {(task?.status === 'disabled' || task?.status === 'expired') && task?.id && (
              <button
                onClick={() => handleStatusChange(task.id, 'published')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiEye size={16} />
                <span>启用</span>
              </button>
            )}
            
            {/* 编辑按钮 */}
            {task?.id && (
              <button
                onClick={() => openEditModal(task)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiEdit2 size={16} />
                <span>编辑</span>
              </button>
            )}
            
            {/* 删除按钮 */}
            {task?.id && (
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FiTrash2 size={16} />
                <span>删除</span>
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
              onChange={(e) => {
                const difficulty = e.target.value;
                let reward = 2; // 默认积分
                if (difficulty === 'easy') reward = 2;
                else if (difficulty === 'medium') reward = 3;
                else if (difficulty === 'hard') reward = 5;
                setFormData({ ...formData, difficulty, reward });
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              <option value="easy">简单 (2积分)</option>
              <option value="medium">中等 (3积分)</option>
              <option value="hard">困难 (5积分)</option>
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
        
        {/* 奖励积分 */}
        <div>
<<<<<<< HEAD
          <label className="block text-sm font-medium text-gray-700 mb-1">奖励积分（根据难度自动计算，可手动调整）</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600">{formData.reward}</span>
            <span className="text-gray-500">积分</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            简单任务2积分，中等任务3积分，困难任务5积分
          </p>
=======
          <label className="block text-sm font-medium text-gray-700 mb-1">奖励积分</label>
          <input
            type="number"
            value={formData.reward}
            onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
        </div>
        
        {/* 提议用户和过期时间 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">提议用户</label>
            <input
              type="text"
              value={currentTask?.proposalUser?.username || currentTask?.creator?.username || '未知用户'}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple bg-gray-50"
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

        {/* 建议游玩时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">建议游玩时间（可选）</label>
          <input
            type="text"
            value={formData.suggestedTime}
            onChange={(e) => setFormData({ ...formData, suggestedTime: e.target.value })}
            placeholder="例如：30分钟、1小时"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>

        {/* 任务道具 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">任务道具（可选，多个道具用逗号分隔）</label>
          <input
            type="text"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
            placeholder="例如：手机、笔记本、相机"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">任务中心管理</h1>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors z-10"
        >
          <FiPlus size={20} />
          <span>创建任务</span>
        </button>
      </div>

      {/* 统计卡片 */}
      {!showProposalsTab ? renderStatsCards() : renderProposalStatsCards()}

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
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-planet-purple/30"
                >
                  {/* 顶部：标题和状态 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* 任务图标 */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center flex-shrink-0 shadow-lg shadow-planet-purple/20">
                        <FiInbox className="text-white" size={20} />
                      </div>
                      
                      {/* 任务标题 */}
                      <h3 className="font-bold text-gray-900 text-lg truncate">{proposal.title}</h3>
                    </div>
                    
                    {/* 状态标签 */}
                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 ${
                      proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      proposal.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {proposal.status === 'pending' && <FiClock size={14} />}
                      {proposal.status === 'approved' && <FiCheckCircle size={14} />}
                      {proposal.status === 'rejected' && <FiXCircle size={14} />}
                      <span>{proposal.status === 'pending' ? '待审核' :
                       proposal.status === 'approved' ? '已通过' : '已拒绝'}</span>
                    </span>
                  </div>
                  
                  {/* 中间：类型标签和描述 */}
                  <div className="mb-5">
                    {/* 类型和难度标签 */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                        proposal.gender === 'male' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        proposal.gender === 'female' ? 'bg-pink-50 text-pink-700 border border-pink-100' :
                        'bg-purple-50 text-purple-700 border border-purple-100'
                      }`}>
                        {proposal.gender === 'male' ? '男生专区' :
                         proposal.gender === 'female' ? '女生专区' : '通用'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                        proposal.difficulty === 'easy' ? 'bg-green-50 text-green-700 border border-green-100' :
                        proposal.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {proposal.difficulty === 'easy' ? '简单' :
                         proposal.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                    </div>
                    
                    {/* 描述 */}
                    <p className="text-gray-600 leading-relaxed mb-0">{proposal.description}</p>
                  </div>
                  
                  {/* 底部：用户信息和操作按钮 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-gray-100 gap-4">
                    {/* 左侧：用户信息 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                        <FiUser size={14} className="text-gray-400" />
                        <span className="text-gray-500">提议人: <span className="font-medium text-gray-700">{proposal.user?.username || '未知用户'}</span></span>
                      </span>
                      <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                        <FiMessageSquare size={14} className="text-gray-400" />
                        <span className="text-gray-500">邮箱: <span className="font-medium text-gray-700">{proposal.user?.email || '未知邮箱'}</span></span>
                      </span>
                      <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                        <FiCalendar size={14} className="text-gray-400" />
                        <span className="text-gray-500">提交: {new Date(proposal.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                    
                    {/* 右侧：操作按钮 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenEditProposal(proposal)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <FiEdit2 size={16} />
                        <span>编辑</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <FiTrash2 size={16} />
                        <span>删除</span>
                      </button>
                      {proposal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(proposal)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <FiCheckCircle size={16} />
                            <span>通过</span>
                          </button>
                          <button
                            onClick={() => handleRejectProposal(proposal.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <FiXCircle size={16} />
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
            <div className="flex-grow flex flex-col">
              {/* 任务列表 - 居中70%宽度 */}
              <div className="space-y-0">
                {tasks.map((task, index) => renderTaskRow(task, index))}
              </div>
              
              {/* 分页 */}
              {!loading && (
                <div className="flex items-center justify-center mt-8 mt-auto py-6 border-t border-gray-100">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 shadow-sm hover:shadow"
                    >
                      <FiChevronLeft size={16} className="mr-1" />
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
                          className={`px-4 py-2.5 rounded-lg border font-medium transition-all duration-300 shadow-sm hover:shadow ${currentPage === pageNum
                            ? 'bg-gradient-to-r from-planet-purple to-planet-pink text-white border-planet-purple'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 shadow-sm hover:shadow"
                    >
                      <span>下一页</span>
                      <FiChevronRight size={16} className="ml-1" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* 审核任务提议模态框 */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">审核任务提议</h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            {approvingProposal && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
                  <input
                    type="text"
                    value={approvingProposal.title}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户提交的难度</label>
                  <input
                    type="text"
                    value={approvingProposal.difficulty === 'easy' ? '简单' : approvingProposal.difficulty === 'medium' ? '中等' : '困难'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">后台实际难度</label>
                  <select
                    value={approveForm.difficulty}
                    onChange={(e) => setApproveForm({ ...approveForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleApproveProposal}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
                  >
                    确认通过
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

              {/* 建议游玩时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">建议游玩时间（可选）</label>
                <input
                  type="text"
                  value={editProposalForm.suggestedTime}
                  onChange={(e) => setEditProposalForm({ ...editProposalForm, suggestedTime: e.target.value })}
                  placeholder="例如：30分钟、1小时"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              {/* 任务道具 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务道具（可选，多个道具用逗号分隔）</label>
                <input
                  type="text"
                  value={editProposalForm.items}
                  onChange={(e) => setEditProposalForm({ ...editProposalForm, items: e.target.value })}
                  placeholder="例如：手机、笔记本、相机"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
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
