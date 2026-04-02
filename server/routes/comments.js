const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth } = require('../middleware/auth');
const bannedWordCheck = require('../middleware/bannedWordCheck');

router.get('/', commentController.getComments);
router.post('/', auth, bannedWordCheck, commentController.createComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
