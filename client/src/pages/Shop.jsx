import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Shop = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [purchaseRecords, setPurchaseRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // products, records, my-items

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // 当切换到需要购买记录的标签时，获取购买记录
  useEffect(() => {
    if (isAuthenticated && (activeTab === 'my-items' || activeTab === 'records')) {
      fetchPurchaseRecords();
    }
  }, [isAuthenticated, activeTab]);

  // 监听购买记录更新事件（来自骰子游戏投掷完成）
  useEffect(() => {
    const handleRecordsUpdated = () => {
      if (activeTab === 'my-items' || activeTab === 'records') {
        fetchPurchaseRecords();
      }
    };
    
    window.addEventListener('purchaseRecordsUpdated', handleRecordsUpdated);
    
    return () => {
      window.removeEventListener('purchaseRecordsUpdated', handleRecordsUpdated);
    };
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shop/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('获取商品失败:', error);
      toast.error('获取商品失败');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shop/purchase-records');
      const records = response.data.records || [];
      setPurchaseRecords(records);
      // 存储购买记录到localStorage
      localStorage.setItem('purchaseRecords', JSON.stringify(records));
    } catch (error) {
      console.error('获取购买记录失败:', error);
      toast.error('获取购买记录失败');
      setPurchaseRecords([]);
      localStorage.setItem('purchaseRecords', JSON.stringify([]));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }

    if (user.moon_points < product.price) {
      toast.error('月球分不足');
      return;
    }

    try {
      setPurchasing(true);
      const purchaseResponse = await api.post('/shop/purchase', { product_id: product.id });
      toast.success('购买成功');
      // 刷新商品列表和用户信息
      fetchProducts();
      // 触发用户信息更新
      window.dispatchEvent(new CustomEvent('userDataUpdated'));
      
      // 检查是否购买的是骰子游戏解锁券
      if (product.name === '骰子游戏' || product.category === 'dice') {
        // 购买后不立即设置解锁状态，让用户在实验室页面从后端获取状态
        // 这样确保状态的一致性
        toast.success('骰子游戏已购买，请前往星球实验室使用！');
      }
      
      // 重新获取购买记录，确保localStorage中的记录是最新的
      await fetchPurchaseRecords();
    } catch (error) {
      console.error('购买失败:', error);
      toast.error('购买失败');
    } finally {
      setPurchasing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">星球小卖部</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              请先登录后查看和购买商品
            </p>
            <a
              href="/login"
              className="px-6 py-3 bg-planet-purple text-white rounded-lg hover:bg-planet-purple/90 transition-colors"
            >
              去登录
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-24">
          <div className="w-12 h-12 border-4 border-planet-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">星星小卖部</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                消耗月球分购买各种商品和服务
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                我的月球分:
              </span>
              <span className="text-lg font-bold text-planet-purple">
                {user.moon_points}
              </span>
            </div>
          </div>

          {/* 标签栏 */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-planet-purple text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              商品列表
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'records' ? 'bg-planet-purple text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              购买记录
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-items')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'my-items' ? 'bg-planet-purple text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              我的物品
            </button>
          </div>

          {/* 商品列表 */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无商品</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    商品即将上架，敬请期待
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105"
                  >
                    <div className="p-6">
                      <div className="text-4xl mb-4">{product.icon || '🎁'}</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-planet-purple">
                          {product.price} 月球分
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {product.stock > 0 ? `库存: ${product.stock}` : '已售罄'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchase(product)}
                        disabled={purchasing || product.stock <= 0 || user.moon_points < product.price}
                        className={cn(
                          'w-full py-2.5 rounded-lg font-medium transition-colors',
                          purchasing
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : product.stock <= 0
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : user.moon_points < product.price
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-planet-purple text-white hover:bg-planet-purple/90'
                        )}
                      >
                        {purchasing ? '购买中...' : product.stock <= 0 ? '已售罄' : user.moon_points < product.price ? '月球分不足' : '立即购买'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 购买记录 */}
          {activeTab === 'records' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">我的购买记录</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseRecords.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无购买记录</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      您还没有购买过任何商品
                    </p>
                  </div>
                ) : (
                  purchaseRecords.map((record) => (
                    <div key={record.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{record.product_name}</h4>
                        <span className="text-lg font-bold text-planet-purple">{record.price} 月球分</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>购买时间: {new Date(record.purchased_at).toLocaleString()}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          {record.status === 'completed' ? '已完成' : '已取消'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 我的物品 */}
          {activeTab === 'my-items' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">我的物品</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchaseRecords.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="text-6xl mb-4">🎒</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无物品</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      您还没有购买过任何物品
                    </p>
                  </div>
                ) : (
                  purchaseRecords.map((record) => {
                    // 优先使用后端返回的使用状态，如果没有则回退到localStorage
                    const usedItems = JSON.parse(localStorage.getItem('usedItems') || '{}');
                    const isUsed = record.used !== undefined ? record.used : (usedItems[record.id] || false);
                    
                    return (
                      <div key={record.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{record.product_name}</h4>
                          <span className={`px-2 py-1 rounded-full text-sm ${isUsed ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            {isUsed ? '已使用' : '未使用'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>购买时间: {new Date(record.purchased_at).toLocaleString()}</span>
                          <span className="text-planet-purple font-medium">{record.price} 月球分</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;