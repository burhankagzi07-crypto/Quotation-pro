require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});

    const password = await bcrypt.hash('123456', 10);

    await User.create([
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password,
        role: 'admin'
      },
      {
        name: 'User',
        email: 'user@gmail.com',
        password,
        role: 'user'
      }
    ]);

    console.log('Default users created successfully');
    console.log('Admin: admin@gmail.com / 123456');
    console.log('User : user@gmail.com / 123456');
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

seedUsers();
