const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const bannedWordCheck = require('../middleware/bannedWordCheck');

router.get('/', optionalAuth, postController.getPosts);
router.get('/:id', optionalAuth, postController.getPost);
router.post('/', auth, upload.single('cover_image'), bannedWordCheck, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/:id/like', auth, postController.likePost);
router.post('/:id/favorite', auth, postController.favoritePost);

module.exports = router;
