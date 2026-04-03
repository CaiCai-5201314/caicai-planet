import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function MaleTasks() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: '运动挑战',
      description: '参与各种运动挑战，提升身体素质，赢取积分奖励',
      difficulty: '中等',
      icon: '🏃',
      color: 'from-blue-500 to-blue-700',
      path: '/tasks/male/sports'
    },
    {
      id: 2,
      title: '科技探索',
      description: '探索最新科技产品和技术，分享你的见解和体验',
      difficulty: '高级',
      icon: '💻',
      color: 'from-cyan-500 to-cyan-700',
      path: '/tasks/male/tech'
    },
    {
      id: 3,
      title: '编程学习',
      description: '学习新的编程语言和技术，提升编程技能',
      difficulty: '中等',
      icon: '👨‍💻',
      color: 'from-purple-500 to-purple-700',
      path: '/tasks/male/coding'
    },
    {
      id: 4,
      title: '游戏竞技',
      description: '参与游戏竞技挑战，展现你的游戏实力',
      difficulty: '简单',
      icon: '🎮',
      color: 'from-green-500 to-green-700',
      path: '/tasks/male/gaming'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 space-x-4">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full font-medium hover:bg-white/20 transition-all"
          >
            <FiArrowLeft size={18} />
            <span>返回</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold flex-1 text-center">男生专版</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => navigate(category.path)}
            >
              <div className="flex items-center mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mr-4`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                  <span className="text-sm text-gray-300">难度: {category.difficulty}</span>
                </div>
              </div>
              <p className="text-gray-300">{category.description}</p>
              <button className="mt-4 w-full py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                进入
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
