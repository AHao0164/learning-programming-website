const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/user.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-coding-platform')
  .then(() => console.log('✅ Đã kết nối MongoDB để cấy dữ liệu User Test...'))
  .catch(err => {
      console.error('❌ Lỗi kết nối DB:', err);
      process.exit(1);
  });

const seedUsers = async () => {
  try {
    const users = [
      {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        xp: 9999,
        streak: 30,
        status: 'active'
      },
      {
        name: 'Học sinh',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        xp: 150,
        streak: 2,
        status: 'active'
      }
    ];

    for (let u of users) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
            await User.create(u);
            console.log(`➕ Đã tạo: ${u.email}`);
        } else {
            // Cập nhật lại mật khẩu thành password123 nếu account đã tồn tại
            exists.password = u.password;
            exists.name = u.name;
            await exists.save();
            console.log(`🔄 Đã làm mới pass cho: ${u.email}`);
        }
    }

    console.log('\n🎉 Quá trình tạo dữ liệu Test thành công!');
    console.log('------------------------------------------------');
    console.log('Tài khoản Admin   : admin@test.com    | pass: password123');
    console.log('Tài khoản Student : student@test.com  | pass: password123');
    console.log('------------------------------------------------\n');
    
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi tạo Users:', err);
    process.exit(1);
  }
};

seedUsers();
