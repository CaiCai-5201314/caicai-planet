const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/:username', optionalAuth, userController.getProfile);
router.get('/:username/posts', userController.getUserPosts);
router.get('/favorites', auth, userController.getUserFavorites);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.post('/cover', auth, upload.single('cover'), userController.uploadCover);

module.exports = router;
