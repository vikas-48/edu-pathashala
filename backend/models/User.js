const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Mentor', 'Admin'], required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  
  // Student Specific
  age: { type: Number },
  classGrade: { type: Number, min: 1, max: 12 },
  learningLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String }, 
  language: { type: String },
  timeSlot: { type: String },
  preferredStyle: { type: String },

  // Mentor Specific
  studentsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  capacity: { type: Number, default: 3 },
  subjects: [{ type: String }],
  languages: [{ type: String }],
  timeSlotMentor: { type: String },
  teachingStyle: { type: String },
  effectiveness: { type: Number, default: 0.7 },
  classRangeMin: { type: Number, min: 1, max: 12, default: 1 },
  classRangeMax: { type: Number, min: 1, max: 12, default: 12 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
