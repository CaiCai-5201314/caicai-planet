import React, { useState, useEffect } from 'react';
import { FiCalendar, FiAward, FiSettings, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiCheck, FiHelpCircle, FiEye, FiCoffee } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import toast from 'react-hot-toast';

const LabManagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [qaItems, setQaItems] = useState([]);
  const [diceRecords, setDiceRecords] = useState([]);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewingEvent, setIsViewingEvent] = useState(false);
  
  // 表单状态
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    reward_type: 'points',
    custom_reward_type: '',
    reward_value: ''
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
  
  // 设置表单状态
  const [settingsForm, setSettingsForm] = useState({
    labEnabled: true,
    eventMaxParticipants: 100,
    achievementThreshold: 5,
    rewardMultiplier: 1.0,
    customMessage: '欢迎来到星球实验室！',
    // 骰子游戏设置
    diceEnabled: true,
    diceMaxRollsPerHour: 1,
    diceSuccessReward: 0,
    diceSuccessMessage: '恭喜你！投中了 {value} 点，允许做你想做的事情！',
    diceFailureMessage: '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！'
  });
  
  // 赞赏码配置表单状态
  const [appreciationForm, setAppreciationForm] = useState({
    qrCodeUrl: '',
    alipayQrCodeUrl: '',
    wechatQrCodeUrl: '',
    enabled: true,
    description: '如果你喜欢我们的服务，可以请我们喝杯咖啡！'
  });
  
  const [isSavingAppreciation, setIsSavingAppreciation] = useState(false);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行请求数据
      const [eventsRes, achievementsRes, qaRes, settingsRes, diceRecordsRes, appreciationRes] = await Promise.all([
        api.get('/lab/events'),
        api.get('/lab/achievements'),
        api.get('/lab/qa'),
        api.get('/lab/settings'),
        api.get('/lab/dice/records'),
        api.get('/lab/appreciation')
      ]);

      setEvents(eventsRes.data.events);
      setAchievements(achievementsRes.data.achievements);
      setQaItems(qaRes.data.qa || []);
      setDiceRecords(diceRecordsRes.data.records || []);
      
      // 更新设置表单
      if (settingsRes.data.settings) {
        setSettingsForm(settingsRes.data.settings);
      }
      
      // 更新赞赏码配置
      if (appreciationRes.data) {
        setAppreciationForm(appreciationRes.data);
      }
    } catch (error) {
      console.error('获取实验室数据失败:', error);
      toast.error('获取实验室数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 赞赏码配置管理
  const handleAppreciationInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppreciationForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleSaveAppreciation = async () => {
    try {
      setIsSavingAppreciation(true);
      await api.put('/lab/appreciation', appreciationForm);
      toast.success('赞赏码配置更新成功');
    } catch (error) {
      console.error('更新赞赏码配置失败:', error);
      toast.error('更新赞赏码配置失败');
    } finally {
      setIsSavingAppreciation(false);
    }
  };
  
  // 上传赞赏码图片
  const handleUploadAppreciationImage = async (file, imageType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'appreciation');
      
      const response = await api.post('/lab/appreciation/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const url = `http://localhost:3002${response.data.url}`;
        if (imageType === 'wechat') {
          setAppreciationForm(prev => ({ ...prev, wechatQrCodeUrl: url }));
        } else if (imageType === 'alipay') {
          setAppreciationForm(prev => ({ ...prev, alipayQrCodeUrl: url }));
        }
        toast.success('上传成功');
      } else {
        toast.error(response.data.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败');
    }
  };
  
  const handleDrop = (e, imageType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUploadAppreciationImage(file, imageType);
    } else {
      toast.error('请上传图片文件');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 事件管理
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async () => {
    try {
      // 验证时间格式
      if (!eventForm.start_time || !eventForm.end_time) {
        toast.error('请选择开始时间和结束时间');
        return;
      }
      
      // 验证结束时间必须晚于开始时间
      if (new Date(eventForm.end_time) <= new Date(eventForm.start_time)) {
        toast.error('结束时间必须晚于开始时间');
        return;
      }
      
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        reward_type: eventForm.reward_type,
        reward_value: eventForm.reward_value
      };
      
      await api.post('/lab/events', eventData);
      toast.success('创建活动成功');
      setEventForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        reward_type: 'points',
        custom_reward_type: '',
        reward_value: ''
      });
      setIsAddingEvent(false);
      fetchData();
    } catch (error) {
      console.error('创建活动失败:', error);
      toast.error('创建活动失败');
    }
  };

  const handleEditEvent = (event) => {
    const isCustomReward = !['points', 'exp', 'achievement_points', 'badge'].includes(event.reward_type);
    setEventForm({
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      reward_type: isCustomReward ? 'custom' : event.reward_type,
      custom_reward_type: '',
      reward_value: event.reward_value.toString()
    });
    setEditingEventId(event.id);
  };

  const handleUpdateEvent = async () => {
    try {
      // 验证时间格式
      if (!eventForm.start_time || !eventForm.end_time) {
        toast.error('请选择开始时间和结束时间');
        return;
      }
      
      // 验证结束时间必须晚于开始时间
      if (new Date(eventForm.end_time) <= new Date(eventForm.start_time)) {
        toast.error('结束时间必须晚于开始时间');
        return;
      }
      
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        reward_type: eventForm.reward_type,
        reward_value: eventForm.reward_value
      };
      
      await api.put(`/lab/events/${editingEventId}`, eventData);
      toast.success('更新活动成功');
      setEventForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        reward_type: 'points',
        custom_reward_type: '',
        reward_value: ''
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
  
  const handleViewEvent = async (event) => {
    try {
      setSelectedEvent(event);
      // 获取活动参与者信息
      const res = await api.get(`/lab/events/${event.id}/participants`);
      setEventParticipants(res.data.participants || []);
      setIsViewingEvent(true);
    } catch (error) {
      console.error('获取活动参与者失败:', error);
      // 不显示错误提示，因为可能只是没有用户参加
      setSelectedEvent(event);
      setEventParticipants([]);
      setIsViewingEvent(true);
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
  
  // 设置管理
  const handleSettingsInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      await api.put('/lab/settings', settingsForm);
      toast.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败');
    } finally {
      setIsSavingSettings(false);
    }
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
        <button
          onClick={() => setActiveTab('dice')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'dice'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>骰子游戏</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('diceRecords')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'diceRecords'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>骰子记录</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('appreciation')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'appreciation'
              ? 'bg-planet-purple text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCoffee size={18} />
            <span>赞赏码管理</span>
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
                    <ReactQuill
                      value={eventForm.description}
                      onChange={(value) => setEventForm(prev => ({ ...prev, description: value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动描述"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          ['blockquote', 'code-block'],
                          [{ 'header': 1 }, { 'header': 2 }],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          [{ 'indent': '-1' }, { 'indent': '+1' }],
                          [{ 'direction': 'rtl' }],
                          [{ 'size': ['small', false, 'large', 'huge'] }],
                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'font': [] }],
                          [{ 'align': [] }],
                          ['clean'],
                          ['link', 'image']
                        ]
                      }}
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
                      <div className="relative">
                        <select
                          name="reward_type"
                          value={eventForm.reward_type}
                          onChange={handleEventInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none appearance-none"
                        >
                          <option value="points">月球分</option>
                          <option value="exp">经验值</option>
                          <option value="achievement_points">成就点</option>
                          <option value="badge">特殊徽章</option>
                          <option value="custom">自定义</option>
                        </select>
                      </div>
                    </div>
                    {eventForm.reward_type === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">自定义奖励类型</label>
                        <input
                          type="text"
                          name="custom_reward_type"
                          value={eventForm.custom_reward_type || ''}
                          onChange={handleEventInputChange}
                          placeholder="请输入自定义奖励类型"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励值</label>
                      <input
                        type={eventForm.reward_type === 'custom' ? 'text' : 'number'}
                        name="reward_value"
                        value={eventForm.reward_value}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder={eventForm.reward_type === 'custom' ? '奖励消息' : '奖励值'}
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
                    <ReactQuill
                      value={eventForm.description}
                      onChange={(value) => setEventForm(prev => ({ ...prev, description: value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      placeholder="活动描述"
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          ['blockquote', 'code-block'],
                          [{ 'header': 1 }, { 'header': 2 }],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          [{ 'indent': '-1' }, { 'indent': '+1' }],
                          [{ 'direction': 'rtl' }],
                          [{ 'size': ['small', false, 'large', 'huge'] }],
                          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'font': [] }],
                          [{ 'align': [] }],
                          ['clean'],
                          ['link', 'image']
                        ]
                      }}
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
                      <div className="relative">
                        <select
                          name="reward_type"
                          value={eventForm.reward_type}
                          onChange={handleEventInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none appearance-none"
                        >
                          <option value="points">月球分</option>
                          <option value="exp">经验值</option>
                          <option value="achievement_points">成就点</option>
                          <option value="badge">特殊徽章</option>
                          <option value="custom">自定义</option>
                        </select>
                      </div>
                    </div>
                    {eventForm.reward_type === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">自定义奖励类型</label>
                        <input
                          type="text"
                          name="custom_reward_type"
                          value={eventForm.custom_reward_type || ''}
                          onChange={handleEventInputChange}
                          placeholder="请输入自定义奖励类型"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励值</label>
                      <input
                        type={eventForm.reward_type === 'custom' ? 'text' : 'number'}
                        name="reward_value"
                        value={eventForm.reward_value}
                        onChange={handleEventInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        placeholder={eventForm.reward_type === 'custom' ? '奖励消息' : '奖励值'}
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
                        <div className="text-gray-600 dark:text-gray-400 text-sm mb-3" dangerouslySetInnerHTML={{ __html: event.description }} style={{ maxWidth: '100%', maxHeight: '150px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }} />
                        
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
                          {event.reward_value > 0 && `奖励: ${event.reward_value} ${event.reward_type === 'points' ? '月球分' : event.reward_type === 'exp' ? '经验值' : event.reward_type === 'achievement_points' ? '成就点' : event.reward_type === 'badge' ? '特殊徽章' : event.reward_type}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="删除"
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

        {/* 活动详情弹窗 */}
        {isViewingEvent && selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsViewingEvent(false)}>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">活动详情</h3>
                <button
                  onClick={() => setIsViewingEvent(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动标题</label>
                  <p className="text-gray-900 dark:text-white">{selectedEvent.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动描述</label>
                  <div className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedEvent.description }} style={{ maxWidth: '100%', overflow: 'hidden' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">开始时间</label>
                    <p className="text-gray-700 dark:text-gray-300">{new Date(selectedEvent.start_time).toLocaleString('zh-CN')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">结束时间</label>
                    <p className="text-gray-700 dark:text-gray-300">{new Date(selectedEvent.end_time).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动状态</label>
                  <p className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEventStatusClass(selectedEvent.status)}`}>
                    {selectedEvent.status === 'upcoming' ? '即将开始' : selectedEvent.status === 'active' ? '进行中' : '已结束'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励信息</label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedEvent.reward_value} {selectedEvent.reward_type === 'points' ? '月球分' : selectedEvent.reward_type === 'exp' ? '经验值' : selectedEvent.reward_type === 'achievement_points' ? '成就点' : selectedEvent.reward_type === 'badge' ? '特殊徽章' : selectedEvent.reward_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">创建时间</label>
                  <p className="text-gray-700 dark:text-gray-300">{new Date(selectedEvent.created_at).toLocaleString('zh-CN')}</p>
                </div>
                {selectedEvent.updated_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">更新时间</label>
                    <p className="text-gray-700 dark:text-gray-300">{new Date(selectedEvent.updated_at).toLocaleString('zh-CN')}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">参与者信息</label>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    参与人数: {eventParticipants.length}
                  </p>
                  
                  {eventParticipants.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">暂无用户参加</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              用户ID
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              用户名
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              邮箱
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              状态
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {eventParticipants.map((participant) => (
                            <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {participant.user_uid}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {participant.username}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {participant.email}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${participant.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                  {participant.status === 'completed' ? '已完成' : '已注册'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewingEvent(false)}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">自定义设置</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="labEnabled"
                    checked={settingsForm.labEnabled}
                    onChange={handleSettingsInputChange}
                    className="w-4 h-4 text-planet-purple rounded focus:ring-planet-purple"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">实验室功能启用</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动最大参与人数</label>
                  <input
                    type="number"
                    name="eventMaxParticipants"
                    value={settingsForm.eventMaxParticipants}
                    onChange={handleSettingsInputChange}
                    min="1"
                    max="1000"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">成就解锁阈值</label>
                  <input
                    type="number"
                    name="achievementThreshold"
                    value={settingsForm.achievementThreshold}
                    onChange={handleSettingsInputChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励倍率</label>
                  <input
                    type="number"
                    name="rewardMultiplier"
                    value={settingsForm.rewardMultiplier}
                    onChange={handleSettingsInputChange}
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">自定义欢迎信息</label>
                  <textarea
                    name="customMessage"
                    value={settingsForm.customMessage}
                    onChange={handleSettingsInputChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-6 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors flex items-center gap-2"
                  >
                    {isSavingSettings ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <FiSave size={16} />
                        <span>保存设置</span>
                      </>
                    )}
                  </button>
                </div>
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

        {/* 骰子游戏管理 */}
        {activeTab === 'dice' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">骰子游戏管理</h2>
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">游戏设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-gray-700 dark:text-gray-300">
                        启用骰子游戏
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settingsForm.diceEnabled !== false}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, diceEnabled: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-planet-purple"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        成功奖励
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settingsForm.diceSuccessReward || 0}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, diceSuccessReward: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        用户投中目标数字时获得的月球分奖励
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        成功提示信息
                      </label>
                      <textarea
                        value={settingsForm.diceSuccessMessage || '恭喜你！投中了 {value} 点，允许做你想做的事情！'}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, diceSuccessMessage: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        rows={3}
                        placeholder="恭喜你！投中了 {value} 点，允许做你想做的事情！"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        用户投中目标数字时显示的提示信息，{"{value}"} 会被替换为实际投中的点数
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        失败提示信息
                      </label>
                      <textarea
                        value={settingsForm.diceFailureMessage || '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！'}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, diceFailureMessage: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                        rows={3}
                        placeholder="很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        用户未投中目标数字时显示的提示信息，{"{value}"} 会被替换为实际投中的点数，{"{target}"} 会被替换为目标数字
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">游戏说明</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      骰子游戏规则：
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                      <li>简单难度：系统生成3个不重复的1~6随机数，投中任意一个即可成功</li>
                      <li>中等难度：系统生成2个不重复的1~6随机数，投中任意一个即可成功</li>
                      <li>困难难度：系统生成1个1~6随机数，必须投中该数字才能成功</li>
                      <li>用户每小时只能投掷指定次数</li>
                      <li>投中目标数字后，用户可以做指定的事情</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingSettings ? '保存中...' : '保存设置'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 骰子记录管理 */}
        {activeTab === 'diceRecords' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">骰子投掷记录</h2>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>刷新记录</span>
              </button>
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              {diceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎲</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无投掷记录</h3>
                  <p className="text-gray-600 dark:text-gray-400">用户投掷骰子后，记录会显示在这里</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          用户
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          难度
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          目标数字
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          投掷结果
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          结果
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          提示信息
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {diceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.username}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {record.user_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : record.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {record.difficulty === 'easy' ? '简单' : record.difficulty === 'medium' ? '中等' : '困难'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {record.target_numbers.join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-planet-purple text-white font-bold">
                              {record.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {record.success ? '成功' : '失败'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {record.success_message || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(record.created_at).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 赞赏码管理 */}
        {activeTab === 'appreciation' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">赞赏码管理</h2>
            </div>

            <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 dark:text-gray-300">
                    启用赞赏功能
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={appreciationForm.enabled}
                      onChange={(e) => setAppreciationForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-planet-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-600 after:border-solid after:border-[2px] after:border-transparent after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-planet-purple"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">赞赏描述</label>
                  <textarea
                    name="description"
                    value={appreciationForm.description}
                    onChange={handleAppreciationInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-planet-purple focus:ring-2 focus:ring-planet-purple/20 outline-none"
                    placeholder="输入赞赏描述"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">微信赞赏码</label>
                  {appreciationForm.wechatQrCodeUrl ? (
                    <div className="relative">
                      <img 
                        src={appreciationForm.wechatQrCodeUrl} 
                        alt="微信赞赏码" 
                        className="max-w-xs mx-auto rounded-lg mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('p');
                          errorDiv.className = 'text-gray-500 text-center mb-2';
                          errorDiv.textContent = '图片加载失败';
                          e.target.parentElement.insertBefore(errorDiv, e.target.nextSibling);
                        }}
                      />
                      <button
                        onClick={() => setAppreciationForm(prev => ({ ...prev, wechatQrCodeUrl: '' }))}
                        className="block mx-auto px-4 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        移除图片
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={(e) => handleDrop(e, 'wechat')}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById('wechat-upload').click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-planet-purple hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        id="wechat-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleUploadAppreciationImage(file, 'wechat');
                        }}
                      />
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-600 dark:text-gray-400">点击或拖拽上传微信赞赏码</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">支持 JPG、PNG、GIF 格式</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">支付宝赞赏码</label>
                  {appreciationForm.alipayQrCodeUrl ? (
                    <div className="relative">
                      <img 
                        src={appreciationForm.alipayQrCodeUrl} 
                        alt="支付宝赞赏码" 
                        className="max-w-xs mx-auto rounded-lg mb-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorDiv = document.createElement('p');
                          errorDiv.className = 'text-gray-500 text-center mb-2';
                          errorDiv.textContent = '图片加载失败';
                          e.target.parentElement.insertBefore(errorDiv, e.target.nextSibling);
                        }}
                      />
                      <button
                        onClick={() => setAppreciationForm(prev => ({ ...prev, alipayQrCodeUrl: '' }))}
                        className="block mx-auto px-4 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        移除图片
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={(e) => handleDrop(e, 'alipay')}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById('alipay-upload').click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-planet-purple hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        id="alipay-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleUploadAppreciationImage(file, 'alipay');
                        }}
                      />
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-600 dark:text-gray-400">点击或拖拽上传支付宝赞赏码</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">支持 JPG、PNG、GIF 格式</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveAppreciation}
                    disabled={isSavingAppreciation}
                    className="px-6 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSavingAppreciation ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        <span>保存配置</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabManagement;
