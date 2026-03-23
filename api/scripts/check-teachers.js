const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const teachers = await User.find({ role: 'teacher' });
        console.log('--- Teachers in Database ---');
        teachers.forEach(t => {
            console.log(`Name: ${t.name}, Email: ${t.email}, CreatedBy: ${t.createdBy}, CreatedAt: ${t.createdAt}`);
        });

        const admins = await User.find({ role: 'admin' });
        console.log('\n--- Admins in Database ---');
        admins.forEach(a => {
            console.log(`Name: ${a.name}, Email: ${a.email}, ID: ${a._id}`);
        });

        await mongoose.connection.close();
    } catch (e) {
        console.error('SCRIPT ERROR:', e.message);
        process.exit(1);
    }
};

checkTeachers();
