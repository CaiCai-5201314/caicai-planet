const express = require('express');
const router = express.Router();
const poolController = require('../controllers/poolController');
const { auth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

router.post('/', auth, adminMiddleware, poolController.createPool);
router.get('/', auth, adminMiddleware, poolController.getPools);
router.get('/:id', auth, adminMiddleware, poolController.getPoolById);
router.put('/:id', auth, adminMiddleware, poolController.updatePool);
router.delete('/:id', auth, adminMiddleware, poolController.deletePool);
router.post('/:id/files', auth, adminMiddleware, poolController.addFilesToPool);
router.delete('/:id/files', auth, adminMiddleware, poolController.removeFilesFromPool);
router.post('/:id/draw', auth, poolController.drawFromPool);

module.exports = router;