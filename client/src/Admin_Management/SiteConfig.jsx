import { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

function SiteConfig() {
  // 状态管理
  const [configs, setConfigs] = useState({
    footerCopyright: '© 2024 菜菜星球. 保留所有权利.',
    footerAbout: '菜菜星球是一个分享生活、技术和创意的社区平台。',
    footerLinks: [
      { name: '首页', url: '/' },
      { name: '关于我们', url: '/about' },
      { name: '社区', url: '/community' },
      { name: '友链', url: '/friend-links' }
    ],
    footerSocial: [
      { name: 'GitHub', url: 'https://github.com', icon: 'github' },
      { name: '微博', url: 'https://weibo.com', icon: 'weibo' },
      { name: '微信', url: '#', icon: 'wechat' }
    ],
    footerContact: '如有任何问题或建议，欢迎联系我们',
    footerBackgroundColor: '#1f2937',
    footerTextColor: '#ffffff',
    footerPaddingTop: '3rem',
    footerPaddingBottom: '3rem',
    footerShowLogo: 'true',
    footerShowNavigation: 'true',
    footerShowSocial: 'true',
    footerShowContact: 'true',
    footerShowCopyright: 'true',
    footerLayout: 'grid'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [editingSocial, setEditingSocial] = useState(null);

  // 加载配置
  useEffect(() => {
    loadConfigs();
  }, []);

  // 从后端加载配置
  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/site-configs');
      if (response.data.configs) {
        // 解析JSON格式的配置
        const loadedConfigs = {
          footerCopyright: response.data.configs.footerCopyright || configs.footerCopyright,
          footerAbout: response.data.configs.footerAbout || configs.footerAbout,
          footerLinks: response.data.configs.footerLinks 
            ? JSON.parse(response.data.configs.footerLinks) 
            : configs.footerLinks,
          footerSocial: response.data.configs.footerSocial 
            ? JSON.parse(response.data.configs.footerSocial) 
            : configs.footerSocial,
          footerContact: response.data.configs.footerContact || configs.footerContact,
          footerBackgroundColor: response.data.configs.footerBackgroundColor || configs.footerBackgroundColor,
          footerTextColor: response.data.configs.footerTextColor || configs.footerTextColor,
          footerPaddingTop: response.data.configs.footerPaddingTop || configs.footerPaddingTop,
          footerPaddingBottom: response.data.configs.footerPaddingBottom || configs.footerPaddingBottom,
          footerShowLogo: response.data.configs.footerShowLogo || configs.footerShowLogo,
          footerShowNavigation: response.data.configs.footerShowNavigation || configs.footerShowNavigation,
          footerShowSocial: response.data.configs.footerShowSocial || configs.footerShowSocial,
          footerShowContact: response.data.configs.footerShowContact || configs.footerShowContact,
          footerShowCopyright: response.data.configs.footerShowCopyright || configs.footerShowCopyright,
          footerLayout: response.data.configs.footerLayout || configs.footerLayout
        };
        setConfigs(loadedConfigs);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      toast.error('加载配置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    setSaving(true);
    try {
      // 准备配置数据
      const configData = [
        { key: 'footerCopyright', value: configs.footerCopyright, description: '页尾版权信息' },
        { key: 'footerAbout', value: configs.footerAbout, description: '页尾关于信息' },
        { key: 'footerLinks', value: JSON.stringify(configs.footerLinks), description: '页尾导航链接' },
        { key: 'footerSocial', value: JSON.stringify(configs.footerSocial), description: '页尾社交链接' },
        { key: 'footerContact', value: configs.footerContact, description: '页尾联系我们信息' },
        { key: 'footerBackgroundColor', value: configs.footerBackgroundColor, description: '页尾背景色' },
        { key: 'footerTextColor', value: configs.footerTextColor, description: '页尾文字颜色' },
        { key: 'footerPaddingTop', value: configs.footerPaddingTop, description: '页尾顶部内边距' },
        { key: 'footerPaddingBottom', value: configs.footerPaddingBottom, description: '页尾底部内边距' },
        { key: 'footerShowLogo', value: configs.footerShowLogo, description: '是否显示Logo' },
        { key: 'footerShowNavigation', value: configs.footerShowNavigation, description: '是否显示导航' },
        { key: 'footerShowSocial', value: configs.footerShowSocial, description: '是否显示社交链接' },
        { key: 'footerShowContact', value: configs.footerShowContact, description: '是否显示联系我们' },
        { key: 'footerShowCopyright', value: configs.footerShowCopyright, description: '是否显示版权信息' },
        { key: 'footerLayout', value: configs.footerLayout, description: '页尾布局方式' }
      ];

      // 发送保存请求
      await api.post('/admin/site-configs/batch', { configs: configData });
      toast.success('配置保存成功，已即时生效');
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败，请检查输入内容是否正确');
    } finally {
      setSaving(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (key, value) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 添加导航链接
  const addFooterLink = () => {
    setConfigs(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { name: '新链接', url: '/' }]
    }));
  };

  // 删除导航链接
  const deleteFooterLink = (index) => {
    setConfigs(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index)
    }));
  };

  // 更新导航链接
  const updateFooterLink = (index, field, value) => {
    setConfigs(prev => {
      const newLinks = [...prev.footerLinks];
      newLinks[index] = {
        ...newLinks[index],
        [field]: value
      };
      return {
        ...prev,
        footerLinks: newLinks
      };
    });
  };

  // 添加社交链接
  const addFooterSocial = () => {
    setConfigs(prev => ({
      ...prev,
      footerSocial: [...prev.footerSocial, { name: '新社交', url: '#', icon: 'github' }]
    }));
  };

  // 删除社交链接
  const deleteFooterSocial = (index) => {
    setConfigs(prev => ({
      ...prev,
      footerSocial: prev.footerSocial.filter((_, i) => i !== index)
    }));
  };

  // 根据URL自动识别图标
  const detectIconFromUrl = (url) => {
    const urlLower = url.toLowerCase();
    const iconMap = {
      'github.com': 'github',
      'github.io': 'github',
      'weibo.com': 'weibo',
      'weixin.qq.com': 'wechat',
      'qq.com': 'qq',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'facebook.com': 'facebook',
      'fb.com': 'facebook',
      'instagram.com': 'instagram',
      'linkedin.com': 'linkedin',
      'youtube.com': 'youtube',
      'youtu.be': 'youtube',
      'bilibili.com': 'bilibili',
      'b23.tv': 'bilibili',
      'zhihu.com': 'zhihu',
      'douban.com': 'douban',
      'jianshu.com': 'jianshu',
      'csdn.net': 'csdn',
      'juejin.cn': 'juejin',
      'segmentfault.com': 'segmentfault',
      'gitee.com': 'gitee',
      'taobao.com': 'taobao',
      'tmall.com': 'tmall',
      'jd.com': 'jd',
      'pinduoduo.com': 'pinduoduo',
      'xiaohongshu.com': 'xiaohongshu',
      'douyin.com': 'douyin',
      'kuaishou.com': 'kuaishou'
    };

    for (const [domain, icon] of Object.entries(iconMap)) {
      if (urlLower.includes(domain)) {
        return icon;
      }
    }
    return 'link';
  };

  // 获取社交链接名称
  const getSocialNameFromUrl = (url) => {
    const urlLower = url.toLowerCase();
    const nameMap = {
      'github.com': 'GitHub',
      'github.io': 'GitHub',
      'weibo.com': '微博',
      'weixin.qq.com': '微信',
      'qq.com': 'QQ',
      'twitter.com': 'Twitter',
      'x.com': 'Twitter',
      'facebook.com': 'Facebook',
      'fb.com': 'Facebook',
      'instagram.com': 'Instagram',
      'linkedin.com': 'LinkedIn',
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'bilibili.com': '哔哩哔哩',
      'b23.tv': '哔哩哔哩',
      'zhihu.com': '知乎',
      'douban.com': '豆瓣',
      'jianshu.com': '简书',
      'csdn.net': 'CSDN',
      'juejin.cn': '掘金',
      'segmentfault.com': '思否',
      'gitee.com': 'Gitee',
      'taobao.com': '淘宝',
      'tmall.com': '天猫',
      'jd.com': '京东',
      'pinduoduo.com': '拼多多',
      'xiaohongshu.com': '小红书',
      'douyin.com': '抖音',
      'kuaishou.com': '快手'
    };

    for (const [domain, name] of Object.entries(nameMap)) {
      if (urlLower.includes(domain)) {
        return name;
      }
    }
    return '新社交';
  };

  // 更新社交链接
  const updateFooterSocial = (index, field, value) => {
    setConfigs(prev => {
      const newSocial = [...prev.footerSocial];
      
      // 如果是更新URL，自动设置图标和名称
      if (field === 'url' && value) {
        const detectedIcon = detectIconFromUrl(value);
        const detectedName = getSocialNameFromUrl(value);
        newSocial[index] = {
          ...newSocial[index],
          url: value,
          icon: detectedIcon,
          name: newSocial[index].name === '新社交' ? detectedName : newSocial[index].name
        };
      } else {
        newSocial[index] = {
          ...newSocial[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        footerSocial: newSocial
      };
    });
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <FiSettings className="text-planet-purple" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">网站尾部管理</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-8">
          {/* 版权信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              版权信息
            </label>
            <input
              type="text"
              value={configs.footerCopyright}
              onChange={(e) => handleInputChange('footerCopyright', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="请输入版权信息"
            />
          </div>

          {/* 关于信息 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              关于信息
            </label>
            <textarea
              value={configs.footerAbout}
              onChange={(e) => handleInputChange('footerAbout', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="请输入关于信息"
            />
          </div>

          {/* 导航链接 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                导航链接
              </label>
              <button
                onClick={addFooterLink}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-planet-purple text-white rounded hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={14} />
                <span>添加链接</span>
              </button>
            </div>
            <div className="space-y-3">
              {configs.footerLinks.map((link, index) => (
                <div key={index} className="flex space-x-3 items-center p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateFooterLink(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                      placeholder="链接名称"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                      placeholder="链接URL"
                    />
                  </div>
                  <button
                    onClick={() => deleteFooterLink(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 社交链接 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                社交链接
                <span className="text-xs text-gray-500 ml-2">（输入链接后会自动识别图标和名称）</span>
              </label>
              <button
                onClick={addFooterSocial}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-planet-purple text-white rounded hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={14} />
                <span>添加社交</span>
              </button>
            </div>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 支持自动识别：GitHub、微博、微信、QQ、Twitter、Facebook、Instagram、LinkedIn、YouTube、哔哩哔哩、知乎、豆瓣、简书、CSDN、掘金、思否、Gitee、淘宝、天猫、京东、拼多多、小红书、抖音、快手等
              </p>
            </div>
            <div className="space-y-3">
              {configs.footerSocial.map((social, index) => (
                <div key={index} className="flex space-x-3 items-center p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={social.name}
                        onChange={(e) => updateFooterSocial(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                        placeholder="社交名称"
                      />
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                        {social.icon}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateFooterSocial(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                      placeholder="输入链接，如：https://github.com"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">图标：</span>
                      <input
                        type="text"
                        value={social.icon}
                        onChange={(e) => updateFooterSocial(index, 'icon', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                        placeholder="可手动修改图标"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFooterSocial(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 联系我们 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              联系我们
            </label>
            <textarea
              value={configs.footerContact}
              onChange={(e) => handleInputChange('footerContact', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
              placeholder="请输入联系我们信息"
            />
          </div>

          {/* 样式配置 */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">样式配置</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 背景色 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  背景色
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={configs.footerBackgroundColor}
                    onChange={(e) => handleInputChange('footerBackgroundColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={configs.footerBackgroundColor}
                    onChange={(e) => handleInputChange('footerBackgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>

              {/* 文字颜色 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  文字颜色
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={configs.footerTextColor}
                    onChange={(e) => handleInputChange('footerTextColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={configs.footerTextColor}
                    onChange={(e) => handleInputChange('footerTextColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>

              {/* 顶部内边距 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  顶部内边距
                </label>
                <input
                  type="text"
                  value={configs.footerPaddingTop}
                  onChange={(e) => handleInputChange('footerPaddingTop', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="如: 3rem, 48px"
                />
              </div>

              {/* 底部内边距 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  底部内边距
                </label>
                <input
                  type="text"
                  value={configs.footerPaddingBottom}
                  onChange={(e) => handleInputChange('footerPaddingBottom', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="如: 3rem, 48px"
                />
              </div>

              {/* 布局方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  布局方式
                </label>
                <select
                  value={configs.footerLayout}
                  onChange={(e) => handleInputChange('footerLayout', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  <option value="grid">网格布局</option>
                  <option value="flex">弹性布局</option>
                  <option value="stacked">堆叠布局</option>
                </select>
              </div>
            </div>

            {/* 显示/隐藏选项 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                显示内容
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'footerShowLogo', label: '显示Logo' },
                  { key: 'footerShowNavigation', label: '显示导航' },
                  { key: 'footerShowSocial', label: '显示社交链接' },
                  { key: 'footerShowContact', label: '显示联系我们' },
                  { key: 'footerShowCopyright', label: '显示版权信息' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configs[item.key] === 'true'}
                      onChange={(e) => handleInputChange(item.key, e.target.checked ? 'true' : 'false')}
                      className="w-4 h-4 text-planet-purple border-gray-300 rounded focus:ring-planet-purple"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSave size={18} />
              <span>{saving ? '保存中...' : '保存配置'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">实时预览</h2>
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="mb-4">
              {configs.footerAbout && (
                <p className="text-gray-600 mb-4">{configs.footerAbout}</p>
              )}
              
              {configs.footerLinks && configs.footerLinks.length > 0 && (
                <div className="flex justify-center space-x-6 mb-4">
                  {configs.footerLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className="text-planet-purple hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
              
              {configs.footerSocial && configs.footerSocial.length > 0 && (
                <div className="flex justify-center space-x-4 mb-4">
                  {configs.footerSocial.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="text-planet-purple hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              )}
              
              {configs.footerContact && (
                <p className="text-gray-600 mb-4">{configs.footerContact}</p>
              )}
              
              {configs.footerCopyright && (
                <p className="text-gray-500 text-sm">{configs.footerCopyright}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteConfig;