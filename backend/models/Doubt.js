const mongoose = require('mongoose');

const DoubtSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true }, // The text of the question (typed or transcribed)
  inputType: { type: String, enum: ['text', 'voice'], default: 'text' }, // How the student inputted it
  status: { type: String, enum: ['Pending', 'Answered'], default: 'Pending' },
  answer: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doubt', DoubtSchema);
