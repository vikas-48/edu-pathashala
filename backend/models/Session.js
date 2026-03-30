const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  topic: { type: String },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  attendance: { type: Boolean, default: false }, // marked true if completed and student attended
  feedbackNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
