const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  
  date: { type: Date, default: Date.now },
  attended: { type: Boolean, default: true },
  
  quizScore: { type: Number, min: 0, max: 100 },
  
  // Feedback from mentor
  understanding: { type: Number, min: 1, max: 5 }, // 1-poor, 5-excellent
  engagement: { type: Number, min: 1, max: 5 },
  confidence: { type: Number, min: 1, max: 5 },
  
  mentorNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
