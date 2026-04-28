const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { auth, adminOnly } = require('../middleware/auth');

// 公共路由
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);

// 需要登录的路由
router.post('/purchase', auth, shopController.purchaseProduct);

// 管理员路由
router.post('/admin/products', auth, adminOnly, shopController.createProduct);
router.put('/admin/products/:id', auth, adminOnly, shopController.updateProduct);
router.delete('/admin/products/:id', auth, adminOnly, shopController.deleteProduct);
router.get('/admin/products', auth, adminOnly, shopController.getAllProducts);
router.put('/admin/products/:id/status', auth, adminOnly, shopController.toggleProductStatus);

// 用户路由
router.get('/purchase-records', auth, shopController.getUserPurchaseRecords);

module.exports = router;