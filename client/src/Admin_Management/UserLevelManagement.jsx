import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function UserLevelManagement() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [newLevel, setNewLevel] = useState({
    name: '',
    level: 1,
    required_exp: 0,
    color: '#3b82f6',
    description: ''
  });

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/user-levels');
      setLevels(response.data?.levels || []);
    } catch (error) {
      console.error('获取账号等级列表失败:', error);
      toast.error('获取账号等级列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLevel = async () => {
    if (!newLevel.name.trim()) {
      toast.error('请输入等级名称');
      return;
    }

    try {
      await api.post('/admin/user-levels', newLevel);
      toast.success('账号等级添加成功');
      setShowAddModal(false);
      setNewLevel({
        name: '',
        level: 1,
        required_exp: 0,
        color: '#3b82f6',
        description: ''
      });
      fetchLevels();
    } catch (error) {
      console.error('添加账号等级失败:', error);
      toast.error('添加账号等级失败');
    }
  };

  const handleEditLevel = async () => {
    if (!currentLevel.name.trim()) {
      toast.error('请输入等级名称');
      return;
    }

    try {
      await api.put(`/admin/user-levels/${currentLevel.id}`, currentLevel);
      toast.success('账号等级更新成功');
      setShowEditModal(false);
      setCurrentLevel(null);
      fetchLevels();
    } catch (error) {
      console.error('更新账号等级失败:', error);
      toast.error('更新账号等级失败');
    }
  };

  const handleDeleteLevel = async (id) => {
    if (window.confirm('确定要删除这个账号等级吗？')) {
      try {
        await api.delete(`/admin/user-levels/${id}`);
        toast.success('账号等级删除成功');
        fetchLevels();
      } catch (error) {
        console.error('删除账号等级失败:', error);
        toast.error('删除账号等级失败');
      }
    }
  };

  const openEditModal = (level) => {
    setCurrentLevel({ ...level });
    setShowEditModal(true);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">账号等级管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
        >
          <FiPlus className="inline mr-2" size={18} />
          添加等级
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow flex flex-col">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : levels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无账号等级
          </div>
        ) : (
          <div className="space-y-4">
            {levels.map((level) => (
              <div key={level.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{level.name}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          所需经验: {level.required_exp}
                        </span>
                      </div>
                      <div className="mt-1 text-gray-600 text-sm">
                        {level.description || '无描述'}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(level)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <FiEdit size={14} className="mr-1" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteLevel(level.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center"
                    >
                      <FiTrash2 size={14} className="mr-1" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加账号等级模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加账号等级</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级名称</label>
                <input
                  type="text"
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                  placeholder="请输入等级名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级数字</label>
                <input
                  type="number"
                  value={newLevel.level}
                  onChange={(e) => setNewLevel({ ...newLevel, level: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所需经验值</label>
                <input
                  type="number"
                  value={newLevel.required_exp}
                  onChange={(e) => setNewLevel({ ...newLevel, required_exp: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级颜色</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={newLevel.color}
                    onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                    className="w-12 h-12 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newLevel.color}
                    onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级描述</label>
                <textarea
                  value={newLevel.description}
                  onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                  placeholder="请输入等级描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddLevel}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑账号等级模态框 */}
      {showEditModal && currentLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑账号等级</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级名称</label>
                <input
                  type="text"
                  value={currentLevel.name}
                  onChange={(e) => setCurrentLevel({ ...currentLevel, name: e.target.value })}
                  placeholder="请输入等级名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级数字</label>
                <input
                  type="number"
                  value={currentLevel.level}
                  onChange={(e) => setCurrentLevel({ ...currentLevel, level: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所需经验值</label>
                <input
                  type="number"
                  value={currentLevel.required_exp}
                  onChange={(e) => setCurrentLevel({ ...currentLevel, required_exp: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级颜色</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={currentLevel.color}
                    onChange={(e) => setCurrentLevel({ ...currentLevel, color: e.target.value })}
                    className="w-12 h-12 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentLevel.color}
                    onChange={(e) => setCurrentLevel({ ...currentLevel, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">等级描述</label>
                <textarea
                  value={currentLevel.description}
                  onChange={(e) => setCurrentLevel({ ...currentLevel, description: e.target.value })}
                  placeholder="请输入等级描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditLevel}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
