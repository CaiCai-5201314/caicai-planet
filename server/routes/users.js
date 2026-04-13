const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const taskTypeController = require('../controllers/taskTypeController');
const taskController = require('../controllers/taskController');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile/:username', optionalAuth, userController.getProfile);
router.get('/:username/posts', userController.getUserPosts);
router.get('/favorites', auth, userController.getUserFavorites);
router.get('/likes', auth, userController.getUserLikes);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.post('/cover', auth, upload.single('cover'), userController.uploadCover);
router.put('/settings', auth, userController.updateSettings);

// 获取任务类型（普通用户也可访问）
router.get('/task-types', taskTypeController.getTaskTypes);
router.get('/task-types/:id', taskTypeController.getTaskTypeById);

// 获取任务列表（普通用户也可访问）
router.get('/tasks', taskController.getTasks);
router.get('/tasks/:id', taskController.getTaskById);

// 任务点赞/取消点赞
router.post('/tasks/:id/like', auth, taskController.likeTask);
router.post('/tasks/:id/unlike', auth, taskController.unlikeTask);

// 任务提议
router.post('/task-proposals', auth, taskController.createTaskProposal);

module.exports = router;
