const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find admin1
        const admin = await User.findOne({ email: 'admin1@gmail.com' });
        if (!admin) {
            console.error('Could not find admin1@gmail.com');
            process.exit(1);
        }
        
        console.log(`Found admin1: ${admin.name} (ID: ${admin._id})`);
        
        // Update all teachers with null createdBy
        const result = await User.updateMany(
            { role: 'teacher', createdBy: null },
            { $set: { createdBy: admin._id } }
        );
        
        console.log(`Successfully updated ${result.modifiedCount} teachers.`);
        await mongoose.connection.close();
    } catch (e) {
        console.error('MIGRATION ERROR:', e.message);
        process.exit(1);
    }
};

fixTeachers();
