import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiStar, FiAward, FiBookmark } from 'react-icons/fi';

export default function CreativeCrafts() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: '折纸艺术入门',
      description: '学习基础折纸技巧，制作可爱的动物和花朵',
      difficulty: '简单',
      reward: '90积分',
      author: '手工达人',
      bookmarks: 342,
      bookmarked: false,
      completed: false
    },
    {
      id: 2,
      title: '毛线编织小玩偶',
      description: '用毛线编织可爱的小玩偶，送给朋友作为礼物',
      difficulty: '中等',
      reward: '130积分',
      author: '编织爱好者',
      bookmarks: 567,
      bookmarked: false,
      completed: false
    },
    {
      id: 3,
      title: '制作专属贺卡',
      description: 'DIY独特的贺卡，为重要的日子增添心意',
      difficulty: '简单',
      reward: '80积分',
      author: '创意设计师',
      bookmarks: 234,
      bookmarked: false,
      completed: false
    }
  ]);

  const handleBookmark = (id) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, bookmarked: !project.bookmarked, bookmarks: project.bookmarked ? project.bookmarks - 1 : project.bookmarks + 1 } : project
    ));
  };

  const handleComplete = (id) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, completed: true } : project
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white py-20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <span className="text-2xl">🎨</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">创意手工</h1>
          </div>
        </div>

        <div className="space-y-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl ${project.completed ? 'border-2 border-green-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold">{project.title}</h2>
                    {project.completed && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <FiCheck size={18} />
                        <span className="text-sm">已完成</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">{project.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>难度: {project.difficulty}</span>
                    <span>奖励: {project.reward}</span>
                    <span>作者: {project.author}</span>
                    <div className="flex items-center space-x-1">
                      <FiBookmark size={14} />
                      <span>{project.bookmarks} 收藏</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleBookmark(project.id)}
                  className={`p-2 rounded-full transition-all ${project.bookmarked ? 'text-purple-400 bg-purple-400/20' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-400/20'}`}
                >
                  <FiBookmark size={20} />
                </button>
              </div>

              {!project.completed && (
                <button
                  onClick={() => handleComplete(project.id)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <FiStar size={18} />
                  <span>开始制作</span>
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
              <h3 className="text-xl font-bold">作品展示区</h3>
              <p className="text-gray-300">展示你的手工作品，获得大家的赞赏！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
