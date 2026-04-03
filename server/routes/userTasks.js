const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userTaskController = require('../controllers/userTaskController');

// 接受任务
router.post('/:taskId/accept', auth, userTaskController.acceptTask);

// 取消任务
router.post('/:taskId/cancel', auth, userTaskController.cancelTask);

// 完成任务
router.post('/:taskId/complete', auth, userTaskController.completeTask);

// 获取用户接受的任务列表
router.get('/my-tasks', auth, userTaskController.getUserTasks);

// 获取用户点赞的任务列表
router.get('/my-likes', auth, userTaskController.getUserLikedTasks);

// 检查任务状态
router.get('/:taskId/status', auth, userTaskController.checkTaskStatus);

module.exports = router;
