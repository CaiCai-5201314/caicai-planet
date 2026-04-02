const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bannedWordController = require('../controllers/bannedWordController');
const friendLinkController = require('../controllers/friendLinkController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(auth, adminOnly);

// 仪表盘
router.get('/dashboard', adminController.getDashboard);

// 用户管理
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/mute', adminController.muteUser);
router.put('/users/:id/post-ban', adminController.postBanUser);
router.post('/users/:id/avatar', upload.single('avatar'), adminController.updateUserAvatar);

// 文章管理
router.get('/posts', adminController.getPosts);
router.put('/posts/:id/status', adminController.updatePostStatus);

// 评论管理
router.get('/comments', adminController.getComments);

// 友链管理
router.get('/friend-links', adminController.getFriendLinks);

// 网站配置管理
router.get('/site-configs', adminController.getSiteConfigs);
router.post('/site-configs', adminController.updateSiteConfig);
router.post('/site-configs/batch', adminController.batchUpdateSiteConfig);

// 违禁词管理
router.get('/banned-words', bannedWordController.getBannedWords);
router.post('/banned-words', bannedWordController.addBannedWord);
router.put('/banned-words/:id', bannedWordController.updateBannedWord);
router.delete('/banned-words/:id', bannedWordController.deleteBannedWord);

// 评论管理
router.get('/comments', adminController.getComments);
router.put('/comments/:id/status', adminController.updateCommentStatus);
router.post('/comments/:id/reply', adminController.replyComment);

// 友链管理
router.get('/friend-links', adminController.getFriendLinks);
router.post('/friend-links', friendLinkController.applyFriendLink);
router.put('/friend-links/:id', friendLinkController.updateFriendLink);
router.delete('/friend-links/:id', friendLinkController.deleteFriendLink);
router.put('/friend-links/:id/approve', friendLinkController.approveFriendLink);

module.exports = router;
