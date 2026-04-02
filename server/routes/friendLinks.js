const express = require('express');
const router = express.Router();
const friendLinkController = require('../controllers/friendLinkController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', friendLinkController.getFriendLinks);
router.post('/apply', optionalAuth, friendLinkController.applyFriendLink);
router.get('/my-applications', auth, friendLinkController.getMyApplications);
router.put('/:id', auth, friendLinkController.updateFriendLink);
router.delete('/:id', auth, friendLinkController.deleteFriendLink);
router.put('/:id/approve', auth, friendLinkController.approveFriendLink);

module.exports = router;
