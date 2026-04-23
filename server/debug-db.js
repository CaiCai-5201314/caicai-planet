
const db = require('./models');

async function queryDatabase() {
  try {
    console.log('=== 查询文章数据 ===');
    const posts = await db.Post.findAll({
      attributes: ['id', 'title', 'cover_image', 'content', 'created_at'],
      limit: 5
    });
    console.log('文章数据:', JSON.stringify(posts, null, 2));

    console.log('\n=== 查询用户数据 ===');
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'nickname', 'avatar'],
      limit: 5
    });
    console.log('用户数据:', JSON.stringify(users, null, 2));

    console.log('\n=== 查询广告数据 ===');
    const ads = await db.Advertisement.findAll({
      attributes: ['id', 'title', 'image_url', 'position', 'status'],
      limit: 5
    });
    console.log('广告数据:', JSON.stringify(ads, null, 2));

    console.log('\n=== 查询任务数据 ===');
    const tasks = await db.Task.findAll({
      attributes: ['id', 'title', 'difficulty', 'reward', 'status'],
      limit: 10
    });
    console.log('任务数据:', JSON.stringify(tasks, null, 2));

    console.log('\n=== 查询友链数据 ===');
    const friendLinks = await db.FriendLink.findAll({
      attributes: ['id', 'name', 'logo', 'url'],
      limit: 5
    });
    console.log('友链数据:', JSON.stringify(friendLinks, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

queryDatabase();
