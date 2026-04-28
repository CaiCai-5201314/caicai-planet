const { Product } = require('./models');

async function testGetProducts() {
  try {
    console.log('测试获取商品列表...');
    const products = await Product.findAll({
      order: [['created_at', 'DESC']]
    });
    console.log('成功获取商品列表:', products.length, '个商品');
    console.log('商品详情:', JSON.stringify(products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      status: p.status
    })), null, 2));
  } catch (error) {
    console.error('获取商品列表失败:', error);
    console.error('错误详情:', error.stack);
  }
}

testGetProducts();