import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiSettings, FiCalendar, FiAward, FiUser, FiHelpCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

const Lab = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [qaItems, setQaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewingEvent, setIsViewingEvent] = useState(false);
  const [newEvents, setNewEvents] = useState([]);
  const [showEventNotification, setShowEventNotification] = useState(false);
  // 骰子游戏状态
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [rollResult, setRollResult] = useState(null); // null, success, failure
  const [lastRollTime, setLastRollTime] = useState(() => {
    // 从localStorage中读取最后投掷时间
    const storedTime = localStorage.getItem('diceLastRollTime');
    return storedTime ? parseInt(storedTime) : 0;
  });
  // 骰子游戏设置
  const [diceEnabled, setDiceEnabled] = useState(true);
  const [diceSuccessMessage, setDiceSuccessMessage] = useState('恭喜你！投中了 {value} 点，允许做你想做的事情！');
  const [diceFailureMessage, setDiceFailureMessage] = useState('很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！');
  const [diceMaxRollsPerHour, setDiceMaxRollsPerHour] = useState(1);
  const [diceRollCount, setDiceRollCount] = useState(() => {
    // 从localStorage中读取投掷次数
    const storedCount = localStorage.getItem('diceRollCount');
    return storedCount ? parseInt(storedCount) : 0;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录后访问星球实验室');
      navigate('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 并行请求数据
      const [eventsRes, achievementsRes, userAchievementsRes, userEventsRes, qaRes, settingsRes] = await Promise.all([
        api.get('/lab/events'),
        api.get('/lab/achievements'),
        api.get(`/lab/users/${user.id}/achievements`),
        api.get(`/lab/users/${user.id}/events`),
        api.get('/lab/qa'),
        api.get('/lab/settings')
      ]);

      const fetchedEvents = eventsRes.data.events || [];
      setEvents(fetchedEvents);
      setAchievements(achievementsRes.data.achievements || []);
      setUserAchievements(userAchievementsRes.data.achievements || []);
      setUserEvents(userEventsRes.data.events || []);
      setQaItems(qaRes.data.qa || []);
      
      // 检查骰子游戏是否启用
      if (settingsRes.data.settings) {
        setDiceEnabled(settingsRes.data.settings.diceEnabled !== false);
        setDiceSuccessMessage(settingsRes.data.settings.diceSuccessMessage || '恭喜你！投中了 {value} 点，允许做你想做的事情！');
        setDiceFailureMessage(settingsRes.data.settings.diceFailureMessage || '很遗憾，投中了 {value} 点，目标数字是 {target}。再试一次吧！');
        setDiceMaxRollsPerHour(settingsRes.data.settings.diceMaxRollsPerHour || 1);
      }
      
      // 检查新活动并显示通知
      checkNewEvents(fetchedEvents);
    } catch (error) {
      console.error('获取实验室数据失败:', error);
      toast.error('获取实验室数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  const checkNewEvents = (fetchedEvents) => {
    // 从 localStorage 获取已查看的活动 ID
    const viewedEventIds = JSON.parse(localStorage.getItem('viewedEventIds') || '[]');
    
    // 过滤出未查看过的活动
    const unviewedEvents = fetchedEvents.filter(event => !viewedEventIds.includes(event.id));
    
    if (unviewedEvents.length > 0) {
      setNewEvents(unviewedEvents);
      setShowEventNotification(true);
      
      // 更新已查看的活动 ID
      const updatedViewedIds = [...viewedEventIds, ...unviewedEvents.map(event => event.id)];
      localStorage.setItem('viewedEventIds', JSON.stringify(updatedViewedIds));
    }
  };
  
  const handleCloseNotification = () => {
    setShowEventNotification(false);
  };



  const handleParticipateEvent = async (eventId) => {
    try {
      const response = await api.post(`/lab/events/${eventId}/participate`, { user_id: user.id });
      const successMessage = response.data?.message || '参与活动成功';
      toast.success(successMessage);
      fetchData(); // 重新获取数据
    } catch (error) {
      console.error('参与活动失败:', error);
      const errorMessage = error.response?.data?.message || '参与活动失败';
      toast.error(errorMessage);
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

  const isAchieved = (achievementId) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const isParticipated = (eventId) => {
    return userEvents.some(ue => ue.event_id === eventId);
  };
  
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewingEvent(true);
  };
  
  // 生成目标数字（不重复）
  const generateTargetNumbers = (difficulty) => {
    let count;
    switch (difficulty) {
      case 'easy':
        count = 3;
        break;
      case 'medium':
        count = 2;
        break;
      case 'hard':
        count = 1;
        break;
      default:
        count = 2;
    }
    
    const numbers = new Set();
    while (numbers.size < count) {
      numbers.add(Math.floor(Math.random() * 6) + 1);
    }
    return Array.from(numbers);
  };
  
  // 监听难度变化，生成目标数字
  useEffect(() => {
    setTargetNumbers(generateTargetNumbers(difficulty));
    setRollResult(null);
  }, [difficulty]);
  
  // 骰子投掷函数
  const handleRollDice = async () => {
    if (isRolling) return;
    
    // 检查是否在一小时内已经投掷过多次
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // 检查是否进入了新的小时
    const currentHour = Math.floor(now / oneHour);
    const lastHour = Math.floor(lastRollTime / oneHour);
    
    // 如果进入了新的小时，重置投掷次数
    if (currentHour !== lastHour) {
      setDiceRollCount(0);
      localStorage.setItem('diceRollCount', '0');
    }
    
    // 检查是否达到每小时最大投掷次数
    if (diceRollCount >= diceMaxRollsPerHour) {
      toast.error(`每小时最多只能投掷 ${diceMaxRollsPerHour} 次`);
      return;
    }
    
    setIsRolling(true);
    setRollResult(null);
    
    // 随机生成一个1-6的数字
    const randomValue = Math.floor(Math.random() * 6) + 1;
    
    // 模拟骰子滚动的动画效果
    let rollCount = 0;
    const maxRolls = 10;
    
    const rollInterval = setInterval(() => {
      rollCount++;
      // 随机显示不同的骰子值，模拟滚动效果
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        // 显示最终结果
        setDiceValue(randomValue);
        setIsRolling(false);
        setLastRollTime(now);
        // 存储最后投掷时间到localStorage
        localStorage.setItem('diceLastRollTime', now.toString());
        
        // 增加投掷次数
        const newRollCount = diceRollCount + 1;
        setDiceRollCount(newRollCount);
        localStorage.setItem('diceRollCount', newRollCount.toString());
        
        // 判断是否投中目标数字
        const success = targetNumbers.includes(randomValue);
        setRollResult(success ? 'success' : 'failure');
        
        // 保存骰子游戏记录
        const saveRecord = async () => {
          try {
            await api.post('/lab/dice/records', {
              user_id: user.uid || user.id,
              username: user.username,
              difficulty,
              target_numbers: targetNumbers,
              result: randomValue,
              success,
              success_message: success ? diceSuccessMessage.replace('{value}', randomValue) : ''
            });
          } catch (error) {
            console.error('保存骰子游戏记录失败:', error);
          }
        };
        
        saveRecord();
        
        // 显示结果提示
        if (success) {
          // 替换 {value} 为实际投中的点数
          const successMessage = diceSuccessMessage.replace('{value}', randomValue);
          toast.success(successMessage);
        } else {
          // 替换 {value} 为实际投中的点数，{target} 为目标数字
          const failureMessage = diceFailureMessage
            .replace('{value}', randomValue)
            .replace('{target}', targetNumbers.join(', '));
          toast.error(failureMessage);
        }
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-12 h-12 border-4 border-planet-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-planet-purple to-planet-pink mb-4 shadow-lg shadow-planet-purple/30">
              <FiSettings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              星球实验室
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              探索虚拟活动和成就系统
            </p>
          </div>

          {/* 标签页 */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'events'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                虚拟活动
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'achievements'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                成就勋章
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'qa'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                常见问题
              </button>
              <button
                onClick={() => setActiveTab('dice')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'dice'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                骰子游戏
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            {activeTab === 'events' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiCalendar className="w-6 h-6 text-planet-purple" />
                  虚拟活动
                </h2>
                
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无活动</h3>
                    <p className="text-gray-600 dark:text-gray-400">敬请期待更多精彩活动</p>
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
                              {event.reward_value > 0 && `奖励: ${event.reward_value} ${event.reward_type === 'points' ? '月球分' : event.reward_type === 'exp' ? '经验值' : event.reward_type === 'achievement_points' ? '成就点' : event.reward_type === 'badge' ? '特殊徽章' : event.reward_type}`}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewEvent(event)}
                              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              查看活动详情
                            </button>
                            <button
                              onClick={() => handleParticipateEvent(event.id)}
                              disabled={event.status === 'ended' || isParticipated(event.id)}
                              className={`px-4 py-1 text-sm font-medium rounded-lg transition-colors ${event.status === 'ended' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : isParticipated(event.id) ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' : 'bg-planet-purple text-white hover:bg-planet-purple/90'}`}
                            >
                              {event.status === 'ended' ? '活动已结束' : isParticipated(event.id) ? '已参与' : '立即参与'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiAward className="w-6 h-6 text-planet-purple" />
                  成就勋章
                </h2>
                
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无成就</h3>
                    <p className="text-gray-600 dark:text-gray-400">敬请期待更多成就</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => {
                      const achieved = isAchieved(achievement.id);
                      return (
                        <div key={achievement.id} className={`border rounded-xl p-4 transition-all ${
                          achieved
                            ? 'border-planet-purple bg-planet-purple/5 dark:bg-planet-purple/10'
                            : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              achieved
                                ? 'bg-planet-purple text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            }`}>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              achieved
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {achieved ? '已获得' : '未获得'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiHelpCircle className="w-6 h-6 text-planet-purple" />
                  常见问题
                </h2>
                
                <div className="space-y-4">
                  {qaItems.map((item) => (
                    <div key={item.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {item.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'dice' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-planet-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  骰子游戏
                </h2>
                
                {!diceEnabled ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-6xl mb-4">🔧</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">游戏正在维护中</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                      骰子游戏暂时关闭，正在进行维护和更新。请稍后再试，感谢您的理解！
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    {/* 难度选择 */}
                    <div className="mb-8 w-full max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">选择难度</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setDifficulty('easy')}
                          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${difficulty === 'easy' ? 'bg-planet-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>简单</span>
                            <span className="text-sm">3个目标数字</span>
                          </div>
                          <p className="text-sm mt-1 opacity-80">系统生成3个1~6的随机数，投中任意一个即可成功</p>
                        </button>
                        <button
                          onClick={() => setDifficulty('medium')}
                          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${difficulty === 'medium' ? 'bg-planet-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>中等</span>
                            <span className="text-sm">2个目标数字</span>
                          </div>
                          <p className="text-sm mt-1 opacity-80">系统生成2个1~6的随机数，投中任意一个即可成功</p>
                        </button>
                        <button
                          onClick={() => setDifficulty('hard')}
                          className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${difficulty === 'hard' ? 'bg-planet-purple text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>困难</span>
                            <span className="text-sm">1个目标数字</span>
                          </div>
                          <p className="text-sm mt-1 opacity-80">系统生成1个1~6的随机数，必须投中该数字才能成功</p>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">点击骰子开始投掷</h3>
                      <p className="text-gray-600 dark:text-gray-400">试试你的运气，看看能掷出几点！</p>
                      
                      {/* 目标数字显示 */}
                      {rollResult && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            目标数字: {targetNumbers.join(', ')}
                          </p>
                          <p className={`text-sm font-medium mt-1 ${rollResult === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {rollResult === 'success' ? '🎉 投中了！允许做你想做的事情！' : '❌ 未投中，不允许做该事情'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-8">
                      <button
                        onClick={handleRollDice}
                        disabled={isRolling}
                        className={`w-32 h-32 rounded-2xl bg-white dark:bg-gray-700 border-4 border-planet-purple flex items-center justify-center text-6xl font-bold transition-all duration-300 ${isRolling ? 'animate-spin' : 'hover:scale-105'}`}
                      >
                        {diceValue}
                      </button>
                    </div>
                    
                    <button
                      onClick={handleRollDice}
                      disabled={isRolling}
                      className={`px-8 py-3 bg-planet-purple text-white rounded-lg font-medium hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isRolling ? '投掷中...' : '投掷骰子'}
                    </button>
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      每个小时只能投掷一次
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 活动详情弹窗 */}
            {isViewingEvent && selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">活动详情</h3>
                    <button
                      onClick={() => setIsViewingEvent(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动标题</label>
                      <p className="text-gray-900 dark:text-white">{selectedEvent.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">活动描述</label>
                      <p className="text-gray-700 dark:text-gray-300">{selectedEvent.description}</p>
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
                    {selectedEvent.reward_value > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">奖励信息</label>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedEvent.reward_value} {selectedEvent.reward_type === 'points' ? '月球分' : selectedEvent.reward_type === 'exp' ? '经验值' : selectedEvent.reward_type === 'achievement_points' ? '成就点' : selectedEvent.reward_type === 'badge' ? '特殊徽章' : selectedEvent.reward_type}
                        </p>
                      </div>
                    )}
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

          </div>
        </div>
      </div>

      {/* 新活动通知弹窗 */}
      {showEventNotification && newEvents.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md w-full z-50 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-planet-purple/10 p-2 rounded-lg">
                <FiCalendar className="h-5 w-5 text-planet-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">新活动通知</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  有 {newEvents.length} 个新活动发布了，快来参与吧！
                </p>
                <div className="mt-2 space-y-1">
                  {newEvents.slice(0, 2).map((event, index) => (
                    <div key={event.id} className="text-xs text-gray-500 dark:text-gray-400">
                      {index + 1}. {event.title}
                    </div>
                  ))}
                  {newEvents.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      还有 {newEvents.length - 2} 个活动...
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseNotification}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setActiveTab('events');
                setShowEventNotification(false);
              }}
              className="px-3 py-1.5 bg-planet-purple text-white rounded-lg text-sm font-medium hover:bg-planet-purple/90 transition-colors"
            >
              查看活动
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lab;
