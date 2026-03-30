const express = require('express');

const User = require('../models/User');
const Content = require('../models/Content');
const Progress = require('../models/Progress');
const Doubt = require('../models/Doubt');
const Session = require('../models/Session');
const Match = require('../models/Match');
const { 
  generateMentorSuggestion, 
  generateLearningPlan, 
  calculateCompatibilityScore, 
  getTopMatchesForStudent 
} = require('../services/engines');

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'EDU Patashala API running' });
});

// Real Auth Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        res.json({ token: `mock-token-${user._id}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Dashboard Stats
router.get('/admin/stats', async (req, res) => {
    try {
        const studentsCount = await User.countDocuments({ role: 'Student' });
        const mentorsCount = await User.countDocuments({ role: 'Mentor' });
        const allProgress = await Progress.find({});
        
        const avgScore = allProgress.reduce((acc, p) => acc + (p.quizScore || 0), 0) / (allProgress.length || 1);
        
        res.json({ studentsCount, mentorsCount, avgScore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mentor Dashboard: Get assigned students and suggestions
router.get('/mentor/students/:id', async (req, res) => {
    try {
        const mentor = await User.findById(req.params.id).populate('studentsAssigned');
        const studentsWithInsights = await Promise.all(mentor.studentsAssigned.map(async (student) => {
            // Get latest progress
            const latestProgress = await Progress.findOne({ studentId: student._id }).sort({ date: -1 });
            const suggestions = latestProgress ? generateMentorSuggestion(latestProgress) : [];
            
            return {
                student,
                latestProgress,
                suggestions
            };
        }));
        res.json(studentsWithInsights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Dashboard: Get learning plan and progress
router.get('/student/dashboard/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        const progressList = await Progress.find({ studentId: student._id }).populate('topicId').sort({ date: -1 });
        const latestProgress = progressList[0];
        
        // Topic info
        let topic;
        if (latestProgress && latestProgress.topicId) {
             topic = latestProgress.topicId;
        } else {
             topic = await Content.findOne({ level: student.learningLevel });
        }

        const doubts = await Doubt.find({ studentId: student._id }).sort({ createdAt: -1 });
        const plan = generateLearningPlan(topic || { topic: 'General Studies' }, latestProgress ? latestProgress.quizScore : null);

        res.json({
            student,
            progress: progressList,
            currentTopic: topic,
            plan,
            doubts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mentor: Post student progress
router.post('/progress', async (req, res) => {
    try {
        const newProgress = await Progress.create(req.body);
        res.status(201).json(newProgress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NEW FEATURES ---

// Student: Post a Doubt
router.post('/doubts', async (req, res) => {
    try {
        const doubt = await Doubt.create(req.body);
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mentor: Get Doubts
router.get('/doubts/mentor/:mentorId', async (req, res) => {
    try {
        const doubts = await Doubt.find({ mentorId: req.params.mentorId, status: 'Pending' }).populate('studentId', 'name');
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mentor: Answer Doubt
router.post('/doubts/answer', async (req, res) => {
    try {
        const { doubtId, answer } = req.body;
        const doubt = await Doubt.findByIdAndUpdate(doubtId, { answer, status: 'Answered' }, { new: true });
        res.json(doubt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Run matching for all unassigned students (Manual Trigger)
router.post('/admin/run-matching', async (req, res) => {
    try {
        const students = await User.find({ role: 'Student', mentorId: null });
        const mentors = await User.find({ role: 'Mentor' });
        
        const createdMatches = [];
        for (const student of students) {
            const topMentors = getTopMatchesForStudent(student, mentors);
            for (const suggestion of topMentors) {
                // Upsert match so we don't duplicate
                const match = await Match.findOneAndUpdate(
                    { studentId: student._id, mentorId: suggestion.mentorId },
                    { score: suggestion.score / 100, status: 'pending' },
                    { upsert: true, new: true }
                );
                createdMatches.push(match);
            }
        }
        res.json({ message: 'Matching process completed', count: createdMatches.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Analytics Stats
router.get('/admin/stats', async (req, res) => {
    try {
        const studentsCount = await User.countDocuments({ role: 'Student' });
        const mentorsCount = await User.countDocuments({ role: 'Mentor' });
        
        const approvedMatches = await Match.find({ status: 'approved' });
        const avgScore = approvedMatches.length > 0
            ? (approvedMatches.reduce((acc, match) => acc + match.score, 0) / approvedMatches.length) * 100
            : 85; // Default mock score if no matches approved yet

        res.json({
            studentsCount,
            mentorsCount,
            avgScore
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all pending matches with details
router.get('/admin/pending-matches', async (req, res) => {
    try {
        const matches = await Match.find({ status: 'pending' })
            .populate('studentId', 'name subject language timeSlot preferredStyle')
            .populate('mentorId', 'name subjects languages timeSlotMentor teachingStyle effectiveness');
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Approve a match
router.post('/admin/approve-match', async (req, res) => {
    try {
        const { matchId } = req.body;
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ error: 'Match not found' });

        // Update student
        await User.findByIdAndUpdate(match.studentId, { mentorId: match.mentorId });
        
        // Update mentor
        await User.findByIdAndUpdate(match.mentorId, { 
            $addToSet: { studentsAssigned: match.studentId } 
        });

        // Set status
        match.status = 'approved';
        await match.save();

        // Reject other matches for this student
        await Match.updateMany(
            { studentId: match.studentId, _id: { $ne: matchId }, status: 'pending' },
            { status: 'rejected' }
        );

        res.json({ message: 'Match approved successfully', match });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Reject a match
router.post('/admin/reject-match', async (req, res) => {
    try {
        const { matchId } = req.body;
        await Match.findByIdAndUpdate(matchId, { status: 'rejected' });
        res.json({ message: 'Match rejected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student: Create (triggers auto-matching)
router.post('/students', async (req, res) => {
    try {
        const student = await User.create({ ...req.body, role: 'Student' });
        
        // Auto-trigger matching
        const mentors = await User.find({ role: 'Mentor' });
        const topMentors = getTopMatchesForStudent(student, mentors);
        
        for (const suggestion of topMentors) {
            await Match.create({
                studentId: student._id,
                mentorId: suggestion.mentorId,
                score: suggestion.score / 100,
                status: 'pending'
            });
        }

        res.status(201).json({ student, matchCount: topMentors.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Onboard Mentor
router.post('/mentors', async (req, res) => {
    try {
        const mentor = await User.create({ ...req.body, role: 'Mentor' });
        res.status(201).json(mentor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Assign Mentor explicitly
router.post('/admin/assign', async (req, res) => {
    try {
        const { studentId, mentorId } = req.body;
        const student = await User.findByIdAndUpdate(studentId, { mentorId }, { new: true });
        
        const mentor = await User.findById(mentorId);
        if (mentor && !mentor.studentsAssigned.includes(studentId)) {
            mentor.studentsAssigned.push(studentId);
            await mentor.save();
        }
        res.json({ message: 'Assigned successfully', student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mentor: Get upcoming Sessions
router.get('/sessions/mentor/:mentorId', async (req, res) => {
    try {
        const sessions = await Session.find({ mentorId: req.params.mentorId }).populate('studentId', 'name learningLevel');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Export Report (Simulated CSV payload)
router.get('/admin/reports', async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).populate('mentorId');
        const csvRows = ['Name,Role,Level,AssignedMentor,Email'];
        
        students.forEach(s => {
            csvRows.push(`${s.name},${s.role},${s.learningLevel},${s.mentorId ? s.mentorId.name : 'None'},${s.email}`);
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
        res.send(csvRows.join('\n'));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
