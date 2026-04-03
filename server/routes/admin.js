const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bannedWordController = require('../controllers/bannedWordController');
const friendLinkController = require('../controllers/friendLinkController');
const taskController = require('../controllers/taskController');
const taskTypeController = require('../controllers/taskTypeController');
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
router.get('/banned-words/stats', bannedWordController.getBannedWordStats);
router.post('/banned-words/bulk', upload.single('file'), bannedWordController.bulkAddBannedWords);

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

// 任务中心管理
router.get('/tasks', taskController.getTasks);
router.get('/tasks/stats', taskController.getTaskStats);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.put('/tasks/:id/status', taskController.updateTaskStatus);

// 自定义任务类型管理
router.get('/task-types', taskTypeController.getTaskTypes);
router.get('/task-types/:id', taskTypeController.getTaskTypeById);
router.post('/task-types', taskTypeController.createTaskType);
router.put('/task-types/:id', taskTypeController.updateTaskType);
router.delete('/task-types/:id', taskTypeController.deleteTaskType);

// 任务类型的话题管理
router.get('/task-types/:id/topics', taskTypeController.getTaskTypeTopics);
router.post('/task-types/:id/topics', taskTypeController.createTopic);
router.put('/task-types/topics/:topicId', taskTypeController.updateTopic);
router.delete('/task-types/topics/:topicId', taskTypeController.deleteTopic);

// 用户任务管理
router.get('/user-tasks', adminController.getUserTasks);
router.put('/user-tasks/:id/status', adminController.updateUserTaskStatus);
router.delete('/user-tasks/:id', adminController.deleteUserTask);

// 任务提议管理
router.get('/task-proposals', taskController.getTaskProposals);
router.get('/task-proposals/stats', taskController.getTaskProposalStats);
router.put('/task-proposals/:id/approve', taskController.approveTaskProposal);
router.put('/task-proposals/:id/reject', taskController.rejectTaskProposal);
router.put('/task-proposals/:id', taskController.updateTaskProposal);

module.exports = router;
