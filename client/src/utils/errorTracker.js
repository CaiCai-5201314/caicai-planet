// 错误跟踪器

class ErrorTracker {
  constructor() {
    this.isInitialized = false;
    this.queue = [];
    this.userId = null;
    this.environment = import.meta.env.MODE || 'development';
    this.isFlushing = false;
    this.flushTimeout = null;
    this.maxQueueSize = 100;
    this.seenErrors = new Set(); // 用于去重
    this.errorCacheTimeout = 30000; // 30秒内的相同错误不重复记录
  }

  // 初始化错误跟踪器
  init(userId = null) {
    if (this.isInitialized) return;

    this.userId = userId;
    
    // 捕获未捕获的JavaScript错误
    window.addEventListener('error', this.handleGlobalError.bind(this));
    
    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // 捕获资源加载错误
    this.setupResourceErrorTracking();
    
    // 监控API请求错误
    this.setupApiErrorTracking();
    
    this.isInitialized = true;
    console.log('Error tracker initialized');
  }

  // 捕获全局JavaScript错误
  handleGlobalError(event) {
    event.preventDefault();
    
    this.logError({
      type: 'javascript',
      severity: 'error',
      message: event.message || 'Unknown error',
      stack: event.error?.stack,
      url: event.filename,
      line: event.lineno,
      column: event.colno,
      context: {
        eventType: 'error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    });
  }

  // 捕获未处理的Promise拒绝
  handleUnhandledRejection(event) {
    event.preventDefault();
    
    this.logError({
      type: 'promise',
      severity: 'error',
      message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      context: {
        eventType: 'unhandledrejection',
        timestamp: new Date().toISOString(),
        reason: event.reason
      }
    });
  }

  // 捕获资源加载错误
  setupResourceErrorTracking() {
    // 监听资源加载错误
    document.addEventListener('error', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        let resourceType = 'unknown';
        let resourceUrl = '';
        
        if (target.tagName === 'SCRIPT') {
          resourceType = 'script';
          resourceUrl = target.src;
        } else if (target.tagName === 'LINK') {
          resourceType = 'stylesheet';
          resourceUrl = target.href;
        } else if (target.tagName === 'IMG') {
          resourceType = 'image';
          resourceUrl = target.src;
        } else if (target.tagName === 'VIDEO' || target.tagName === 'AUDIO') {
          resourceType = 'media';
          resourceUrl = target.src;
        }
        
        if (resourceUrl) {
          this.logError({
            type: `resource_${resourceType}`,
            severity: 'warning',
            message: `Failed to load ${resourceType}: ${resourceUrl}`,
            context: {
              eventType: 'resource_error',
              resourceType,
              resourceUrl,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }, true);
  }

  // 监控API请求错误
  setupApiErrorTracking() {
    // 保存原始的fetch方法
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options) => {
      // 跳过错误日志自己的API，避免无限循环
      if (typeof url === 'string' && url.includes('/api/error/log')) {
        return originalFetch(url, options);
      }
      
      try {
        const response = await originalFetch(url, options);
        
        if (!response.ok) {
          this.logError({
            type: 'api',
            severity: 'error',
            message: `API request failed: ${url} (${response.status})`,
            context: {
              eventType: 'api_error',
              url,
              method: options?.method || 'GET',
              status: response.status,
              statusText: response.statusText,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        return response;
      } catch (error) {
        this.logError({
          type: 'api',
          severity: 'error',
          message: `API request failed: ${url} - ${error.message}`,
          stack: error.stack,
          context: {
            eventType: 'api_error',
            url,
            method: options?.method || 'GET',
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
        
        throw error;
      }
    };
  }

  // 生成错误指纹，用于去重
  getErrorFingerprint(errorData) {
    return `${errorData.type}-${errorData.message}`;
  }

  // 检查是否应该跳过这个错误
  shouldSkipError(errorData) {
    // 跳过一些特定的资源错误
    if (errorData.type && errorData.type.startsWith('resource_')) {
      // 跳过头像加载失败（可能是正常的）
      if (errorData.context?.resourceUrl && 
          (errorData.context.resourceUrl.includes('/uploads/avatars/') || 
           errorData.context.resourceUrl.includes('default.png'))) {
        return true;
      }
    }
    return false;
  }

  // 手动记录错误
  logError(errorData) {
    // 检查是否应该跳过这个错误
    if (this.shouldSkipError(errorData)) {
      return;
    }

    const fingerprint = this.getErrorFingerprint(errorData);
    
    // 检查是否在缓存时间内已经记录过相同错误
    if (this.seenErrors.has(fingerprint)) {
      return;
    }

    const error = {
      ...errorData,
      userId: this.userId,
      environment: this.environment,
      url: errorData.url || window.location.href,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    };

    // 添加到去重缓存
    this.seenErrors.add(fingerprint);
    
    // 一段时间后清除缓存，允许重新记录
    setTimeout(() => {
      this.seenErrors.delete(fingerprint);
    }, this.errorCacheTimeout);

    // 添加到队列
    this.queue.push(error);
    
    // 限制队列大小，防止内存溢出
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }
    
    // 延迟发送，合并多个错误
    this.scheduleFlush();
  }

  // 调度发送
  scheduleFlush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flushQueue();
    }, 1000); // 1秒后发送
  }

  // 获取设备信息
  getDeviceInfo() {
    return {
      browser: this.getBrowserInfo(),
      os: this.getOSInfo(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio
      },
      language: navigator.language,
      online: navigator.onLine,
      platform: navigator.platform
    };
  }

  // 获取浏览器信息
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
      version = ua.match(/Edge\/(\d+\.\d+)/)[1];
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) {
      browser = 'Internet Explorer';
      version = ua.match(/(?:MSIE|rv:)\s*(\d+\.\d+)/)[1];
    }
    
    return { name: browser, version };
  }

  // 获取操作系统信息
  getOSInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Windows') > -1) {
      os = 'Windows';
      if (ua.indexOf('Windows NT 10.0') > -1) version = '10';
      else if (ua.indexOf('Windows NT 6.3') > -1) version = '8.1';
      else if (ua.indexOf('Windows NT 6.2') > -1) version = '8';
      else if (ua.indexOf('Windows NT 6.1') > -1) version = '7';
      else if (ua.indexOf('Windows NT 6.0') > -1) version = 'Vista';
      else if (ua.indexOf('Windows NT 5.1') > -1) version = 'XP';
    } else if (ua.indexOf('Macintosh') > -1) {
      os = 'macOS';
      version = ua.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    } else if (ua.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      os = 'Android';
      version = ua.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      os = 'iOS';
      version = ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
    }
    
    return { name: os, version };
  }

  // 发送错误到服务器
  async flushQueue() {
    if (this.queue.length === 0 || this.isFlushing) return;
    
    this.isFlushing = true;
    const errorsToSend = [...this.queue];
    this.queue = [];
    
    try {
      // 批量发送错误
      for (const error of errorsToSend) {
        await fetch('/api/error/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(error)
        });
      }
    } catch (error) {
      // 如果发送失败，将错误重新加入队列（如果队列还没满）
      if (this.queue.length + errorsToSend.length <= this.maxQueueSize) {
        this.queue.unshift(...errorsToSend);
      }
      console.error('Failed to send error logs:', error);
    } finally {
      this.isFlushing = false;
    }
  }

  // 设置用户ID
  setUserId(userId) {
    this.userId = userId;
  }

  // 手动记录API错误
  logApiError(url, method, error, status) {
    this.logError({
      type: 'api',
      severity: 'error',
      message: `API error: ${method} ${url} - ${error.message || 'Unknown error'}`,
      stack: error.stack,
      context: {
        url,
        method,
        status,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  // 记录自定义错误
  logCustomError(message, context = {}) {
    this.logError({
      type: 'custom',
      severity: 'error',
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // 记录警告
  logWarning(message, context = {}) {
    this.logError({
      type: 'warning',
      severity: 'warning',
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// 导出单例
const errorTracker = new ErrorTracker();
export default errorTracker;
