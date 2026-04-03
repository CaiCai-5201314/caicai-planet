import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCalendar, FiAward, FiTarget } from 'react-icons/fi';

export default function SportsChallenge() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: '每日跑步3公里',
      description: '连续7天每天跑步3公里，坚持就是胜利！',
      difficulty: '简单',
      reward: '100积分',
      deadline: '2026-04-10',
      progress: 5,
      total: 7,
      completed: false
    },
    {
      id: 2,
      title: '俯卧撑挑战',
      description: '一周内累计完成200个俯卧撑',
      difficulty: '中等',
      reward: '150积分',
      deadline: '2026-04-15',
      progress: 120,
      total: 200,
      completed: false
    },
    {
      id: 3,
      title: '平板支撑10分钟',
      description: '累计平板支撑时间达到10分钟',
      difficulty: '困难',
      reward: '200积分',
      deadline: '2026-04-20',
      progress: 6,
      total: 10,
      completed: false
    }
  ]);

  const handleComplete = (id) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === id ? { ...challenge, completed: true } : challenge
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
              <span className="text-2xl">🏃</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">运动挑战</h1>
          </div>
        </div>

        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl ${challenge.completed ? 'border-2 border-green-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold">{challenge.title}</h2>
                    {challenge.completed && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <FiCheck size={18} />
                        <span className="text-sm">已完成</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{challenge.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>难度: {challenge.difficulty}</span>
                    <span>奖励: {challenge.reward}</span>
                    <div className="flex items-center space-x-1">
                      <FiCalendar size={14} />
                      <span>截止: {challenge.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">进度</span>
                  <span className="text-sm font-medium">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${challenge.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                    style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                  />
                </div>
              </div>

              {!challenge.completed && (
                <button
                  onClick={() => handleComplete(challenge.id)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <FiTarget size={18} />
                  <span>完成挑战</span>
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
              <h3 className="text-xl font-bold">积分排行榜</h3>
              <p className="text-gray-300">完成挑战，争夺榜首！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
