import { FiHeart, FiUsers, FiBookOpen, FiStar } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const stats = [
  { icon: FiUsers, label: '注册用户', value: '1,000+' },
  { icon: FiBookOpen, label: '文章数量', value: '500+' },
  { icon: FiHeart, label: '互动次数', value: '10,000+' },
  { icon: FiStar, label: '运行天数', value: '365+' },
];

const timeline = [
  { date: '2024-01', title: '菜菜星球诞生', description: '社区正式上线，开始我们的旅程' },
  { date: '2024-03', title: '用户突破500', description: '社区成员持续增长，氛围越来越好' },
  { date: '2024-06', title: '功能升级', description: '新增友链系统、文章分类等功能' },
  { date: '2024-12', title: '持续前行', description: '不断优化体验，打造更好的社区' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        <div className="relative py-24 gradient-bg overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <h1 className="text-5xl font-bold mb-6">关于菜菜星球</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              菜菜星球是一个充满创意与分享的技术社区，我们致力于打造一个开放、友好、
              充满活力的交流平台，让每个人都能在这里找到属于自己的位置。
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-planet-purple/10 to-planet-pink/10 flex items-center justify-center mb-4">
                  <stat.icon className="text-2xl text-planet-purple" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的故事</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  菜菜星球诞生于对技术分享的热爱。我们相信，每个人都有独特的知识和经验值得分享，
                  每个想法都可能启发他人。
                </p>
                <p>
                  在这里，无论你是技术大牛还是初学者，都能找到属于自己的位置。
                  我们鼓励真诚的交流，尊重每一种声音。
                </p>
                <p>
                  我们的名字"菜菜"寓意着保持谦逊、持续学习的态度。
                  在技术的世界里，我们永远都是学生，永远保持好奇心。
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的价值观</h2>
              <div className="space-y-4">
                {[
                  { title: '开放包容', desc: '尊重每一种观点，欢迎不同背景的朋友' },
                  { title: '真诚分享', desc: '分享真实的经验，传递有价值的知识' },
                  { title: '持续学习', desc: '保持好奇心，不断探索和进步' },
                  { title: '互助成长', desc: '相互帮助，共同成长进步' },
                ].map((value, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{value.title}</h3>
                      <p className="text-gray-600 text-sm">{value.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">发展历程</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div className="w-1/2 pr-8 text-right">
                      {index % 2 === 0 && (
                        <>
                          <div className="text-sm text-planet-purple font-medium mb-1">{item.date}</div>
                          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </>
                      )}
                    </div>
                    <div className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-br from-planet-purple to-planet-pink border-4 border-white shadow" />
                    <div className="w-1/2 pl-8">
                      {index % 2 === 1 && (
                        <>
                          <div className="text-sm text-planet-purple font-medium mb-1">{item.date}</div>
                          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-planet-purple to-planet-pink rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">加入我们</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              无论你是想分享知识、寻找答案，还是结识志同道合的朋友，菜菜星球都欢迎你的加入。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/register"
                className="px-8 py-3 bg-white text-planet-purple rounded-full font-semibold hover:shadow-lg transition-shadow"
              >
                立即注册
              </a>
              <a
                href="/community"
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                浏览社区
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
