import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * 格式化月球分显示（小数点后1位）
 * @param {number} points - 月球分数值
 * @returns {string} 格式化后的字符串
 */
const formatMoonPoints = (points) => {
  const num = parseFloat(points) || 0;
  return num.toFixed(1);
};

export default function MoonPointRuleManagement() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    reason_type: '',
    base_points: 0,
    need_approval: true,
    daily_limit: null,
    description: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/moon-point-rules');
      setRules(response.data?.rules || []);
    } catch (error) {
      console.error('获取月球分规则失败:', error);
      toast.error('获取月球分规则失败');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultRules = async () => {
    if (!window.confirm('确定要初始化默认规则吗？这不会覆盖已有的规则。')) {
      return;
    }

    try {
      await api.post('/moon-point-rules/admin/initialize');
      toast.success('默认规则初始化成功');
      fetchRules();
    } catch (error) {
      console.error('初始化默认规则失败:', error);
      toast.error(error.response?.data?.message || '初始化默认规则失败');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'base_points' ? (value === '' ? null : parseFloat(value)) : (name === 'daily_limit' ? (value === '' ? null : parseInt(value)) : value))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRule) {
        await api.put(`/moon-point-rules/admin/${editingRule.id}`, formData);
        toast.success('规则更新成功');
      } else {
        await api.post('/moon-point-rules/admin', formData);
        toast.success('规则创建成功');
      }

      setShowModal(false);
      setEditingRule(null);
      setFormData({
        name: '',
        reason_type: '',
        base_points: 0,
        need_approval: true,
        daily_limit: null,
        description: ''
      });
      fetchRules();
    } catch (error) {
      console.error('保存规则失败:', error);
      toast.error(error.response?.data?.message || '保存规则失败');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      reason_type: rule.reason_type,
      base_points: rule.base_points,
      need_approval: rule.need_approval,
      daily_limit: rule.daily_limit,
      description: rule.description || ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (rule) => {
    try {
      await api.put(`/moon-point-rules/admin/${rule.id}`, {
        is_active: !rule.is_active
      });
      toast.success(`规则已${!rule.is_active ? '启用' : '禁用'}`);
      fetchRules();
    } catch (error) {
      console.error('更新规则状态失败:', error);
      toast.error(error.response?.data?.message || '更新规则状态失败');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">月球分获取规则</h2>
        <button
          onClick={initializeDefaultRules}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          初始化默认规则
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          暂无规则，请点击「初始化默认规则」创建默认规则
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                rule.need_approval ? 'border-amber-500' : 'border-green-500'
              } hover:shadow-md transition-all flex items-center gap-6`}
            >
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-purple-600">
                  +{formatMoonPoints(rule.base_points)}
                </div>
                <div className="text-xs text-gray-500 text-center">月球分</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{rule.name}</h3>
                  {!rule.is_active && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex-shrink-0">
                      已禁用
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">审核:</span>
                    <span className={rule.need_approval ? 'text-amber-600' : 'text-green-600'}>
                      {rule.need_approval ? '需要' : '无需'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">每日限制:</span>
                    <span>{rule.daily_limit ? `${rule.daily_limit}次` : '无限制'}</span>
                  </div>
                </div>

                {rule.description && (
                  <p className="text-sm text-gray-500 truncate">{rule.description}</p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(rule)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleToggleActive(rule)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    rule.is_active
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {rule.is_active ? '禁用' : '启用'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingRule ? '编辑规则' : '创建规则'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  规则名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  基础月球分
                </label>
                <input
                  type="number"
                  name="base_points"
                  value={formData.base_points || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  每日限制次数（留空表示无限制）
                </label>
                <input
                  type="number"
                  name="daily_limit"
                  value={formData.daily_limit || ''}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needApproval"
                  name="need_approval"
                  checked={formData.need_approval}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="needApproval" className="text-sm font-medium text-gray-700 cursor-pointer">
                  需要审核
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  规则描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}