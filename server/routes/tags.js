const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', tagController.getTags);
router.get('/popular', tagController.getPopularTags);
router.post('/', auth, adminOnly, tagController.createTag);
router.put('/:id', auth, adminOnly, tagController.updateTag);
router.delete('/:id', auth, adminOnly, tagController.deleteTag);

module.exports = router;
