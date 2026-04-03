import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiTrendingUp, FiStar, FiAward } from 'react-icons/fi';

export default function TechExplore() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'AI大语言模型介绍',
      description: '了解ChatGPT等大语言模型的工作原理和应用场景',
      difficulty: '高级',
      reward: '200积分',
      author: '科技达人',
      views: 1256,
      liked: false,
      completed: false
    },
    {
      id: 2,
      title: '如何使用Python进行数据分析',
      description: '学习使用Python的Pandas和NumPy库进行数据分析',
      difficulty: '中等',
      reward: '150积分',
      author: '数据分析师',
      views: 892,
      liked: false,
      completed: false
    },
    {
      id: 3,
      title: 'Web3和区块链入门',
      description: '了解区块链技术的基本概念和Web3的未来发展',
      difficulty: '高级',
      reward: '250积分',
      author: '区块链专家',
      views: 2103,
      liked: false,
      completed: false
    }
  ]);

  const handleLike = (id) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, liked: !article.liked } : article
    ));
  };

  const handleComplete = (id) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, completed: true } : article
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 to-blue-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 space-x-4">
          <button
            onClick={() => navigate('/tasks/male')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full font-medium hover:bg-white/20 transition-all"
          >
            <FiArrowLeft size={18} />
            <span>返回</span>
          </button>
          <div className="flex items-center flex-1 justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3">
              <span className="text-2xl">💻</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">科技探索</h1>
          </div>
        </div>

        <div className="space-y-6">
          {articles.map((article) => (
            <div 
              key={article.id} 
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl ${article.completed ? 'border-2 border-green-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold">{article.title}</h2>
                    {article.completed && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <FiCheck size={18} />
                        <span className="text-sm">已完成</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">{article.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>难度: {article.difficulty}</span>
                    <span>奖励: {article.reward}</span>
                    <span>作者: {article.author}</span>
                    <div className="flex items-center space-x-1">
                      <FiTrendingUp size={14} />
                      <span>{article.views} 浏览</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(article.id)}
                  className={`p-2 rounded-full transition-all ${article.liked ? 'text-yellow-400 bg-yellow-400/20' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/20'}`}
                >
                  <FiStar size={20} />
                </button>
              </div>

              {!article.completed && (
                <button
                  onClick={() => handleComplete(article.id)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <FiAward size={18} />
                  <span>完成学习</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <FiAward size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">科技成就系统</h3>
              <p className="text-gray-300">完成学习任务，解锁专属成就！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
