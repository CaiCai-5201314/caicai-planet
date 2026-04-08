import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import announcementService from '../services/announcementService';
import { useAuthStore } from '../store/authStore';

export default function Announcement() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [showHeavyModal, setShowHeavyModal] = useState(false);
  const [currentHeavyAnnouncement, setCurrentHeavyAnnouncement] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    if (isAuthenticated) {
      console.log('Fetching announcements...');
      const data = await announcementService.getActiveAnnouncements();
      console.log('Announcements data:', data);
      setAnnouncements(data);

      // 检查是否有未读的重度级别公告
      const unreadHeavyAnnouncement = data.find(ann => ann.level === 'heavy' && !ann.is_read);
      console.log('Unread heavy announcement:', unreadHeavyAnnouncement);
      
      // 只依赖后端的is_read属性来控制弹窗显示
      if (unreadHeavyAnnouncement) {
        setCurrentHeavyAnnouncement(unreadHeavyAnnouncement);
        setShowHeavyModal(true);
      } else {
        // 如果没有未读的重度级别公告，关闭弹窗
        setShowHeavyModal(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements();
    }
  }, [isAuthenticated, fetchAnnouncements]);

  const handleCloseHeavyModal = useCallback(async () => {
    if (currentHeavyAnnouncement) {
      console.log('Marking announcement as read:', currentHeavyAnnouncement.id);
      const markResult = await announcementService.markAsRead(currentHeavyAnnouncement.id);
      console.log('Mark as read result:', markResult);
      
      // 重新获取公告列表，确保后端的is_read状态被正确更新
      await fetchAnnouncements();
      
      // 关闭弹窗
      setShowHeavyModal(false);
    } else {
      setShowHeavyModal(false);
    }
  }, [currentHeavyAnnouncement, fetchAnnouncements]);

  // 过滤出轻度级别的公告
  const lightAnnouncements = announcements.filter(ann => ann.level === 'light');

  console.log('组件渲染状态:');
  console.log('  showHeavyModal:', showHeavyModal);
  console.log('  currentHeavyAnnouncement:', currentHeavyAnnouncement);
  console.log('  announcements:', announcements);
  console.log('  location.pathname:', location.pathname);

  return (
    <>
      {/* 重度级别公告弹窗 - 不在管理员后台页面显示 */}
      {!location.pathname.includes('/admin') && showHeavyModal && currentHeavyAnnouncement && 
        createPortal(
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1rem'
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '42rem',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {currentHeavyAnnouncement.title || '公告标题'}
                </h3>
                <button
                  onClick={handleCloseHeavyModal}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div style={{ maxWidth: '100%', color: '#374151' }}>
                <div dangerouslySetInnerHTML={{ __html: currentHeavyAnnouncement.content || '公告内容' }} />
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseHeavyModal}
                  style={{
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    backgroundColor: '#9333ea',
                    color: 'white',
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7e22ce'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#9333ea'}
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}