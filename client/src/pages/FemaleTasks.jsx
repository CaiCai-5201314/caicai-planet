import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function FemaleTasks() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: '美容护肤',
      description: '分享美容护肤心得，参与护肤挑战，获取专属奖励',
      difficulty: '简单',
      icon: '💄',
      color: 'from-pink-500 to-pink-700',
      path: '/tasks/female/beauty'
    },
    {
      id: 2,
      title: '创意手工',
      description: '展示你的手工制作作品，参与创意挑战，赢取精美礼品',
      difficulty: '中等',
      icon: '🎨',
      color: 'from-purple-500 to-purple-700',
      path: '/tasks/female/crafts'
    },
    {
      id: 3,
      title: '时尚穿搭',
      description: '分享你的时尚穿搭心得，参与穿搭挑战',
      difficulty: '简单',
      icon: '👗',
      color: 'from-rose-500 to-rose-700',
      path: '/tasks/female/fashion'
    },
    {
      id: 4,
      title: '美食烘焙',
      description: '制作美食和烘焙甜点，分享你的食谱和作品',
      difficulty: '中等',
      icon: '🍰',
      color: 'from-orange-500 to-orange-700',
      path: '/tasks/female/cooking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-purple-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 space-x-4">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full font-medium hover:bg-white/20 transition-all"
          >
            <FiArrowLeft size={18} />
            <span>返回</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold flex-1 text-center">女生专版</h1>
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
              <button className="mt-4 w-full py-2 bg-pink-600 rounded-lg font-medium hover:bg-pink-700 transition-colors">
                进入
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
