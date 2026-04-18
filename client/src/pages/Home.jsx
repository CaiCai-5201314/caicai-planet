import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiUsers, FiHeart, FiMessageCircle, FiStar, FiZap, FiTarget } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const { fetchUser, user } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, [fetchUser]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        
        {/* 动态背景元素 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-planet-purple/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-planet-pink/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-planet-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* 欢迎标签 */}
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full glass-effect mb-8">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">欢迎来到我的小站</span>
          </div>
          
          {/* 主标题 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            记录生活
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              分享成长
            </span>
          </h1>
          
          {/* 副标题 */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            这是我的个人博客和任务记录空间
            <br />
            在这里记录学习笔记、生活点滴，也欢迎你来交流
          </p>
          
          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to="/community"
                className="group flex items-center space-x-2 px-8 py-4 bg-white text-planet-purple rounded-full font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                <span>进入社区</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group flex items-center space-x-2 px-8 py-4 bg-white text-planet-purple rounded-full font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  <span>注册账号</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/community"
                  className="px-8 py-4 glass-effect text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  随便看看
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* 滚动提示 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/80 rounded-full" />
          </div>
        </div>
      </section>

      {/* 功能特色 Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              这里有什么？
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              一个简单的小站，记录生活，分享知识，一起进步
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiBookOpen,
                title: '文章分享',
                description: '记录学习笔记、技术心得、生活感悟'
              },
              {
                icon: FiTarget,
                title: '任务打卡',
                description: '设定小目标，坚持打卡，养成好习惯'
              },
              {
                icon: FiUsers,
                title: '交流互动',
                description: '欢迎评论交流，一起分享成长'
              },
              {
                icon: FiZap,
                title: '积分系统',
                description: '发布内容和完成任务可以获得积分'
              }
            ].map((feature, index) => (
              <article
                key={index}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-5">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 关于我 Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              关于这个小站
            </h2>
          </header>
          
          <div className="grid lg:grid-cols-2 gap-10">
            <main>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                这是我做的一个个人项目，用来记录自己的学习和生活。
                平时会在这里写一些技术文章、生活随笔，也会发布一些日常任务来督促自己。
              </p>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                如果你对这些内容感兴趣，欢迎注册账号一起交流。
                有任何建议也可以随时告诉我！
              </p>
              
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link to="/community" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2">
                    <span>进入社区</span>
                    <FiArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2">
                      <span>注册账号</span>
                      <FiArrowRight size={18} />
                    </Link>
                    <Link to="/about" className="px-6 py-3 border border-slate-300 text-gray-700 rounded-lg font-medium hover:bg-slate-50 transition-all duration-300">
                      了解更多
                    </Link>
                  </>
                )}
              </div>
            </main>
            
            <aside className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  菜
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">菜菜</div>
                  <div className="text-sm text-gray-500">站长 / 开发者</div>
                </div>
              </div>
              <div className="space-y-3 text-gray-600">
                <p>👋 嗨，我是菜菜，这个网站的开发者</p>
                <p>💻 平时喜欢写代码、学新技术</p>
                <p>✍️ 也会写一些技术博客记录学习过程</p>
                <p>🎯 希望能在这里认识更多志同道合的朋友</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
