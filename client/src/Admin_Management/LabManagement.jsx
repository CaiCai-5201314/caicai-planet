import React, { useState, useEffect } from 'react';
import { FiCalendar, FiAward, FiSettings, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiCheck, FiHelpCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const LabManagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [qaItems, setQaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 表单状态
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    reward_type: 'points',
    reward_value: 0
  });
  
  const [achievementForm, setAchievementForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    condition_type: 'tasks_completed',
    condition_value: 1,
    reward_points: 0
  });
  
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingAchievementId, setEditingAchievementId] = useState(null);
  const [editingQaId, setEditingQaId] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [isAddingQa, setIsAddingQa] = useState(false);
  
  // QA表单状态
  const [qaForm, setQaForm] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行请求数据
      const [eventsRes, achievementsRes, qaRes] = await Promise.all([
        api.get('/lab/events'),
        api.get('/lab/achievements'),
        api.get('/lab/qa')
      ]);

      setEvents(eventsRes.data.events);
      setAchievements(achievementsRes.data.achievements);
      setQaItems(qaRes.data.qa || []);
    } catch (error) {
      console.error('获取实验室数据失败:', error);
      toast.error('获取实验室数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 事件管理
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    try {
      await api.post('/lab/events', eventForm);
      toast.success('创建活动成功');
      setEventForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        reward_type: 'points',
        reward_value: 0
      });
      setIsAddingEvent(false);
      fetchData();
    } catch (error) {
      console.error('创建活动失败:', error);
      toast.error('创建活动失败');
    }
  };

  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      reward_type: event.reward_type,
      reward_value: event.reward_value
    });
    setEditingEventId(event.id);
  };

  const handleUpdateEvent = async () => {
    try {
      await api.put(`/lab/events/${editingEventId}`, eventForm);
      toast.success('更新活动成功');
      setEventForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        reward_type: 'points',
        reward_value: 0
      });
      setEditingEventId(null);
      fetchData();
    } catch (error) {
      console.error('更新活动失败:', error);
      toast.error('更新活动失败');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('确定要删除这个活动吗？')) {
      try {
        await api.delete(`/lab/events/${eventId}`);
        toast.success('删除活动成功');
        fetchData();
      } catch (error) {
        console.error('删除活动失败:', error);
        toast.error('删除活动失败');
      }
    }
  };

  // 成就管理
  const handleAchievementInputChange = (e) => {
    const { name, value } = e.target;
    setAchievementForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAchievement = async () => {
    try {
      await api.post('/lab/achievements', achievementForm);
      toast.success('创建成就成功');
      setAchievementForm({
        name: '',
        description: '',
        icon: '🏆',
        condition_type: 'tasks_completed',
        condition_value: 1,
        reward_points: 0
      });
      setIsAddingAchievement(false);
      fetchData();
    } catch (error) {
      console.error('创建成就失败:', error);
      toast.error('创建成就失败');
    }
  };

  const handleEditAchievement = (achievement) => {
    setAchievementForm({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      condition_type: achievement.condition_type,
      condition_value: achievement.condition_value,
      reward_points: achievement.reward_points
    });
    setEditingAchievementId(achievement.id);
  };

  const handleUpdateAchievement = async () => {
    try {
      await api.put(`/lab/achievements/${editingAchievementId}`, achievementForm);
      toast.success('更新成就成功');
      setAchievementForm({
        name: '',
        description: '',
        icon: '🏆',
        condition_type: 'tasks_completed',
        condition_value: 1,
        reward_points: 0
      });
      setEditingAchievementId(null);
      fetchData();
    } catch (error) {
      console.error('更新成就失败:', error);
      toast.error('更新成就失败');
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (window.confirm('确定要删除这个成就吗？')) {
      try {
        await api.delete(`/lab/achievements/${achievementId}`);
        toast.success('删除成就成功');
        fetchData();
      } catch (error) {
        console.error('删除成就失败:', error);
        toast.error('删除成就失败');
      }
    }
  };

  // QA管理
  const handleQaInputChange = (e) => {
    const { name, value } = e.target;
    setQaForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQa = async () => {
    try {
      await api.post('/lab/qa', qaForm);
      toast.success('创建问题成功');
      setQaForm({
        question: '',
        answer: ''
      });
      setIsAddingQa(false);
      fetchData();
    } catch (error) {
      console.error('创建问题失败:', error);
      toast.error('创建问题失败');
    }
  };

  const handleEditQa = (qa) => {
    setQaForm({
      question: qa.question,
      answer: qa.answer
    });
    setEditingQaId(qa.id);
  };

  const handleUpdateQa = async () => {
    try {
      await api.put(`/lab/qa/${editingQaId}`, qaForm);
      toast.success('更新问题成功');
      setQaForm({
        question: '',
        answer: ''
      });
      setEditingQaId(null);
      fetchData();
    } catch (error) {
      console.error('更新问题失败:', error);
      toast.error('更新问题失败');
    }
  };

  const handleDeleteQa = async (qaId) => {
    if (window.confirm('确定要删除这个问题吗？')) {
      try {
        await api.delete(`/lab/qa/${qaId}`);
        toast.success('删除问题成功');
        fetchData();
      } catch (error) {
        console.error('删除问题失败:', error);
        toast.error('删除问题失败');
      }
    }
  };

  const getEventStatusClass = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'ended': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-planet-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          星球实验室管理
        </h1>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'events'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCalendar size={18} />
            <span>虚拟活动</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiAward size={18} />
            <span>成就勋章</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiSettings size={18} />
            <span>设置</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'qa'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiHelpCircle size={18} />
            <span>常见问题</span>
          </div>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        {/* 虚拟活动管理 */}
        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">虚拟活动管理</h2>
              <button
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={18} />
                <span>添加活动</span>
              </button>
            </div>

            {/* 添加活动表单 */}
            {isAddingEvent && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">添加活动</h3>
                  <button
                    onClick={() => setIsAddingEvent(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
                    <input
                      type="text"
                      name="title"
                      value={eventForm.title}
                      onChange={handleEventInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        name="start_time"
                        value={eventForm.start_time}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={eventForm.end_time}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励类型</label>
                      <select
                        name="reward_type"
                        value={eventForm.reward_type}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      >
                        <option value="points">月球分</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励值</label>
                      <input
                        type="number"
                        name="reward_value"
                        value={eventForm.reward_value}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder="奖励值"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingEvent(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddEvent}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiSave size={16} />
                        <span>保存</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑活动表单 */}
            {editingEventId && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">编辑活动</h3>
                  <button
                    onClick={() => setEditingEventId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
                    <input
                      type="text"
                      name="title"
                      value={eventForm.title}
                      onChange={handleEventInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea
                      name="description"
                      value={eventForm.description}
                      onChange={handleEventInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动描述"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        name="start_time"
                        value={eventForm.start_time}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        name="end_time"
                        value={eventForm.end_time}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励类型</label>
                      <select
                        name="reward_type"
                        value={eventForm.reward_type}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      >
                        <option value="points">月球分</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励值</label>
                      <input
                        type="number"
                        name="reward_value"
                        value={eventForm.reward_value}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder="奖励值"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingEventId(null)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateEvent}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiCheck size={16} />
                        <span>更新</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 活动列表 */}
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无活动</h3>
                <p className="text-gray-600 dark:text-gray-400">点击"添加活动"按钮创建新活动</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {event.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(event.start_time).toLocaleString('zh-CN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(event.end_time).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getEventStatusClass(event.status)
                      }`}>
                        {event.status === 'upcoming' ? '即将开始' : event.status === 'active' ? '进行中' : '已结束'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-planet-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          奖励: {event.reward_value} 月球分
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 成就管理 */}
        {activeTab === 'achievements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">成就勋章管理</h2>
              <button
                onClick={() => setIsAddingAchievement(true)}
                className="flex items-center gap-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={18} />
                <span>添加成就</span>
              </button>
            </div>

            {/* 添加成就表单 */}
            {isAddingAchievement && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">添加成就</h3>
                  <button
                    onClick={() => setIsAddingAchievement(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名称</label>
                    <input
                      type="text"
                      name="name"
                      value={achievementForm.name}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="成就名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea
                      name="description"
                      value={achievementForm.description}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="成就描述"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图标</label>
                    <input
                      type="text"
                      name="icon"
                      value={achievementForm.icon}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="输入表情符号作为图标"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">条件类型</label>
                      <select
                        name="condition_type"
                        value={achievementForm.condition_type}
                        onChange={handleAchievementInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      >
                        <option value="tasks_completed">完成任务</option>
                        <option value="events_participated">参与活动</option>
                        <option value="points_earned">获得积分</option>
                        <option value="posts_created">发布文章</option>
                        <option value="comments_made">发表评论</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">条件值</label>
                      <input
                        type="number"
                        name="condition_value"
                        value={achievementForm.condition_value}
                        onChange={handleAchievementInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder="条件值"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励积分</label>
                    <input
                      type="number"
                      name="reward_points"
                      value={achievementForm.reward_points}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="奖励积分"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingAchievement(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddAchievement}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiSave size={16} />
                        <span>保存</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑成就表单 */}
            {editingAchievementId && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">编辑成就</h3>
                  <button
                    onClick={() => setEditingAchievementId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名称</label>
                    <input
                      type="text"
                      name="name"
                      value={achievementForm.name}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="成就名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                    <textarea
                      name="description"
                      value={achievementForm.description}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="成就描述"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图标</label>
                    <input
                      type="text"
                      name="icon"
                      value={achievementForm.icon}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="输入表情符号作为图标"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">条件类型</label>
                      <select
                        name="condition_type"
                        value={achievementForm.condition_type}
                        onChange={handleAchievementInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      >
                        <option value="tasks_completed">完成任务</option>
                        <option value="events_participated">参与活动</option>
                        <option value="points_earned">获得积分</option>
                        <option value="posts_created">发布文章</option>
                        <option value="comments_made">发表评论</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">条件值</label>
                      <input
                        type="number"
                        name="condition_value"
                        value={achievementForm.condition_value}
                        onChange={handleAchievementInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder="条件值"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励积分</label>
                    <input
                      type="number"
                      name="reward_points"
                      value={achievementForm.reward_points}
                      onChange={handleAchievementInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="奖励积分"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingAchievementId(null)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateAchievement}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiCheck size={16} />
                        <span>更新</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 成就列表 */}
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无成就</h3>
                <p className="text-gray-600 dark:text-gray-400">点击"添加成就"按钮创建新成就</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-planet-purple text-white flex items-center justify-center">
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.condition_type === 'tasks_completed' ? '完成任务' :
                           achievement.condition_type === 'events_participated' ? '参与活动' :
                           achievement.condition_type === 'points_earned' ? '获得积分' :
                           achievement.condition_type === 'posts_created' ? '发布文章' :
                           achievement.condition_type === 'comments_made' ? '发表评论' : '其他'}: {achievement.condition_value}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-planet-purple">
                        奖励: {achievement.reward_points} 月球分
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAchievement(achievement)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAchievement(achievement.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 设置 */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">实验室设置</h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">实验室配置</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                这里可以配置实验室的全局设置，目前暂无需要配置的选项。
              </p>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiSettings size={16} />
                <span className="text-sm">实验室功能已启用</span>
              </div>
            </div>
          </div>
        )}

        {/* 常见问题管理 */}
        {activeTab === 'qa' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">常见问题管理</h2>
              <button
                onClick={() => setIsAddingQa(true)}
                className="flex items-center gap-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={18} />
                <span>添加问题</span>
              </button>
            </div>

            {/* 添加问题表单 */}
            {isAddingQa && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">添加问题</h3>
                  <button
                    onClick={() => setIsAddingQa(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">问题</label>
                    <input
                      type="text"
                      name="question"
                      value={qaForm.question}
                      onChange={handleQaInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="问题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">答案</label>
                    <textarea
                      name="answer"
                      value={qaForm.answer}
                      onChange={handleQaInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="答案"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingQa(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddQa}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiSave size={16} />
                        <span>保存</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑问题表单 */}
            {editingQaId && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">编辑问题</h3>
                  <button
                    onClick={() => setEditingQaId(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">问题</label>
                    <input
                      type="text"
                      name="question"
                      value={qaForm.question}
                      onChange={handleQaInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="问题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">答案</label>
                    <textarea
                      name="answer"
                      value={qaForm.answer}
                      onChange={handleQaInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="答案"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingQaId(null)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateQa}
                      className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <FiCheck size={16} />
                        <span>更新</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 问题列表 */}
            {qaItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无问题</h3>
                <p className="text-gray-600 dark:text-gray-400">点击"添加问题"按钮创建新问题</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qaItems.map((qa) => (
                  <div key={qa.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {qa.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {qa.answer}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditQa(qa)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteQa(qa.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabManagement;
