import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageSquare, FiAlertTriangle, FiFileText, FiBell } from 'react-icons/fi';

export default function Notifications() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchNotifications();
    }
  }, [isAuthenticated, navigate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('开始获取通知');
      console.log('本地存储的token:', localStorage.getItem('token'));
      const response = await api.get('/notifications');
      console.log('获取通知成功:', response.data);
      setNotifications(response.data.notifications || []);
      
      // 刷新导航栏的未读通知数量
      try {
        const unreadResponse = await api.get('/notifications/unread-count');
        if (unreadResponse.data && unreadResponse.data.success) {
          window.dispatchEvent(new CustomEvent('updateUnreadCount', { 
            detail: { count: unreadResponse.data.count } 
          }));
        }
      } catch (unreadError) {
        console.error('获取未读通知数量失败:', unreadError);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      console.error('错误响应:', error.response);
      toast.error('获取通知失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('标记已读失败:', error);
      toast.error('操作失败');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
      toast.success('所有通知已标记为已读');
    } catch (error) {
      console.error('批量标记已读失败:', error);
      toast.error('操作失败');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FiHeart size={24} className="text-red-500 fill-red-500" />;
      case 'comment':
        return <FiMessageSquare size={24} className="text-blue-500" />;
      case 'admin':
        return <FiAlertTriangle size={24} className="text-orange-500" />;
      case 'post_approval':
        return <FiFileText size={24} className="text-green-500" />;
      default:
        return <FiBell size={24} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* 背景渐变 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white opacity-80" />
      </div>
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-planet-purple to-planet-pink mb-2">通知</h1>
              <p className="text-gray-600">查看你的最新消息和互动</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 flex items-center space-x-2"
              >
                <FiBell size={16} />
                <span>全部标记为已读</span>
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <FiBell size={32} className="text-planet-purple" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">暂无通知</h3>
                <p className="text-gray-500 max-w-md mx-auto">当有新的互动或系统通知时，会显示在这里</p>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all duration-300"
                  >
                    去探索内容
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 transition-all duration-300 hover:shadow-md hover:shadow-purple-50 ${notification.is_read ? 'bg-gray-50' : 'bg-white border-l-4 border-planet-purple'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`mb-2 ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notification.content}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span>{new Date(notification.created_at).toLocaleString('zh-CN')}</span>
                          {notification.data && notification.data.post_id && (
                            <button
                              onClick={() => navigate(`/posts/${notification.data.post_id}`)}
                              className="ml-4 text-sm text-planet-purple hover:underline"
                            >
                              查看详情
                            </button>
                          )}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-planet-purple/10 text-planet-purple rounded-lg hover:bg-planet-purple/20 transition-colors"
                        >
                          已读
                        </button>
                      )}
                    </div>
                    {notification.data && notification.data.comment && (
                      <div className="mt-4 ml-16 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700">{notification.data.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 统计信息 */}
          {notifications.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                共有 {notifications.length} 条通知，
                {notifications.filter(n => !n.is_read).length} 条未读
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}