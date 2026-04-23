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
      const [eventsRes, achievementsRes, userAchievementsRes, userEventsRes, qaRes] = await Promise.all([
        api.get('/lab/events'),
        api.get('/lab/achievements'),
        api.get(`/lab/users/${user.id}/achievements`),
        api.get(`/lab/users/${user.id}/events`),
        api.get('/lab/qa')
      ]);

      setEvents(eventsRes.data.events || []);
      setAchievements(achievementsRes.data.achievements || []);
      setUserAchievements(userAchievementsRes.data.achievements || []);
      setUserEvents(userEventsRes.data.events || []);
      setQaItems(qaRes.data.qa || []);
    } catch (error) {
      console.error('获取实验室数据失败:', error);
      toast.error('获取实验室数据失败');
    } finally {
      setLoading(false);
    }
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
                              奖励: {event.reward_value} 月球分
                            </span>
                          </div>
                          <button
                            onClick={() => handleParticipateEvent(event.id)}
                            disabled={event.status === 'ended' || isParticipated(event.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              event.status === 'ended'
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : isParticipated(event.id)
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-planet-purple text-white hover:bg-planet-purple/90'
                            }`}
                          >
                            {event.status === 'ended' ? '活动已结束' : isParticipated(event.id) ? '已参与' : '立即参与'}
                          </button>
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


          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab;
