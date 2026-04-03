import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiHeart, FiGift, FiStar } from 'react-icons/fi';

export default function BeautyCare() {
  const navigate = useNavigate();
  const [tips, setTips] = useState([
    {
      id: 1,
      title: '日常护肤步骤',
      description: '学习正确的日常护肤步骤，让你的肌肤保持最佳状态',
      difficulty: '简单',
      reward: '80积分',
      author: '护肤达人',
      likes: 456,
      liked: false,
      completed: false
    },
    {
      id: 2,
      title: '面膜使用技巧',
      description: '不同肤质如何选择和使用面膜，效果加倍',
      difficulty: '简单',
      reward: '100积分',
      author: '美妆博主',
      likes: 623,
      liked: false,
      completed: false
    },
    {
      id: 3,
      title: '防晒的重要性',
      description: '全年防晒的正确方法，保护肌肤免受紫外线伤害',
      difficulty: '中等',
      reward: '120积分',
      author: '皮肤科医生',
      likes: 891,
      liked: false,
      completed: false
    }
  ]);

  const handleLike = (id) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, liked: !tip.liked, likes: tip.liked ? tip.likes - 1 : tip.likes + 1 } : tip
    ));
  };

  const handleComplete = (id) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, completed: true } : tip
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 to-rose-900 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8 space-x-4">
          <button
            onClick={() => navigate('/tasks/female')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full font-medium hover:bg-white/20 transition-all"
          >
            <FiArrowLeft size={18} />
            <span>返回</span>
          </button>
          <div className="flex items-center flex-1 justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mr-3">
              <span className="text-2xl">💄</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">美容护肤</h1>
          </div>
        </div>

        <div className="space-y-6">
          {tips.map((tip) => (
            <div 
              key={tip.id} 
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl ${tip.completed ? 'border-2 border-green-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold">{tip.title}</h2>
                    {tip.completed && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <FiCheck size={18} />
                        <span className="text-sm">已完成</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">{tip.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>难度: {tip.difficulty}</span>
                    <span>奖励: {tip.reward}</span>
                    <span>作者: {tip.author}</span>
                    <div className="flex items-center space-x-1">
                      <FiHeart size={14} />
                      <span>{tip.likes} 点赞</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(tip.id)}
                  className={`p-2 rounded-full transition-all ${tip.liked ? 'text-pink-400 bg-pink-400/20' : 'text-gray-400 hover:text-pink-400 hover:bg-pink-400/20'}`}
                >
                  <FiHeart size={20} />
                </button>
              </div>

              {!tip.completed && (
                <button
                  onClick={() => handleComplete(tip.id)}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <FiGift size={18} />
                  <span>完成任务</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <FiStar size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">专属奖励</h3>
              <p className="text-gray-300">完成护肤任务，获取专属美妆礼品！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
