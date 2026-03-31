const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true }, // Compatibility score (0.0 to 1.0)
  factors: [{ type: String }], // Reasons for the match (Subject, Language, etc.)
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
