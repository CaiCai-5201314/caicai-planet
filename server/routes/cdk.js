const express = require('express');
const router = express.Router();
const cdkController = require('../controllers/cdkController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

router.post('/generate', auth, adminMiddleware, (req, res) => {
  console.log('=== CDK Generate Route Called ===');
  console.log('User:', req.user?.id, req.user?.username);
  console.log('Body:', JSON.stringify(req.body));
  cdkController.generateCDK(req, res);
});

router.get('/records', auth, adminMiddleware, cdkController.getCDKUseRecords);

router.get('/statistics', auth, adminMiddleware, (req, res) => {
  console.log('=== CDK Statistics Route Called ===');
  console.log('User:', req.user?.id, req.user?.username);
  cdkController.getCDKStatistics(req, res);
});

router.get('/my-records', auth, cdkController.getMyCDKRecords);

router.get('/', auth, adminMiddleware, (req, res) => {
  console.log('=== CDK List Route Called ===');
  console.log('User:', req.user?.id, req.user?.username);
  console.log('Query:', JSON.stringify(req.query));
  cdkController.getCDKList(req, res);
});

router.get('/:id', auth, adminMiddleware, cdkController.getCDKById);

router.put('/:id', auth, adminMiddleware, cdkController.updateCDK);

router.delete('/:id', auth, adminMiddleware, cdkController.deleteCDK);

router.post('/exchange', auth, cdkController.exchangeCDK);

router.get('/download/:record_id/:file_index', auth, cdkController.downloadCDKFile);

module.exports = router;