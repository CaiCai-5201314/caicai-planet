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
    ]
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
            : configs.footerSocial
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
        { key: 'footerSocial', value: JSON.stringify(configs.footerSocial), description: '页尾社交链接' }
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

  // 更新社交链接
  const updateFooterSocial = (index, field, value) => {
    setConfigs(prev => {
      const newSocial = [...prev.footerSocial];
      newSocial[index] = {
        ...newSocial[index],
        [field]: value
      };
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
              </label>
              <button
                onClick={addFooterSocial}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-planet-purple text-white rounded hover:bg-planet-purple/90 transition-colors"
              >
                <FiPlus size={14} />
                <span>添加社交</span>
              </button>
            </div>
            <div className="space-y-3">
              {configs.footerSocial.map((social, index) => (
                <div key={index} className="flex space-x-3 items-center p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={social.name}
                      onChange={(e) => updateFooterSocial(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                      placeholder="社交名称"
                    />
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateFooterSocial(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple mb-2"
                      placeholder="社交URL"
                    />
                    <input
                      type="text"
                      value={social.icon}
                      onChange={(e) => updateFooterSocial(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                      placeholder="图标名称 (如: github, weibo)"
                    />
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