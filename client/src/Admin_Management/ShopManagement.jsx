import { useState, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiPlus, FiSave, FiCheck, FiX, FiFilter, FiSearch, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ShopManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    icon: '',
    category: 'general'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      const response = await api.get(`/shop/admin/products?${params.toString()}`);
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('获取商品列表失败:', error);
      toast.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.description.trim() || newProduct.price <= 0 || newProduct.stock < 0) {
      toast.error('请填写完整的商品信息');
      return;
    }

    try {
      await api.post('/shop/admin/products', newProduct);
      toast.success('商品添加成功');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        icon: '',
        category: 'general'
      });
      fetchProducts();
    } catch (error) {
      console.error('添加商品失败:', error);
      toast.error('添加商品失败');
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct.name.trim() || !currentProduct.description.trim() || currentProduct.price <= 0 || currentProduct.stock < 0) {
      toast.error('请填写完整的商品信息');
      return;
    }

    try {
      await api.put(`/shop/admin/products/${currentProduct.id}`, currentProduct);
      toast.success('商品更新成功');
      setShowEditModal(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('更新商品失败:', error);
      toast.error('更新商品失败');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      try {
        await api.delete(`/shop/admin/products/${id}`);
        toast.success('商品删除成功');
        fetchProducts();
      } catch (error) {
        console.error('删除商品失败:', error);
        toast.error('删除商品失败');
      }
    }
  };

  const handleToggleProductStatus = async (id, currentStatus) => {
    try {
      await api.put(`/shop/admin/products/${id}/status`, {
        status: currentStatus === 'active' ? 'hidden' : 'active'
      });
      toast.success(currentStatus === 'active' ? '商品已隐藏' : '商品已显示');
      fetchProducts();
    } catch (error) {
      console.error('切换商品状态失败:', error);
      toast.error('切换商品状态失败');
    }
  };

  const categoryOptions = [
    { value: '', label: '所有分类' },
    { value: 'general', label: '通用' },
    { value: 'boost', label: '增益' },
    { value: 'cosmetic', label: '外观' },
    { value: 'other', label: '其他' }
  ];

  // 图标库
  const emojiIcons = [
    '🎁', '🎯', '⭐', '🔥', '💎', '✨', '💝', '🎨', '📦', '🔮',
    '🎉', '🎊', '🎈', '🎂', '🎃', '🎄', '🎋', '🎍', '🎎', '🎏',
    '🎐', '🎑', '🎒', '🎓', '🎖️', '🎗️', '🎟️', '🎫', '🎭', '🎪',
    '🎬', '🎨', '🎧', '🎤', '🎼', '🎹', '🎸', '🎺', '🎻', '🎷',
    '🎶', '🎵', '🎯', '🎱', '🎲', '🎰', '🎳', '🎴', '🎵', '🎶'
  ];
  
  // 状态管理
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerType, setIconPickerType] = useState('new'); // 'new' or 'edit'

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">星星小卖部管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
        >
          <FiPlus className="inline mr-2" size={16} />
          添加商品
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索商品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-planet-purple" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiPlus size={48} className="mx-auto mb-4" />
            <p>暂无商品，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{product.icon || '🎁'}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {categoryOptions.find(opt => opt.value === product.category)?.label || product.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {product.status === 'active' ? '显示' : '隐藏'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-planet-purple">{product.price} 月球分</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          库存: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentProduct({ ...product });
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleProductStatus(product.id, product.status)}
                      className={`p-2 hover:rounded-lg transition-colors ${product.status === 'active' ? 'text-gray-600 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={product.status === 'active' ? '隐藏' : '显示'}
                    >
                      {product.status === 'active' ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加商品模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">添加商品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="请输入商品名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="请输入商品描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 (月球分)</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    placeholder="请输入价格"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    placeholder="请输入库存"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图标 (emoji)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newProduct.icon}
                    onChange={(e) => setNewProduct({ ...newProduct, icon: e.target.value })}
                    placeholder="例如: 🎁"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerType('new');
                      setShowIconPicker(true);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-planet-purple"
                  >
                    🎨
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {categoryOptions.filter(opt => opt.value).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑商品模态框 */}
      {showEditModal && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">编辑商品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  placeholder="请输入商品名称"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                <textarea
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  placeholder="请输入商品描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 (月球分)</label>
                  <input
                    type="number"
                    min="1"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    placeholder="请输入价格"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    placeholder="请输入库存"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图标 (emoji)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={currentProduct.icon}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, icon: e.target.value })}
                    placeholder="例如: 🎁"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIconPickerType('edit');
                      setShowIconPicker(true);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-planet-purple"
                  >
                    🎨
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={currentProduct.category}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-planet-purple"
                >
                  {categoryOptions.filter(opt => opt.value).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleEditProduct}
                  className="px-4 py-2 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图标选择器模态框 */}
      {showIconPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">选择图标</h3>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {emojiIcons.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (iconPickerType === 'new') {
                      setNewProduct({ ...newProduct, icon: emoji });
                    } else if (iconPickerType === 'edit' && currentProduct) {
                      setCurrentProduct({ ...currentProduct, icon: emoji });
                    }
                    setShowIconPicker(false);
                  }}
                  className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowIconPicker(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;