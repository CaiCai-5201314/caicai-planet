import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Footer() {
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
    footerShowAppreciation: 'true',
    footerAppreciationTitle: '支持我们',
    footerAppreciationImage: '',
    footerAppreciationDescription: '如果您喜欢我们的内容，欢迎打赏支持',
    footerLayout: 'grid'
  });

  const [showAppreciationModal, setShowAppreciationModal] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await api.get('/site-configs');
      if (response.data.configs) {
        const newConfigs = {
          footerCopyright: response.data.configs.footerCopyright || configs.footerCopyright,
          footerAbout: response.data.configs.footerAbout || configs.footerAbout,
          footerLinks: [],
          footerSocial: [],
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
          footerShowAppreciation: response.data.configs.footerShowAppreciation || configs.footerShowAppreciation,
          footerAppreciationTitle: response.data.configs.footerAppreciationTitle || configs.footerAppreciationTitle,
          footerAppreciationImage: response.data.configs.footerAppreciationImage || configs.footerAppreciationImage,
          footerAppreciationDescription: response.data.configs.footerAppreciationDescription || configs.footerAppreciationDescription,
          footerLayout: response.data.configs.footerLayout || configs.footerLayout
        };

        // 解析导航链接
        if (response.data.configs.footerLinks) {
          try {
            newConfigs.footerLinks = JSON.parse(response.data.configs.footerLinks);
          } catch (error) {
            console.error('解析导航链接失败:', error);
            newConfigs.footerLinks = configs.footerLinks;
          }
        } else {
          newConfigs.footerLinks = configs.footerLinks;
        }

        // 解析社交链接
        if (response.data.configs.footerSocial) {
          try {
            newConfigs.footerSocial = JSON.parse(response.data.configs.footerSocial);
          } catch (error) {
            console.error('解析社交链接失败:', error);
            newConfigs.footerSocial = configs.footerSocial;
          }
        } else {
          newConfigs.footerSocial = configs.footerSocial;
        }

        setConfigs(newConfigs);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  return (
    <>
      <footer 
        style={{ 
          backgroundColor: configs.footerBackgroundColor,
          color: configs.footerTextColor,
          paddingTop: configs.footerPaddingTop,
          paddingBottom: configs.footerPaddingBottom
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 根据布局方式渲染不同的结构 */}
          {configs.footerLayout === 'grid' && (
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {configs.footerShowLogo === 'true' && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
                      <span className="text-white font-bold">菜</span>
                    </div>
                    <span className="font-bold text-xl">菜菜星球</span>
                  </div>
                  <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm">
                    {configs.footerAbout}
                  </p>
                </div>
              )}
              
              {configs.footerShowNavigation === 'true' && (
                <div>
                  <h4 className="font-bold mb-4">导航</h4>
                  <ul className="space-y-2">
                    {configs.footerLinks.map((link, index) => (
                      <li key={index}>
                        <Link 
                          to={link.url} 
                          style={{ color: `${configs.footerTextColor}80` }}
                          className="hover:text-white transition-colors"
                          target={link.url.startsWith('http') ? '_blank' : '_self'}
                          rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configs.footerShowSocial === 'true' && (
                <div>
                  <h4 className="font-bold mb-4">社交链接</h4>
                  <ul className="space-y-2">
                    {configs.footerSocial.map((social, index) => (
                      <li key={index}>
                        <a 
                          href={social.url} 
                          style={{ color: `${configs.footerTextColor}80` }}
                          className="hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configs.footerShowContact === 'true' && (
                <div>
                  <h4 className="font-bold mb-4">联系我们</h4>
                  <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm mb-4">
                    {configs.footerContact}
                  </p>
                  {configs.footerShowAppreciation === 'true' && configs.footerAppreciationImage && (
                    <button
                      onClick={() => setShowAppreciationModal(true)}
                      style={{ color: configs.footerTextColor }}
                      className="text-sm font-bold hover:underline transition-colors"
                    >
                      {configs.footerAppreciationTitle}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {configs.footerLayout === 'flex' && (
            <div className="flex flex-wrap justify-between items-start gap-8 mb-8">
              {configs.footerShowLogo === 'true' && (
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
                      <span className="text-white font-bold">菜</span>
                    </div>
                    <span className="font-bold text-xl">菜菜星球</span>
                  </div>
                  <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm">
                    {configs.footerAbout}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-8">
                {configs.footerShowNavigation === 'true' && (
                  <div>
                    <h4 className="font-bold mb-4">导航</h4>
                    <ul className="space-y-2">
                      {configs.footerLinks.map((link, index) => (
                        <li key={index}>
                          <Link 
                            to={link.url} 
                            style={{ color: `${configs.footerTextColor}80` }}
                            className="hover:text-white transition-colors"
                            target={link.url.startsWith('http') ? '_blank' : '_self'}
                            rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {configs.footerShowSocial === 'true' && (
                  <div>
                    <h4 className="font-bold mb-4">社交链接</h4>
                    <ul className="space-y-2">
                      {configs.footerSocial.map((social, index) => (
                        <li key={index}>
                          <a 
                            href={social.url} 
                            style={{ color: `${configs.footerTextColor}80` }}
                            className="hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {social.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {configs.footerShowContact === 'true' && (
                  <div>
                    <h4 className="font-bold mb-4">联系我们</h4>
                    <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm mb-4">
                      {configs.footerContact}
                    </p>
                    {configs.footerShowAppreciation === 'true' && configs.footerAppreciationImage && (
                      <button
                        onClick={() => setShowAppreciationModal(true)}
                        style={{ color: configs.footerTextColor }}
                        className="text-sm font-medium hover:underline transition-colors"
                      >
                        {configs.footerAppreciationTitle}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {configs.footerLayout === 'stacked' && (
            <div className="text-center mb-8">
              {configs.footerShowLogo === 'true' && (
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
                      <span className="text-white font-bold">菜</span>
                    </div>
                    <span className="font-bold text-xl">菜菜星球</span>
                  </div>
                  <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm max-w-md mx-auto">
                    {configs.footerAbout}
                  </p>
                </div>
              )}
              
              {configs.footerShowNavigation === 'true' && (
                <div className="mb-6">
                  <ul className="flex flex-wrap justify-center gap-6">
                    {configs.footerLinks.map((link, index) => (
                      <li key={index}>
                        <Link 
                          to={link.url} 
                          style={{ color: `${configs.footerTextColor}80` }}
                          className="hover:text-white transition-colors"
                          target={link.url.startsWith('http') ? '_blank' : '_self'}
                          rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configs.footerShowSocial === 'true' && (
                <div className="mb-6">
                  <ul className="flex flex-wrap justify-center gap-6">
                    {configs.footerSocial.map((social, index) => (
                      <li key={index}>
                        <a 
                          href={social.url} 
                          style={{ color: `${configs.footerTextColor}80` }}
                          className="hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {configs.footerShowContact === 'true' && (
                <div className="mb-6">
                  <p style={{ color: `${configs.footerTextColor}80` }} className="text-sm mb-4">
                    {configs.footerContact}
                  </p>
                  {configs.footerShowAppreciation === 'true' && configs.footerAppreciationImage && (
                    <button
                      onClick={() => setShowAppreciationModal(true)}
                      style={{ color: configs.footerTextColor }}
                      className="text-sm font-bold hover:underline transition-colors"
                    >
                      {configs.footerAppreciationTitle}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          
          {configs.footerShowCopyright === 'true' && (
            <div 
              className="pt-8 border-t text-center text-sm"
              style={{ borderColor: `${configs.footerTextColor}20` }}
            >
              <p style={{ color: `${configs.footerTextColor}80` }}>
                {configs.footerCopyright}
              </p>
            </div>
          )}
        </div>
      </footer>

      {/* 赞赏码弹窗 */}
      {showAppreciationModal && configs.footerAppreciationImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold" style={{ color: configs.footerBackgroundColor }}>
                {configs.footerAppreciationTitle}
              </h4>
              <button
                onClick={() => setShowAppreciationModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img 
                src={configs.footerAppreciationImage} 
                alt="赞赏码" 
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>
            {configs.footerAppreciationDescription && (
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                {configs.footerAppreciationDescription}
              </p>
            )}
            <div className="text-center">
              <button
                onClick={() => setShowAppreciationModal(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;