import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiChevronRight, FiLayers, FiPlus, FiX, FiSend } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [maleCategories, setMaleCategories] = useState([]);
  const [femaleCategories, setFemaleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 提议任务弹窗状态
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    gender: 'male',
    difficulty: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        setLoading(true);
        // 获取男版任务类型
        const maleResponse = await api.get('/users/task-types?gender=male');
        const maleTypes = maleResponse.data.taskTypes || [];
        
        // 获取女版任务类型
        const femaleResponse = await api.get('/users/task-types?gender=female');
        const femaleTypes = femaleResponse.data.taskTypes || [];
        
        // 转换为前端需要的格式
        const maleFormatted = maleTypes.map((type, index) => ({
          id: type.id,
          title: type.name,
          description: type.description || '暂无描述',
          icon: FiLayers,
          color: 'from-planet-purple to-planet-pink',
          path: `/tasks/male/${type.id}`
        }));
        
        const femaleFormatted = femaleTypes.map((type, index) => ({
          id: type.id,
          title: type.name,
          description: type.description || '暂无描述',
          icon: FiLayers,
          color: 'from-planet-pink to-rose-400',
          path: `/tasks/female/${type.id}`
        }));
        
        setMaleCategories(maleFormatted);
        setFemaleCategories(femaleFormatted);
      } catch (error) {
        console.error('获取任务类型失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskTypes();
  }, []);

  // 提交任务提议
  const handleSubmitProposal = async () => {
    if (!proposalForm.title.trim()) {
      toast.error('请输入任务名称');
      return;
    }
    if (!proposalForm.description.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/users/task-proposals', proposalForm);
      toast.success('任务提议已提交，等待管理员审核');
      setShowProposalModal(false);
      setProposalForm({
        title: '',
        description: '',
        gender: 'male',
        difficulty: 'medium'
      });
    } catch (error) {
      console.error('提交任务提议失败:', error);
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const ModuleSection = ({ title, categories, moduleType, delay }) => {
    const isMale = moduleType === 'male';

    return (
      <div
        className={`mb-12 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* 模块标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              isMale ? 'from-planet-purple to-planet-cyan' : 'from-planet-pink to-rose-400'
            } flex items-center justify-center shadow-lg ${
              isMale ? 'shadow-planet-purple/30' : 'shadow-planet-pink/30'
            } transition-transform duration-300 hover:scale-110`}>
              <span className="text-2xl">{isMale ? '👨' : '👩'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {isMale ? '探索科技与运动的无限可能' : '发现美丽与创意的精彩世界'}
              </p>
            </div>
          </div>
        </div>

        {/* 分类卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isHovered = hoveredCard === `${moduleType}-${category.id}`;

            return (
              <div
                key={category.id}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${delay + 100 + index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(`${moduleType}-${category.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(category.path)}
              >
                {/* 背景层 */}
                <div className={`absolute inset-0 bg-white border border-gray-200 rounded-2xl transition-all duration-300 ${
                  isHovered ? 'shadow-xl scale-[1.02] border-planet-purple/20' : 'shadow-md'
                }`} />

                {/* 发光效果 */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${category.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* 内容 */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg transform transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button className={`flex items-center space-x-1.5 px-4 py-2 rounded-full bg-gradient-to-r ${category.color} text-white text-sm font-medium shadow-md transition-all duration-300 ${isHovered ? 'shadow-lg translate-y-[-2px]' : ''}`}>
                      <span>查看详情</span>
                      <FiChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 导航栏 */}
      <Navbar />

      {/* 主内容 */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 提议任务按钮 - 右上角 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowProposalModal(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <FiPlus className="w-5 h-5" />
              <span>提议任务</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
            </div>
          ) : (
            <>
              {/* 男生模块 */}
              {maleCategories.length > 0 ? (
                <ModuleSection
                  title="男生模块"
                  categories={maleCategories}
                  moduleType="male"
                  delay={100}
                />
              ) : (
                <div className={`mb-12 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-planet-purple to-planet-cyan flex items-center justify-center shadow-lg shadow-planet-purple/30">
                        <span className="text-2xl">👨</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">男生模块</h2>
                        <p className="text-gray-500 text-xs mt-0.5">
                          探索科技与运动的无限可能
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiLayers className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 text-lg">暂无任务类型</p>
                    <p className="text-gray-400 text-sm mt-1">请在管理员后台添加任务类型</p>
                  </div>
                </div>
              )}

              {/* 分隔线 */}
              {maleCategories.length > 0 && femaleCategories.length > 0 && (
                <div className={`relative my-10 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                      <div className="w-2 h-2 rounded-full bg-planet-purple/30" />
                    </div>
                  </div>
                </div>
              )}

              {/* 女生模块 */}
              {femaleCategories.length > 0 ? (
                <ModuleSection
                  title="女生模块"
                  categories={femaleCategories}
                  moduleType="female"
                  delay={500}
                />
              ) : (
                <div className={`mb-12 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-planet-pink to-rose-400 flex items-center justify-center shadow-lg shadow-planet-pink/30">
                        <span className="text-2xl">👩</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">女生模块</h2>
                        <p className="text-gray-500 text-xs mt-0.5">
                          发现美丽与创意的精彩世界
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiLayers className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 text-lg">暂无任务类型</p>
                    <p className="text-gray-400 text-sm mt-1">请在管理员后台添加任务类型</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 提议任务弹窗 */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">提议新任务</h3>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称 *</label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="请输入任务名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务描述 *</label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="请详细描述任务内容、要求等"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">适用专区</label>
                  <select
                    value={proposalForm.gender}
                    onChange={(e) => setProposalForm({ ...proposalForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="male">男生专区</option>
                    <option value="female">女生专区</option>
                    <option value="both">通用</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                  <select
                    value={proposalForm.difficulty}
                    onChange={(e) => setProposalForm({ ...proposalForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowProposalModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitProposal}
                disabled={submitting}
                className="flex items-center space-x-2 px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <FiSend size={18} />
                    <span>提交提议</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS样式 */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
