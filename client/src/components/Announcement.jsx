import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import announcementService from '../services/announcementService';
import { useAuthStore } from '../store/authStore';

export default function Announcement() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [showHeavyModal, setShowHeavyModal] = useState(false);
  const [currentHeavyAnnouncement, setCurrentHeavyAnnouncement] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await announcementService.getActiveAnnouncements();
        const unreadHeavyAnnouncement = data.find(ann => ann.level === 'heavy' && !ann.is_read);
        
        if (unreadHeavyAnnouncement) {
          setCurrentHeavyAnnouncement(unreadHeavyAnnouncement);
          setShowHeavyModal(true);
        } else {
          setShowHeavyModal(false);
        }
      } catch (error) {
        console.error('获取公告失败:', error);
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
      try {
        await announcementService.markAsRead(currentHeavyAnnouncement.id);
        await fetchAnnouncements();
      } catch (error) {
        console.error('标记公告已读失败:', error);
      }
      setShowHeavyModal(false);
    }
  }, [currentHeavyAnnouncement, fetchAnnouncements]);

  if (!showHeavyModal || !currentHeavyAnnouncement || location.pathname.includes('/admin')) {
    return null;
  }

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999999999,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        pointerEvents: 'auto',
        boxSizing: 'border-box'
      }}
      onClick={handleCloseHeavyModal}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题区域 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            公告详情
          </h2>
          <button
            onClick={handleCloseHeavyModal}
            style={{
              padding: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#999'
            }}
          >
            ×
          </button>
        </div>

        {/* 内容区域 - 可自由滚动 */}
        <div style={{
          padding: '20px',
          maxHeight: '400px',
          overflowY: 'auto',
          color: '#333',
          lineHeight: '1.6',
          wordBreak: 'break-word',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'auto'
        }}>
          <div 
            dangerouslySetInnerHTML={{ __html: currentHeavyAnnouncement.content || '' }} 
          />
        </div>

        {/* 按钮区域 */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'right'
        }}>
          <button
            onClick={handleCloseHeavyModal}
            style={{
              padding: '8px 20px',
              backgroundColor: '#1890ff',
              color: '#fff',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            我知道了
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
