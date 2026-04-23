const { hashPassword } = require('./utils/password');
const { User } = require('./models');

async function resetAdminPassword() {
  try {
    // 生成密码哈希
    const hashedPassword = await hashPassword('admin123');
    
    // 更新管理员账号的密码
    const result = await User.update(
      { password: hashedPassword },
      { where: { username: 'admin' } }
    );
    
    console.log('密码重置成功:', result);
  } catch (error) {
    console.error('密码重置失败:', error);
  }
}

resetAdminPassword();