import { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit2, FiTrash2, FiLayers, FiMessageSquare, 
  FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiChevronUp, FiChevronDown
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const genderOptions = [
  { value: 'both', label: '通用' },
  { value: 'male', label: '男版专区' },
  { value: 'female', label: '女版专区' }
];

export default function TaskTypeManagement() {
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedType, setExpandedType] = useState(null);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    gender: 'both',
    icon: '',
    color: '',
    sortOrder: 0
  });
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    sortOrder: 0
  });

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/task-types?includeInactive=true');
      setTaskTypes(response.data.taskTypes || []);
    } catch (error) {
      console.error('获取任务类型失败:', error);
      toast.error('获取任务类型失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async () => {
    if (!typeForm.name.trim()) {
      toast.error('请输入类型名称');
      return;
    }

    try {
      await api.post('/admin/task-types', typeForm);
      toast.success('任务类型创建成功');
      setShowAddTypeModal(false);
      resetTypeForm();
      fetchTaskTypes();
    } catch (error) {
      console.error('创建任务类型失败:', error);
      toast.error('创建任务类型失败');
    }
  };

  const handleEditType = async () => {
    if (!typeForm.name.trim()) {
      toast.error('请输入类型名称');
      return;
    }

    try {
      await api.put(`/admin/task-types/${currentType.id}`, typeForm);
      toast.success('任务类型更新成功');
      setShowEditTypeModal(false);
      setCurrentType(null);
      resetTypeForm();
      fetchTaskTypes();
    } catch (error) {
      console.error('更新任务类型失败:', error);
      toast.error('更新任务类型失败');
    }
  };

  const handleDeleteType = async (id) => {
    if (window.confirm('确定要删除这个任务类型吗？如果该类型下有话题，需要先删除话题。')) {
      try {
        await api.delete(`/admin/task-types/${id}`);
        toast.success('任务类型删除成功');
        fetchTaskTypes();
      } catch (error) {
        console.error('删除任务类型失败:', error);
        const responseData = error.response?.data;
        if (responseData?.canForceDelete) {
          // 可以强制删除
          const taskList = responseData.tasks ? responseData.tasks.map(t => t.title).join(', ') : '';
          const confirmMsg = responseData.tasks 
            ? `该类型下有任务：${taskList}。\n\n确定要强制删除吗？这将同时删除所有关联的任务和话题！`
            : '该类型下有关联数据。\n\n确定要强制删除吗？这将同时删除所有关联的任务和话题！';
          
          if (window.confirm(confirmMsg)) {
            try {
              await api.delete(`/admin/task-types/${id}?force=true`);
              toast.success('任务类型及其关联数据已强制删除');
              fetchTaskTypes();
            } catch (forceError) {
              console.error('强制删除失败:', forceError);
              toast.error(forceError.response?.data?.message || '强制删除失败');
            }
          }
        } else {
          toast.error(responseData?.message || '删除任务类型失败');
        }
      }
    }
  };

  const toggleTypeStatus = async (id, isActive) => {
    try {
      await api.put(`/admin/task-types/${id}`, { isActive });
      toast.success('状态更新成功');
      fetchTaskTypes();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const handleAddTopic = async () => {
    if (!topicForm.name.trim()) {
      toast.error('请输入话题名称');
      return;
    }

    try {
      const response = await api.post(`/admin/task-types/${currentType.id}/topics`, topicForm);
      const newTopic = response.data.topic;
      toast.success('话题创建成功');
      setShowAddTopicModal(false);
      resetTopicForm();
      // 直接更新当前任务类型的话题列表，添加新话题
      setTaskTypes(prev => prev.map(type => {
        if (type.id === currentType.id) {
          return {
            ...type,
            topics: [...(type.topics || []), newTopic]
          };
        }
        return type;
      }));
    } catch (error) {
      console.error('创建话题失败:', error);
      toast.error('创建话题失败');
    }
  };

  const handleEditTopic = async () => {
    if (!topicForm.name.trim()) {
      toast.error('请输入话题名称');
      return;
    }

    try {
      const response = await api.put(`/admin/task-types/topics/${currentTopic.id}`, topicForm);
      const updatedTopic = response.data.topic;
      toast.success('话题更新成功');
      setShowEditTopicModal(false);
      setCurrentTopic(null);
      resetTopicForm();
      // 直接更新当前任务类型的话题列表，更新已编辑的话题
      setTaskTypes(prev => prev.map(type => {
        if (type.topics) {
          return {
            ...type,
            topics: type.topics.map(topic => {
              if (topic.id === currentTopic.id) {
                return updatedTopic;
              }
              return topic;
            })
          };
        }
        return type;
      }));
    } catch (error) {
      console.error('更新话题失败:', error);
      toast.error('更新话题失败');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('确定要删除这个话题吗？')) {
      try {
        await api.delete(`/admin/task-types/topics/${topicId}`);
        toast.success('话题删除成功');
        // 直接更新当前任务类型的话题列表，移除被删除的话题
        setTaskTypes(prev => prev.map(type => {
          if (type.topics) {
            return {
              ...type,
              topics: type.topics.filter(topic => topic.id !== topicId)
            };
          }
          return type;
        }));
      } catch (error) {
          console.error('删除话题失败:', error);
          toast.error('删除话题失败');
        }
    }
  };

  const toggleTopicStatus = async (topicId, isActive) => {
    try {
      await api.put(`/admin/task-types/topics/${topicId}`, { isActive });
      toast.success('状态更新成功');
      // 直接更新当前任务类型的话题状态
      setTaskTypes(prev => prev.map(type => {
        if (type.topics) {
          return {
            ...type,
            topics: type.topics.map(topic => {
              if (topic.id === topicId) {
                return { ...topic, isActive: !isActive };
              }
              return topic;
            })
          };
        }
        return type;
      }));
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: '',
      description: '',
      gender: 'both',
      icon: '',
      color: '',
      sortOrder: 0
    });
  };

  const resetTopicForm = () => {
    setTopicForm({
      name: '',
      description: '',
      sortOrder: 0
    });
  };

  const openEditTypeModalHandler = (type) => {
    setCurrentType(type);
    setTypeForm({
      name: type.name,
      description: type.description || '',
      gender: type.gender,
      icon: type.icon || '',
      color: type.color || '',
      sortOrder: type.sortOrder || 0
    });
    setShowEditTypeModal(true);
  };

  const openAddTopicModalHandler = (type) => {
    setCurrentType(type);
    resetTopicForm();
    setShowAddTopicModal(true);
  };

  const openEditTopicModalHandler = (topic) => {
    setCurrentTopic(topic);
    setTopicForm({
      name: topic.name,
      description: topic.description || '',
      sortOrder: topic.sortOrder || 0
    });
    setShowEditTopicModal(true);
  };

  const toggleExpand = (typeId) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      fetchTypeTopics(typeId);
    }
  };

  const fetchTypeTopics = async (typeId) => {
    try {
      const response = await api.get(`/admin/task-types/${typeId}`);
      setTaskTypes(prev => prev.map(t => 
        t.id === typeId ? { ...t, topics: response.data.taskType.topics || [] } : t
      ));
    } catch (error) {
      console.error('获取话题失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">任务类型与话题管理</h2>
        <button
          onClick={() => {
            resetTypeForm();
            setShowAddTypeModal(true);
          }}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>创建任务类型</span>
        </button>
      </div>

      {/* 任务类型列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planet-purple" />
          </div>
        ) : taskTypes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiLayers className="text-gray-400" size={40} />
            </div>
            <p className="text-gray-500 text-lg">暂无任务类型</p>
            <p className="text-gray-400 text-sm mt-1">点击右上角按钮创建新类型</p>
          </div>
        ) : (
          taskTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 任务类型头部 */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleExpand(type.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedType === type.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          type.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                          type.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {genderOptions.find(g => g.value === type.gender)?.label}
                        </span>
                        {!type.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            已禁用
                          </span>
                        )}
                      </div>
                      {type.description && (
                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 状态切换 */}
                    <button
                      onClick={() => toggleTypeStatus(type.id, !type.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        type.isActive 
                          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={type.isActive ? '禁用' : '启用'}
                    >
                      {type.isActive ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                    
                    {/* 编辑按钮 */}
                    <button
                      onClick={() => openEditTypeModalHandler(type)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    
                    {/* 添加话题按钮 */}
                    <button
                      onClick={() => openAddTopicModalHandler(type)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="添加话题"
                    >
                      <FiMessageSquare size={18} />
                    </button>
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleDeleteType(type.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 话题列表 */}
              {expandedType === type.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-700">话题列表</h4>
                    <button
                      onClick={() => openAddTopicModalHandler(type)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <FiPlus size={14} />
                      <span>添加话题</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(type.topics || []).length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">暂无话题</p>
                    ) : (
                      (type.topics || []).map((topic) => {
                        return (
                          <div key={topic.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{topic.name}</span>
                                {!topic.isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    已禁用
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleTopicStatus(topic.id, !topic.isActive)}
                                className={`p-1.5 rounded transition-colors ${
                                  topic.isActive 
                                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={topic.isActive ? '禁用' : '启用'}
                              >
                                {topic.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                              </button>
                              <button
                                onClick={() => openEditTopicModalHandler(topic)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="编辑"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="删除"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 创建任务类型模态框 */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">创建任务类型</h3>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型名称 *</label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="请输入类型名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型描述</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  placeholder="请输入类型描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">适用性别</label>
                <select
                  value={typeForm.gender}
                  onChange={(e) => setTypeForm({ ...typeForm, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标（可选）</label>
                  <input
                    type="text"
                    value={typeForm.icon}
                    onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                    placeholder="图标名称"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={typeForm.sortOrder}
                    onChange={(e) => setTypeForm({ ...typeForm, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddType}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑任务类型模态框 */}
      {showEditTypeModal && currentType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑任务类型</h3>
              <button
                onClick={() => setShowEditTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型名称 *</label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="请输入类型名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型描述</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  placeholder="请输入类型描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">适用性别</label>
                <select
                  value={typeForm.gender}
                  onChange={(e) => setTypeForm({ ...typeForm, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标（可选）</label>
                  <input
                    type="text"
                    value={typeForm.icon}
                    onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                    placeholder="图标名称"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={typeForm.sortOrder}
                    onChange={(e) => setTypeForm({ ...typeForm, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowEditTypeModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditType}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建话题模态框 */}
      {showAddTopicModal && currentType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">为「{currentType.name}」添加话题</h3>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">话题名称 *</label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="请输入话题名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">话题描述</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="请输入话题描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={topicForm.sortOrder}
                  onChange={(e) => setTopicForm({ ...topicForm, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑话题模态框 */}
      {showEditTopicModal && currentTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑话题</h3>
              <button
                onClick={() => setShowEditTopicModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">话题名称 *</label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="请输入话题名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">话题描述</label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="请输入话题描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                <input
                  type="number"
                  value={topicForm.sortOrder}
                  onChange={(e) => setTopicForm({ ...topicForm, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowEditTopicModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditTopic}
                className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
