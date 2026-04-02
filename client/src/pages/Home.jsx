import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiUsers, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-planet-purple/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-planet-pink/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-planet-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm">欢迎来到菜菜星球</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            探索创意的
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              无限宇宙
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            菜菜星球是一个充满创意与分享的技术社区，在这里你可以发现有趣的文章、结识志同道合的朋友、分享你的知识与经验。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/community"
              className="group flex items-center space-x-2 px-8 py-4 bg-white text-planet-purple rounded-full font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
            >
              <span>开始探索</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 glass-effect text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
            >
              了解更多
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/80 rounded-full" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择<span className="text-gradient">菜菜星球</span>？
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们致力于打造一个开放、友好、充满活力的技术社区
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FiBookOpen,
                title: '优质内容',
                description: '汇聚各领域优质文章，从技术教程到生活分享，总有你感兴趣的内容'
              },
              {
                icon: FiUsers,
                title: '活跃社区',
                description: '与志同道合的朋友交流互动，共同成长进步'
              },
              {
                icon: FiHeart,
                title: '友好氛围',
                description: '营造温暖包容的社区氛围，让每个人都能自由表达'
              },
              {
                icon: FiMessageCircle,
                title: '深度交流',
                description: '支持评论互动、私信交流，建立真实的连接'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-planet-purple hover:to-planet-pink transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center mb-6 group-hover:bg-white group-hover:shadow-lg transition-all">
                  <feature.icon className="text-white text-2xl group-hover:text-planet-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-white/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                准备好加入
                <span className="text-gradient">菜菜星球</span>
                了吗？
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                无论你是技术大牛还是初学者，菜菜星球都欢迎你的加入。在这里分享你的知识，结识新朋友，一起探索技术的无限可能。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary">
                  立即注册
                </Link>
                <Link to="/community" className="btn-secondary">
                  浏览社区
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-planet-purple to-planet-pink rounded-3xl transform rotate-3 opacity-20" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center text-white font-bold">
                    菜
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">菜菜星球</div>
                    <div className="text-sm text-gray-500">技术社区</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>加入我们的社区</span>
                  <FiArrowRight className="text-planet-purple" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
