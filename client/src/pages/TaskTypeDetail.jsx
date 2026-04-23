import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiAward, FiTarget, FiClock } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function TaskTypeDetail() {
  const { gender, id } = useParams();
  const navigate = useNavigate();
  const [taskType, setTaskType] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskTypeAndTasks = async () => {
      try {
        setLoading(true);
        
        // 获取任务类型详情
        const taskTypeResponse = await api.get(`/users/task-types/${id}`);
        setTaskType(taskTypeResponse.data.taskType);
        
        // 获取该任务类型的任务列表
        const tasksResponse = await api.get('/users/tasks', {
          params: {
            gender,
            customTypeId: id,
            status: 'published'
          }
        });
        setTasks(tasksResponse.data.tasks || []);
      } catch (error) {
        console.error('获取任务类型详情失败:', error);
        setError('获取任务类型详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskTypeAndTasks();
  }, [gender, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{error}</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-6 px-6 py-2 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors"
          >
            返回任务中心
          </button>
        </div>
      </div>
    );
  }

  if (!taskType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">任务类型不存在</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-6 px-6 py-2 bg-planet-purple text-white rounded-full font-medium hover:bg-planet-purple/90 transition-colors"
          >
            返回任务中心
          </button>
        </div>
      </div>
    );
  }

  const isMale = gender === 'male';
  const gradientColor = isMale ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 顶部导航 */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-medium hover:border-planet-purple hover:text-planet-purple transition-colors text-gray-900 dark:text-white"
            >
              <FiArrowLeft size={18} />
              <span>返回</span>
            </button>
            <div className="flex items-center flex-1 justify-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center mr-3`}>
                <span className="text-2xl">{taskType.icon || (isMale ? '👨' : '👩')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{taskType.name}</h1>
            </div>
            <div className="w-16"></div> {/* 占位，保持标题居中 */}
          </div>

          {/* 任务类型描述 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <p className="text-gray-600 dark:text-gray-300">{taskType.description || '暂无描述'}</p>
          </div>

          {/* 任务列表 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">任务列表</h2>
            
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{task.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                            <FiTarget size={16} />
                            <span>难度: {task.difficulty}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                            <FiAward size={16} />
                            <span>奖励: {task.reward} 积分</span>
                          </span>
                          {task.startTime && (
                            <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                              <FiCalendar size={16} />
                              <span>开始: {new Date(task.startTime).toLocaleDateString()}</span>
                            </span>
                          )}
                          {task.endTime && (
                            <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                              <FiClock size={16} />
                              <span>截止: {new Date(task.endTime).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/task/${task.id}`}
                      className={`block w-full py-2 bg-gradient-to-r ${gradientColor} text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all text-center`}
                    >
                      查看详情
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FiTarget className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">暂未发布新任务</p>
                <p className="text-gray-400 text-sm mt-1">敬请期待更多精彩任务</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
