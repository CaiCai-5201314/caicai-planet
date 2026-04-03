import { useState, useEffect } from 'react';
import { FiAlertCircle, FiEdit2, FiTrash2, FiPlus, FiClock, FiSave, FiX, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ErrorTypes = () => {
  const [errorTypes, setErrorTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [currentErrorType, setCurrentErrorType] = useState(null);
  const [currentVersions, setCurrentVersions] = useState([]);
  const [newErrorType, setNewErrorType] = useState({
    error_code: '',
    error_name: '',
    error_description: '',
    solution: '',
    category: 'general',
    severity: 'medium',
    http_status: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchErrorTypes();
    fetchCategories();
  }, [searchTerm, categoryFilter, severityFilter]);

  const fetchErrorTypes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      if (severityFilter) {
        params.append('severity', severityFilter);
      }
      const response = await api.get(`/admin/error-types?${params.toString()}`);
      setErrorTypes(response.data.errorTypes);
    } catch (error) {
      console.error('获取错误类型列表失败:', error);
      toast.error('获取错误类型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/error-type-categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('获取错误类型分类失败:', error);
    }
  };

  const handleAddErrorType = async () => {
    if (!newErrorType.error_code || !newErrorType.error_name || !newErrorType.error_description) {
      toast.error('请填写完整的错误类型信息');
      return;
    }

    try {
      await api.post('/admin/error-types', newErrorType);
      toast.success('创建错误类型成功');
      setShowAddModal(false);
      setNewErrorType({
        error_code: '',
        error_name: '',
        error_description: '',
        solution: '',
        category: 'general',
        severity: 'medium',
        http_status: null
      });
      fetchErrorTypes();
    } catch (error) {
      console.error('创建错误类型失败:', error);
      toast.error('创建错误类型失败');
    }
  };

  const handleEditErrorType = async () => {
    if (!currentErrorType.error_code || !currentErrorType.error_name || !currentErrorType.error_description) {
      toast.error('请填写完整的错误类型信息');
      return;
    }

    try {
      await api.put(`/admin/error-types/${currentErrorType.id}`, currentErrorType);
      toast.success('更新错误类型成功');
      setShowEditModal(false);
      setCurrentErrorType(null);
      fetchErrorTypes();
    } catch (error) {
      console.error('更新错误类型失败:', error);
      toast.error('更新错误类型失败');
    }
  };

  const handleDeleteErrorType = async (id) => {
    if (window.confirm('确定要删除这个错误类型吗？')) {
      try {
        await api.delete(`/admin/error-types/${id}`);
        toast.success('删除错误类型成功');
        fetchErrorTypes();
      } catch (error) {
        console.error('删除错误类型失败:', error);
        toast.error('删除错误类型失败');
      }
    }
  };

  const handleViewVersions = async (id) => {
    try {
      const response = await api.get(`/admin/error-types/${id}/versions`);
      setCurrentVersions(response.data.versions);
      setShowVersionsModal(true);
    } catch (error) {
      console.error('获取版本历史失败:', error);
      toast.error('获取版本历史失败');
    }
  };

  const severityMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  };

  const severityColorMap = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const severityOptions = [
    { value: '', label: '所有级别' },
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '严重' }
  ];

  const categoryOptions = [
    { value: '', label: '所有分类' },
    ...categories.map(category => ({ value: category, label: category }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">错误类型管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          添加错误类型
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="搜索错误类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
            >
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : errorTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无错误类型
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">错误代码</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">错误名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">级别</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">HTTP状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {errorTypes.map((errorType) => (
                  <tr key={errorType.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{errorType.error_code}</td>
                    <td className="py-3 px-4 text-gray-900">{errorType.error_name}</td>
                    <td className="py-3 px-4 text-gray-600">{errorType.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColorMap[errorType.severity]}`}>
                        {severityMap[errorType.severity]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{errorType.http_status || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentErrorType({ ...errorType });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleViewVersions(errorType.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="版本历史"
                        >
                          <FiClock size={18} />
                        </button>
                        {errorType.is_custom && (
                          <button
                            onClick={() => handleDeleteErrorType(errorType.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 添加错误类型模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">添加错误类型</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误代码 *</label>
                <input
                  type="text"
                  value={newErrorType.error_code}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="例如: ERROR_404"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误名称 *</label>
                <input
                  type="text"
                  value={newErrorType.error_name}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="例如: 资源未找到"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误描述 *</label>
                <textarea
                  value={newErrorType.error_description}
                  onChange={(e) => setNewErrorType({ ...newErrorType, error_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="详细描述错误情况..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">解决方案</label>
                <textarea
                  value={newErrorType.solution}
                  onChange={(e) => setNewErrorType({ ...newErrorType, solution: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="建议的解决方案..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={newErrorType.category}
                    onChange={(e) => setNewErrorType({ ...newErrorType, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="general">通用</option>
                    <option value="authentication">认证</option>
                    <option value="authorization">授权</option>
                    <option value="database">数据库</option>
                    <option value="network">网络</option>
                    <option value="validation">验证</option>
                    <option value="system">系统</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">级别</label>
                  <select
                    value={newErrorType.severity}
                    onChange={(e) => setNewErrorType({ ...newErrorType, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="critical">严重</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTTP状态码</label>
                  <input
                    type="number"
                    value={newErrorType.http_status || ''}
                    onChange={(e) => setNewErrorType({ ...newErrorType, http_status: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                    placeholder="例如: 404"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddErrorType}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑错误类型模态框 */}
      {showEditModal && currentErrorType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑错误类型</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误代码 *</label>
                <input
                  type="text"
                  value={currentErrorType.error_code}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误名称 *</label>
                <input
                  type="text"
                  value={currentErrorType.error_name}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">错误描述 *</label>
                <textarea
                  value={currentErrorType.error_description}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, error_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">解决方案</label>
                <textarea
                  value={currentErrorType.solution || ''}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, solution: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={currentErrorType.category}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="general">通用</option>
                    <option value="authentication">认证</option>
                    <option value="authorization">授权</option>
                    <option value="database">数据库</option>
                    <option value="network">网络</option>
                    <option value="validation">验证</option>
                    <option value="system">系统</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">级别</label>
                  <select
                    value={currentErrorType.severity}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="critical">严重</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HTTP状态码</label>
                  <input
                    type="number"
                    value={currentErrorType.http_status || ''}
                    onChange={(e) => setCurrentErrorType({ ...currentErrorType, http_status: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">修改说明</label>
                <input
                  type="text"
                  value={currentErrorType.change_note || ''}
                  onChange={(e) => setCurrentErrorType({ ...currentErrorType, change_note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  placeholder="描述本次修改的内容..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditErrorType}
                  className="flex-1 px-4 py-2 bg-planet-purple text-white rounded-xl hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 版本历史模态框 */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">版本历史</h3>
              <button onClick={() => setShowVersionsModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {currentVersions.length === 0 ? (
                <p className="text-center py-4 text-gray-500">暂无版本历史</p>
              ) : (
                <div className="space-y-4">
                  {currentVersions.map((version) => (
                    <div key={version.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">版本 {version.version}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>错误代码:</strong> {version.error_code}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>错误名称:</strong> {version.error_name}
                      </div>
                      {version.change_note && (
                        <div className="text-sm text-gray-600">
                          <strong>修改说明:</strong> {version.change_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorTypes;