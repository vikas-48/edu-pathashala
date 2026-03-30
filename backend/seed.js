const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Content = require('./models/Content');
const Progress = require('./models/Progress');
const Doubt = require('./models/Doubt');
const Session = require('./models/Session');
const Match = require('./models/Match');
const { getTopMatchesForStudent } = require('./services/engines');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupatashala';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for seeding...');

    await User.deleteMany({});
    await Content.deleteMany({});
    await Progress.deleteMany({});
    await Doubt.deleteMany({});
    await Session.deleteMany({});
    await Match.deleteMany({});

    // 1. Create Admins
    await User.create({
      name: 'NGO Coordinator',
      role: 'Admin',
      email: 'admin@edu.org',
      password: 'password123'
    });

    // 2. Create Mentors (M1 - M4)
    const m1 = await User.create({
      name: 'Anil',
      role: 'Mentor',
      email: 'anil@mentor.org',
      password: 'password123',
      subjects: ['Math'],
      languages: ['Telugu'],
      timeSlotMentor: '5-6 PM',
      teachingStyle: 'Interactive',
      effectiveness: 0.8
    });

    const m2 = await User.create({
      name: 'Sneha',
      role: 'Mentor',
      email: 'sneha@mentor.org',
      password: 'password123',
      subjects: ['English'],
      languages: ['English'],
      timeSlotMentor: '6-7 PM',
      teachingStyle: 'Theory',
      effectiveness: 0.7
    });

    const m3 = await User.create({
      name: 'Ramesh',
      role: 'Mentor',
      email: 'ramesh@mentor.org',
      password: 'password123',
      subjects: ['Math'],
      languages: ['Telugu'],
      timeSlotMentor: '5-6 PM',
      teachingStyle: 'Visual',
      effectiveness: 0.6
    });

    const m4 = await User.create({
      name: 'Priya',
      role: 'Mentor',
      email: 'priya@mentor.org',
      password: 'password123',
      subjects: ['Math'],
      languages: ['Hindi'],
      timeSlotMentor: '5-6 PM',
      teachingStyle: 'Interactive',
      effectiveness: 0.75
    });

    // 3. Create Students (S1 - S3)
    const s1 = await User.create({
      name: 'Ravi',
      role: 'Student',
      email: 'ravi@student.org',
      password: 'password123',
      subject: 'Math',
      language: 'Telugu',
      timeSlot: '5-6 PM',
      preferredStyle: 'Interactive',
      learningLevel: 'Beginner'
    });

    const s2 = await User.create({
      name: 'Asha',
      role: 'Student',
      email: 'asha@student.org',
      password: 'password123',
      subject: 'English',
      language: 'English',
      timeSlot: '6-7 PM',
      preferredStyle: 'Theory',
      learningLevel: 'Intermediate'
    });

    const s3 = await User.create({
      name: 'Kiran',
      role: 'Student',
      email: 'kiran@student.org',
      password: 'password123',
      subject: 'Math',
      language: 'Telugu',
      timeSlot: '5-6 PM',
      preferredStyle: 'Interactive',
      learningLevel: 'Intermediate'
    });

    // 4. Trigger Matching for unassigned students
    const mentors = [m1, m2, m3, m4];
    const students = [s1, s2, s3];

    for (const student of students) {
      const topMatches = getTopMatchesForStudent(student, mentors);
      for (const matchInfo of topMatches) {
          await Match.create({
              studentId: student._id,
              mentorId: matchInfo.mentorId,
              score: matchInfo.score / 100,
              status: 'pending'
          });
      }
    }

    console.log('Database seeded with synthetic data and matches generated!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
