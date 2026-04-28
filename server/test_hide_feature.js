const { Product } = require('./models');

async function testHideFeature() {
  try {
    // 检查当前商品状态
    const products = await Product.findAll({
      attributes: ['id', 'name', 'status']
    });
    console.log('当前商品状态:');
    products.forEach(p => {
      console.log(`ID: ${p.id}, 名称: ${p.name}, 状态: ${p.status}`);
    });

    // 测试隐藏商品
    const product = products[0];
    if (product) {
      const newStatus = product.status === 'active' ? 'hidden' : 'active';
      await product.update({ status: newStatus });
      console.log(`\n已将商品 ${product.name} 的状态改为: ${newStatus}`);

      // 测试用户端接口（只返回active状态的商品）
      const activeProducts = await Product.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name', 'status']
      });
      console.log('\n用户端可见商品（status=active）:');
      activeProducts.forEach(p => {
        console.log(`ID: ${p.id}, 名称: ${p.name}, 状态: ${p.status}`);
      });
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testHideFeature();