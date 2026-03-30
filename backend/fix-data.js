require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const res = await User.updateMany({ role: 'Student' }, { $set: { classGrade: 5, subject: 'Math' } });
  console.log(`Updated ${res.modifiedCount} students!`);
  await mongoose.disconnect();
}
fix();
