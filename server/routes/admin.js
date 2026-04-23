const express = require('express');
const router = express.Router();

// 导入新的管理控制器
const dashboardAdminController = require('../controllers/dashboardAdminController');
const userAdminController = require('../controllers/userAdminController');
const postAdminController = require('../controllers/postAdminController');
const commentAdminController = require('../controllers/commentAdminController');
const siteConfigAdminController = require('../controllers/siteConfigAdminController');
const userTaskAdminController = require('../controllers/userTaskAdminController');
const userLevelController = require('../controllers/userLevelController');

const bannedWordController = require('../controllers/bannedWordController');
const friendLinkController = require('../controllers/friendLinkController');
const taskController = require('../controllers/taskController');
const taskTypeController = require('../controllers/taskTypeController');
const { auth, adminOnly, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 基础认证
router.use(auth);

// 仪表盘
router.get('/dashboard', requirePermission('dashboard'), dashboardAdminController.getDashboard);

// 用户管理
router.get('/users', requirePermission('userManagement'), userAdminController.getUsers);
router.put('/users/:id', requirePermission('userManagement'), userAdminController.updateUser);
router.put('/users/:id/status', requirePermission('userManagement'), userAdminController.updateUserStatus);
router.put('/users/:id/ban', requirePermission('userManagement'), userAdminController.banUser);
router.put('/users/:id/mute', requirePermission('userManagement'), userAdminController.muteUser);
router.put('/users/:id/post-ban', requirePermission('userManagement'), userAdminController.postBanUser);
router.post('/users/:id/avatar', requirePermission('userManagement'), upload.single('avatar'), userAdminController.updateUserAvatar);
router.delete('/users/:id', requirePermission('userManagement'), userAdminController.deleteUser);

// 账号等级管理
router.get('/user-levels', requirePermission('userLevelManagement'), userLevelController.getAllLevels);
router.post('/user-levels', requirePermission('userLevelManagement'), userLevelController.createLevel);
router.get('/user-levels/:id', requirePermission('userLevelManagement'), userLevelController.getLevel);
router.put('/user-levels/:id', requirePermission('userLevelManagement'), userLevelController.updateLevel);
router.delete('/user-levels/:id', requirePermission('userLevelManagement'), userLevelController.deleteLevel);

// 文章管理
router.get('/posts', requirePermission('postManagement'), postAdminController.getPosts);
router.put('/posts/:id/status', requirePermission('postManagement'), postAdminController.updatePostStatus);

// 评论管理
router.get('/comments', requirePermission('commentManagement'), commentAdminController.getComments);
router.put('/comments/:id/status', requirePermission('commentManagement'), commentAdminController.updateCommentStatus);
router.post('/comments/:id/reply', requirePermission('commentManagement'), commentAdminController.replyComment);

// 友链管理
router.get('/friend-links', requirePermission('friendLinkManagement'), friendLinkController.getFriendLinks);
router.post('/friend-links', requirePermission('friendLinkManagement'), friendLinkController.applyFriendLink);
router.put('/friend-links/:id', requirePermission('friendLinkManagement'), friendLinkController.updateFriendLink);
router.delete('/friend-links/:id', requirePermission('friendLinkManagement'), friendLinkController.deleteFriendLink);
router.put('/friend-links/:id/approve', requirePermission('friendLinkManagement'), friendLinkController.approveFriendLink);

// 外链接管理
const shareController = require('../controllers/shareController');
router.post('/friend-links/:id/share', requirePermission('friendLinkManagement'), shareController.generateShareLink);
router.get('/friend-links/:id/share', requirePermission('friendLinkManagement'), shareController.getShareLinkInfo);
router.post('/friend-links/:id/share/reset', requirePermission('friendLinkManagement'), shareController.resetShareLink);

// 网站配置管理
router.get('/site-configs', requirePermission('siteConfig'), siteConfigAdminController.getSiteConfigs);
router.post('/site-configs', requirePermission('siteConfig'), siteConfigAdminController.updateSiteConfig);
router.post('/site-configs/batch', requirePermission('siteConfig'), siteConfigAdminController.batchUpdateSiteConfig);

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
router.get('/user-tasks', requirePermission('userTaskManagement'), userTaskAdminController.getUserTasks);
router.put('/user-tasks/:id/status', requirePermission('userTaskManagement'), userTaskAdminController.updateUserTaskStatus);
router.delete('/user-tasks/:id', requirePermission('userTaskManagement'), userTaskAdminController.deleteUserTask);

// 任务提议管理
router.get('/task-proposals', requirePermission('taskCenter'), taskController.getTaskProposals);
router.get('/task-proposals/stats', requirePermission('taskCenter'), taskController.getTaskProposalStats);
router.put('/task-proposals/:id/approve', requirePermission('taskCenter'), taskController.approveTaskProposal);
router.put('/task-proposals/:id/reject', requirePermission('taskCenter'), taskController.rejectTaskProposal);
router.put('/task-proposals/:id', requirePermission('taskCenter'), taskController.updateTaskProposal);
router.delete('/task-proposals/:id', requirePermission('taskCenter'), taskController.deleteTaskProposal);

module.exports = router;
