import api from './api';

const announcementService = {
  // 获取活跃的公告
  getActiveAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      console.log('API完整响应:', response);
      console.log('response.data:', response.data);
      if (response.data && Array.isArray(response.data.data)) {
        console.log('返回的公告数据:', response.data.data);
        return response.data.data;
      }
      if (response.data && Array.isArray(response.data)) {
        console.log('直接返回数组格式:', response.data);
        return response.data;
      }
      console.log('返回空数组');
      return [];
    } catch (error) {
      console.error('获取公告失败:', error);
      return [];
    }
  },
  
  // 标记公告为已读
  markAsRead: async (announcementId) => {
    try {
      const response = await api.post('/announcements/mark-read', { announcementId });
      return response.data;
    } catch (error) {
      console.error('标记公告已读失败:', error);
      return null;
    }
  }
};

export default announcementService;