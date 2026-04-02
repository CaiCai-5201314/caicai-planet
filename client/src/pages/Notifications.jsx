import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

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
      setNotifications(response.data.notifications);
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
        return '❤️';
      case 'comment':
        return '💬';
      case 'admin':
        return '⚠️';
      case 'post_approval':
        return '📝';
      default:
        return '📢';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">通知</h1>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm text-planet-purple hover:bg-planet-purple/10 rounded-lg transition-colors"
              >
                全部标记为已读
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
                <p className="text-gray-500">当有新的互动或系统通知时，会显示在这里</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 ${notification.is_read ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 mb-2">{notification.content}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-planet-purple hover:underline"
                        >
                          标记已读
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}