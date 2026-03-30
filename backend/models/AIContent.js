const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],       // 3 or 4 options
  correctIndex: { type: Number, required: true }  // 0-based index
}, { _id: false });

const AIContentSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:        { type: String, required: true },
  classGrade:   { type: Number },
  level:        { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },

  lessonContent: { type: String },   // AI-generated explanation
  quiz:          [QuizQuestionSchema],

  // After student takes quiz
  studentAnswers: [{ type: Number }],
  quizScore:     { type: Number },   // 0–100
  completed:     { type: Boolean, default: false },
  completedAt:   { type: Date },

  assignedAt:    { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AIContent', AIContentSchema);
