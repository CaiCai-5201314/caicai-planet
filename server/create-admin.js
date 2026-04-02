const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [user, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@caicai.com',
        password: hashedPassword,
        nickname: 'Administrator',
        role: 'admin',
        status: 'active',
        level: 1,
        avatar: '/uploads/avatars/default.png'
      }
    });

    if (created) {
      console.log('管理员账号创建成功！');
    } else {
      await user.update({ role: 'admin' });
      console.log('管理员权限已更新！');
    }

    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('角色:', user.role);
    
    process.exit(0);
  } catch (error) {
    console.error('创建管理员失败:', error);
    process.exit(1);
  }
}

createAdmin();
