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
    ]
  });

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
          footerSocial: []
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
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center">
                <span className="text-white font-bold">菜</span>
              </div>
              <span className="font-bold text-xl">菜菜星球</span>
            </div>
            <p className="text-gray-400 text-sm">
              {configs.footerAbout}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">导航</h4>
            <ul className="space-y-2 text-gray-400">
              {configs.footerLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.url} 
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
          <div>
            <h4 className="font-bold mb-4">社交链接</h4>
            <ul className="space-y-2 text-gray-400">
              {configs.footerSocial.map((social, index) => (
                <li key={index}>
                  <a 
                    href={social.url} 
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
          <div>
            <h4 className="font-bold mb-4">联系我们</h4>
            <p className="text-gray-400 text-sm">
              如有任何问题或建议，欢迎联系我们
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>{configs.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;