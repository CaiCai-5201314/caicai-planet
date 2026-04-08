const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bannedWordController = require('../controllers/bannedWordController');
const friendLinkController = require('../controllers/friendLinkController');
const taskController = require('../controllers/taskController');
const taskTypeController = require('../controllers/taskTypeController');
const { auth, adminOnly, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 基础认证
router.use(auth);

// 仪表盘
router.get('/dashboard', requirePermission('dashboard'), adminController.getDashboard);

// 用户管理
router.get('/users', requirePermission('userManagement'), adminController.getUsers);
router.put('/users/:id', requirePermission('userManagement'), adminController.updateUser);
router.put('/users/:id/status', requirePermission('userManagement'), adminController.updateUserStatus);
router.put('/users/:id/ban', requirePermission('userManagement'), adminController.banUser);
router.put('/users/:id/mute', requirePermission('userManagement'), adminController.muteUser);
router.put('/users/:id/post-ban', requirePermission('userManagement'), adminController.postBanUser);
router.post('/users/:id/avatar', requirePermission('userManagement'), upload.single('avatar'), adminController.updateUserAvatar);

// 文章管理
router.get('/posts', requirePermission('postManagement'), adminController.getPosts);
router.put('/posts/:id/status', requirePermission('postManagement'), adminController.updatePostStatus);

// 评论管理
router.get('/comments', requirePermission('commentManagement'), adminController.getComments);
router.put('/comments/:id/status', requirePermission('commentManagement'), adminController.updateCommentStatus);
router.post('/comments/:id/reply', requirePermission('commentManagement'), adminController.replyComment);

// 友链管理
router.get('/friend-links', requirePermission('friendLinkManagement'), adminController.getFriendLinks);
router.post('/friend-links', requirePermission('friendLinkManagement'), friendLinkController.applyFriendLink);
router.put('/friend-links/:id', requirePermission('friendLinkManagement'), friendLinkController.updateFriendLink);
router.delete('/friend-links/:id', requirePermission('friendLinkManagement'), friendLinkController.deleteFriendLink);
router.put('/friend-links/:id/approve', requirePermission('friendLinkManagement'), friendLinkController.approveFriendLink);

// 网站配置管理
router.get('/site-configs', requirePermission('siteConfig'), adminController.getSiteConfigs);
router.post('/site-configs', requirePermission('siteConfig'), adminController.updateSiteConfig);
router.post('/site-configs/batch', requirePermission('siteConfig'), adminController.batchUpdateSiteConfig);

// 违禁词管理
router.get('/banned-words', requirePermission('bannedWordManagement'), bannedWordController.getBannedWords);
router.post('/banned-words', requirePermission('bannedWordManagement'), bannedWordController.addBannedWord);
router.put('/banned-words/:id', requirePermission('bannedWordManagement'), bannedWordController.updateBannedWord);
router.delete('/banned-words/:id', requirePermission('bannedWordManagement'), bannedWordController.deleteBannedWord);
router.get('/banned-words/stats', requirePermission('bannedWordManagement'), bannedWordController.getBannedWordStats);
router.post('/banned-words/bulk', requirePermission('bannedWordManagement'), upload.single('file'), bannedWordController.bulkAddBannedWords);

// 任务中心管理
router.get('/tasks', requirePermission('taskCenter'), taskController.getTasks);
router.get('/tasks/stats', requirePermission('taskCenter'), taskController.getTaskStats);
router.get('/tasks/:id', requirePermission('taskCenter'), taskController.getTaskById);
router.post('/tasks', requirePermission('taskCenter'), taskController.createTask);
router.put('/tasks/:id', requirePermission('taskCenter'), taskController.updateTask);
router.delete('/tasks/:id', requirePermission('taskCenter'), taskController.deleteTask);
router.put('/tasks/:id/status', requirePermission('taskCenter'), taskController.updateTaskStatus);

// 自定义任务类型管理
router.get('/task-types', requirePermission('taskTypeManagement'), taskTypeController.getTaskTypes);
router.get('/task-types/:id', requirePermission('taskTypeManagement'), taskTypeController.getTaskTypeById);
router.post('/task-types', requirePermission('taskTypeManagement'), taskTypeController.createTaskType);
router.put('/task-types/:id', requirePermission('taskTypeManagement'), taskTypeController.updateTaskType);
router.delete('/task-types/:id', requirePermission('taskTypeManagement'), taskTypeController.deleteTaskType);

// 任务类型的话题管理
router.get('/task-types/:id/topics', requirePermission('taskTypeManagement'), taskTypeController.getTaskTypeTopics);
router.post('/task-types/:id/topics', requirePermission('taskTypeManagement'), taskTypeController.createTopic);
router.put('/task-types/topics/:topicId', requirePermission('taskTypeManagement'), taskTypeController.updateTopic);
router.delete('/task-types/topics/:topicId', requirePermission('taskTypeManagement'), taskTypeController.deleteTopic);

// 用户任务管理
router.get('/user-tasks', requirePermission('userTaskManagement'), adminController.getUserTasks);
router.put('/user-tasks/:id/status', requirePermission('userTaskManagement'), adminController.updateUserTaskStatus);
router.delete('/user-tasks/:id', requirePermission('userTaskManagement'), adminController.deleteUserTask);

// 任务提议管理
router.get('/task-proposals', requirePermission('taskCenter'), taskController.getTaskProposals);
router.get('/task-proposals/stats', requirePermission('taskCenter'), taskController.getTaskProposalStats);
router.put('/task-proposals/:id/approve', requirePermission('taskCenter'), taskController.approveTaskProposal);
router.put('/task-proposals/:id/reject', requirePermission('taskCenter'), taskController.rejectTaskProposal);
router.put('/task-proposals/:id', requirePermission('taskCenter'), taskController.updateTaskProposal);

module.exports = router;
