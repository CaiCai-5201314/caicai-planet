import api from '../services/api';
import { setManualLogout } from '../services/api';

class SessionChecker {
  constructor() {
    this.checkInterval = null;
    this.checkIntervalTime = 10 * 60 * 1000; // 10分钟检查一次
    this.isManualLogout = false;
  }
  
  // 设置是否是主动退出登录
  setManualLogout(value) {
    this.isManualLogout = value;
    setManualLogout(value);
  }

  /**
   * 开始定期检查登录状态
   */
  startChecking() {
    this.stopChecking();
    this.checkInterval = setInterval(() => {
      this.checkSessionStatus();
    }, this.checkIntervalTime);
  }

  /**
   * 停止定期检查
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 检查登录状态
   */
  async checkSessionStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      await api.get('/auth/me');
    } catch (error) {
      // 401错误已经在api.js中统一处理了
    }
  }
}

// 导出单例
export default new SessionChecker();