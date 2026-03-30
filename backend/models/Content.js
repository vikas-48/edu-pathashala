const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  resources: {
    videoUrl: String,
    notesUrl: String,
    worksheetUrl: String,
    quizId: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
