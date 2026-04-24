import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiChevronRight, FiLayers, FiPlus, FiX, FiSend, FiMoon, FiInfo, FiClock, FiArrowLeft } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatMoonPoints } from '../utils/format';

export default function Tasks() {
  const { user, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);
  const [maleCategories, setMaleCategories] = useState([]);
  const [femaleCategories, setFemaleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 提议任务弹窗状态
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    gender: 'male',
    difficulty: 'medium',
    suggestedTime: '',
    items: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // 月球分相关状态
  const [moonPoints, setMoonPoints] = useState(0);
  const [moonPointLogs, setMoonPointLogs] = useState([]);
  const [showMoonPointsModal, setShowMoonPointsModal] = useState(false);
  const [moonPointsLoading, setMoonPointsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    // 确保用户信息已加载
    const loadUser = async () => {
      if (!user) {
        await fetchUser();
      }
    };
    loadUser();
  }, [user, fetchUser]);

  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        setLoading(true);
        // 并行获取男版和女版任务类型
        const [maleResponse, femaleResponse] = await Promise.all([
          api.get('/users/task-types?gender=male'),
          api.get('/users/task-types?gender=female')
        ]);
        
        const maleTypes = maleResponse.data.taskTypes || [];
        const femaleTypes = femaleResponse.data.taskTypes || [];
        
        // 转换为前端需要的格式
        const maleFormatted = maleTypes.map((type) => ({
          id: type.id,
          title: type.name,
          description: type.description || '暂无描述',
          icon: FiLayers,
          color: 'from-planet-purple to-planet-pink',
          path: `/tasks/male/${type.id}`
        }));
        
        const femaleFormatted = femaleTypes.map((type) => ({
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
        difficulty: 'medium',
        suggestedTime: '',
        items: ''
      });
    } catch (error) {
      console.error('提交任务提议失败:', error);
      toast.error('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 获取月球分历史记录
  const fetchMoonPointLogs = async () => {
    if (!user) return;
    
    try {
      setLogsLoading(true);
      const response = await api.get(`/moon-points/users/${user.id}/logs`);
      setMoonPointLogs(response.data.logs || []);
    } catch (error) {
      console.error('获取月球分记录失败:', error);
      toast.error('获取月球分记录失败');
    } finally {
      setLogsLoading(false);
    }
  };

  // 打开月球分弹窗
  const openMoonPointsModal = async () => {
    // 直接从user对象获取月球分，避免额外请求
    if (user?.moon_points !== undefined) {
      setMoonPoints(user.moon_points);
    }
    // 只请求历史记录
    await fetchMoonPointLogs();
    setShowMoonPointsModal(true);
  };

  const ModuleSection = ({ title, categories, moduleType }) => {
    const isMale = moduleType === 'male';

    return (
      <div className="mb-12">
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {isMale ? '探索科技与运动的无限可能' : '发现美丽与创意的精彩世界'}
              </p>
            </div>
          </div>
        </div>

        {/* 分类卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const isHovered = hoveredCard === `${moduleType}-${category.id}`;

            return (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                onMouseEnter={() => setHoveredCard(`${moduleType}-${category.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(category.path)}
              >
                {/* 背景层 */}
                <div className={`absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl transition-all duration-300 ${
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

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {category.title}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <Navbar />

      {/* 主内容 */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
<<<<<<< HEAD

=======
          {/* 返回按钮 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span>返回</span>
            </button>
          </div>
>>>>>>> 238d9711fa98027fb9fb6da53c618c645b242222
          
          {/* 提议任务按钮和我的月球分 - 右上角 */}
        <div className="flex justify-end mb-6 space-x-4">
          {/* 我的月球分模块 */}
          <button
            onClick={openMoonPointsModal}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <FiMoon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>我的月球分</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold group-hover:bg-white/30 transition-colors">
              {user?.moon_points !== undefined ? formatMoonPoints(user.moon_points) : '...'}
            </span>
          </button>
          
          {/* 提议任务按钮 */}
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
                />
              ) : (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-planet-purple to-planet-cyan flex items-center justify-center shadow-lg shadow-planet-purple/30">
                        <span className="text-2xl">👨</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">男生模块</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          探索科技与运动的无限可能
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiLayers className="text-gray-400 dark:text-gray-500" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">暂无任务类型</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">请在管理员后台添加任务类型</p>
                  </div>
                </div>
              )}

              {/* 分隔线 */}
              {maleCategories.length > 0 && femaleCategories.length > 0 && (
                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
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
                />
              ) : (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-planet-pink to-rose-400 flex items-center justify-center shadow-lg shadow-planet-pink/30">
                        <span className="text-2xl">👩</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">女生模块</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          发现美丽与创意的精彩世界
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FiLayers className="text-gray-400 dark:text-gray-500" size={32} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">暂无任务类型</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">请在管理员后台添加任务类型</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-planet-purple to-planet-pink flex items-center justify-center shadow-lg shadow-planet-purple/30">
                  <FiPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">提议新任务</h3>
              </div>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">任务名称 *</label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  placeholder="请输入任务名称"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">任务描述 *</label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="请详细描述任务内容、要求等"
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">适用专区</label>
                  <select
                    value={proposalForm.gender}
                    onChange={(e) => setProposalForm({ ...proposalForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                  >
                    <option value="male">男生专区</option>
                    <option value="female">女生专区</option>
                    <option value="both">通用</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">难度</label>
                  <select
                    value={proposalForm.difficulty}
                    onChange={(e) => setProposalForm({ ...proposalForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">建议游玩时间（可选）</label>
                <input
                  type="text"
                  value={proposalForm.suggestedTime}
                  onChange={(e) => setProposalForm({ ...proposalForm, suggestedTime: e.target.value })}
                  placeholder="例如：30分钟、1小时"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">任务道具（可选，多个道具用逗号分隔）</label>
                <input
                  type="text"
                  value={proposalForm.items}
                  onChange={(e) => setProposalForm({ ...proposalForm, items: e.target.value })}
                  placeholder="例如：手机、笔记本、相机"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowProposalModal(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmitProposal}
                disabled={submitting}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-planet-purple to-planet-pink text-white rounded-lg hover:from-planet-purple/90 hover:to-planet-pink/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
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

      {/* 月球分弹窗 */}
      {showMoonPointsModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMoonPointsModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗标题 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FiMoon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">我的月球分</h3>
              </div>
              <button
                onClick={() => setShowMoonPointsModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* 月球分总览 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">当前月球分</p>
                  <h4 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {user?.moon_points !== undefined ? formatMoonPoints(user.moon_points) : '...'}
                  </h4>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-sm">
                  <FiMoon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>



            {/* 月球分获取历史 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FiClock size={18} className="text-blue-500" />
                  <span>获取历史</span>
                </h4>
              </div>
              {logsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : moonPointLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>暂无月球分记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moonPointLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{log.reason}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(log.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <span className={`font-bold text-lg ${
                          log.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {log.points > 0 ? '+' : ''}{formatMoonPoints(log.points)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 月球分使用规则 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">月球分使用规则</h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>完成任务可获得月球分奖励</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>每日打卡可获得月球分</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>参与社区活动可获得月球分</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>月球分可用于兑换特殊权益</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowMoonPointsModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                关闭
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
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
