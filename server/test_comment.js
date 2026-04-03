const { Comment, Task, User } = require('./models');

async function testComment() {
  try {
    console.log('测试评论创建...');
    
    // 检查 task_id 字段是否存在
    const comment = await Comment.findOne();
    console.log('Comment 模型字段:', Object.keys(Comment.rawAttributes));
    
    // 尝试创建一个测试评论
    const testComment = await Comment.create({
      content: '测试评论',
      task_id: 1,
      user_id: 1,
      status: 'active'
    });
    
    console.log('评论创建成功:', testComment.id);
    
    // 删除测试评论
    await testComment.destroy();
    console.log('测试评论已删除');
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testComment();
