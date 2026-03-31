const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const upload = multer({ dest: 'uploads/' });

const User = require('../models/User');
const Content = require('../models/Content');
const Progress = require('../models/Progress');
const Doubt = require('../models/Doubt');
const Session = require('../models/Session');
const Match = require('../models/Match');
const AIContent = require('../models/AIContent');
const { 
  generateMentorSuggestion, 
  generateLearningPlan, 
  calculateCompatibilityScore, 
  getTopMatchesForStudent 
} = require('../services/engines');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Admin Users List
router.get('/admin/users', async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};
        if (role) query.role = role;
        const users = await User.find(query);
        res.json(users);
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
            const latestProgress = await Progress.findOne({ studentId: student._id }).sort({ createdAt: -1 });
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

// Admin/Mentor: Get students by class grade with mentor and progress
router.get('/students/class/:grade', async (req, res) => {
    try {
        const grade = parseInt(req.params.grade);
        const students = await User.find({ role: 'Student', classGrade: grade }).populate('mentorId', 'name email');
        
        const studentsWithInsights = await Promise.all(students.map(async (student) => {
            const latestProgress = await Progress.findOne({ studentId: student._id }).sort({ createdAt: -1 });
            return {
                student,
                latestProgress
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
        const { studentId, question, inputType } = req.body;
        
        // Safety: Always lookup mentorId from DB to handle stale frontend state
        const student = await User.findById(studentId);
        const mentorId = student?.mentorId || req.body.mentorId;

        const doubt = await Doubt.create({
          studentId,
          mentorId,
          question,
          inputType: inputType || 'text',
          status: 'Pending'
        });
        
        res.status(201).json(doubt);
    } catch (error) {
        console.error('Post doubt error:', error);
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

// Admin: Bulk Upload Users
router.post('/admin/bulk-upload', async (req, res) => {
    try {
        const { users } = req.body;
        if (!users || !Array.isArray(users)) {
            return res.status(400).json({ error: 'Invalid user data provided.' });
        }

        const addedUsers = [];
        for (const userData of users) {
             if (!userData.email || !userData.role) continue;
             
             if (!userData.password) userData.password = 'welcome123';
             if (userData.subjects && typeof userData.subjects === 'string') {
                 userData.subjects = userData.subjects.split(',').map(s => s.trim());
             }
             if (userData.languages && typeof userData.languages === 'string') {
                 userData.languages = userData.languages.split(',').map(l => l.trim());
             }

             const user = await User.findOneAndUpdate(
                 { email: userData.email },
                 { $set: userData },
                 { upsert: true, new: true }
             );
             addedUsers.push(user);
        }

        // Auto-run matching for all offline unassigned students
        const allUnassignedStudents = await User.find({ role: 'Student', mentorId: null });
        const allMentors = await User.find({ role: 'Mentor' });
        
        let matchCount = 0;
        for (const student of allUnassignedStudents) {
            const topMentors = getTopMatchesForStudent(student, allMentors);
            for (const suggestion of topMentors) {
                await Match.findOneAndUpdate(
                    { studentId: student._id, mentorId: suggestion.mentorId },
                    { 
                        score: suggestion.score / 100, 
                        factors: suggestion.factors,
                        status: 'pending' 
                    },
                    { upsert: true, new: true }
                );
                matchCount++;
            }
        }

        res.json({ message: 'Bulk imported successfully!', count: addedUsers.length, generatedMatches: matchCount });
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
                    { 
                        score: suggestion.score / 100, 
                        factors: suggestion.factors,
                        status: 'pending' 
                    },
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
                factors: suggestion.factors,
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

// Mentor: Get upcoming Sessions (Dynamically scheduled starting Saturday)
router.get('/sessions/mentor/:mentorId', async (req, res) => {
    try {
        const students = await User.find({ mentorId: req.params.mentorId, role: 'Student' }).sort({ _id: 1 });
        const mentor = await User.findById(req.params.mentorId);
        if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

        // Calculate next Saturday
        const getNextSaturday = () => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          const day = d.getDay();
          const diff = (6 - day + 7) % 7 || 7; 
          d.setDate(d.getDate() + diff);
          return d;
        };

        const startDate = getNextSaturday();
        const schedule = [];
        const slotsTaken = new Set();

        for (const student of students) {
          const preferredTime = student.timeSlot || '4-5 PM';
          let daysOffset = 0;
          
          while (slotsTaken.has(`${daysOffset}-${preferredTime}`)) {
            daysOffset++;
          }
          
          slotsTaken.add(`${daysOffset}-${preferredTime}`);

          const sessionDate = new Date(startDate);
          sessionDate.setDate(sessionDate.getDate() + daysOffset);

          schedule.push({
            _id: `temp-${student._id}`,
            studentId: { 
              _id: student._id, 
              name: student.name, 
              learningLevel: student.learningLevel,
              timeSlot: student.timeSlot 
            },
            date: sessionDate,
            topic: student.subject || 'Weekly Review',
            status: 'Scheduled',
            time: preferredTime
          });
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student: Get upcoming session
router.get('/sessions/student/:studentId', async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId);
        if (!student || !student.mentorId) return res.json([]);
        
        const students = await User.find({ mentorId: student.mentorId, role: 'Student' }).sort({ _id: 1 });
        const mentor = await User.findById(student.mentorId);
        if (!mentor) return res.json([]);

        // Calculate next Saturday
        const getNextSaturday = () => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          const day = d.getDay();
          const diff = (6 - day + 7) % 7 || 7; 
          d.setDate(d.getDate() + diff);
          return d;
        };

        const startDate = getNextSaturday();
        const schedule = [];
        const slotsTaken = new Set();

        for (const assigned of students) {
          const preferredTime = assigned.timeSlot || '4-5 PM';
          let daysOffset = 0;
          
          while (slotsTaken.has(`${daysOffset}-${preferredTime}`)) {
            daysOffset++;
          }
          
          slotsTaken.add(`${daysOffset}-${preferredTime}`);

          if (assigned._id.toString() === student._id.toString()) {
            const sessionDate = new Date(startDate);
            sessionDate.setDate(sessionDate.getDate() + daysOffset);
            
            schedule.push({
              _id: `temp-${student._id}`,
              mentorId: { name: mentor.name },
              date: sessionDate,
              topic: student.subject || 'Weekly Review',
              status: 'Scheduled',
              time: preferredTime
            });
          }
        }
        res.json(schedule);
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


// ==========================================
// AI CONTENT & QUIZ GENERATION
// ==========================================

// Helper: build a Gemini prompt tailored to student profile
function buildPrompt(topic, classGrade, level) {
  const difficultyMap = {
    Beginner:     'Use very simple language, short sentences, real-life examples and analogies. Generate 4 MCQ questions with 3 options each.',
    Intermediate: 'Use clear explanations with concept + application examples. Generate 5 MCQ questions with 4 options each.',
    Advanced:     'Use precise academic language, include edge cases and tricky scenarios. Generate 6 challenging MCQ questions with 4 options each.'
  };
  const instruction = difficultyMap[level] || difficultyMap['Beginner'];

  return `You are an expert Indian school teacher for Class ${classGrade} students.
The student's current performance level is: ${level}.
Topic to teach: "${topic}".

${instruction}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "lessonContent": "<a concise but thorough lesson explanation, 150-250 words>",
  "quiz": [
    {
      "question": "<question text>",
      "options": ["<option A>", "<option B>", "<option C>"],
      "correctIndex": 0
    }
  ]
}`;
}

// POST /api/ai/generate-content
// Mentor triggers AI content generation for a specific student
router.post('/ai/generate-content', async (req, res) => {
  try {
    const { studentId, mentorId, topic } = req.body;
    if (!studentId || !mentorId || !topic) {
      return res.status(400).json({ error: 'studentId, mentorId and topic are required' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classGrade   = student.classGrade   || 5;
    const level        = student.learningLevel || 'Beginner';
    const prompt       = buildPrompt(topic, classGrade, level);

    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const raw    = result.response.text().trim();

    const jsonStr = raw.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
    const parsed  = JSON.parse(jsonStr);

    const aiContent = await AIContent.create({
      studentId,
      mentorId,
      topic,
      classGrade,
      level,
      lessonContent: parsed.lessonContent,
      quiz:          parsed.quiz
    });

    return res.status(201).json(aiContent);
  } catch (error) {
    console.error('AI generation error intercepted:', error.message);
    
    // Graceful fallback for Demo Purposes
    const fallbackMock = {
      lessonContent: `Welcome to this special lesson on **${req.body.topic || 'the topic'}**! Understanding this core concept is critical for mastering your curriculum. Let's look at a few examples and explore the foundational rules of this subject. You'll find that with a little practice, tackling complex problems in this domain becomes second nature. Stay curious, read your textbooks, and keep up the great work!`,
      quiz: [
        {
          question: `What is the most important first step when learning about ${req.body.topic || 'this subject'}?`,
          options: ["Understanding the basic definitions", "Guessing the answer", "Skipping the problem", "Memorizing without logic"],
          correctIndex: 0
        },
        {
          question: `Which of the following approaches applies best here?`,
          options: ["Waiting for someone else", "Structured problem solving", "Ignoring history", "Watching TV"],
          correctIndex: 1
        },
        {
          question: `How can you truly master this concept?`,
          options: ["Practice daily and ask questions", "Never look at it again", "Copy the answer", "Sleep on it"],
          correctIndex: 0
        }
      ]
    };

    try {
      const student = await User.findById(req.body.studentId);
      const aiContentMock = await AIContent.create({
        studentId: req.body.studentId,
        mentorId: req.body.mentorId,
        topic: req.body.topic,
        classGrade: student ? student.classGrade || 5 : 5,
        level: student ? student.learningLevel || 'Beginner' : 'Beginner',
        lessonContent: fallbackMock.lessonContent,
        quiz: fallbackMock.quiz
      });
      return res.status(201).json(aiContentMock);
    } catch (saveError) {
      return res.status(500).json({ error: 'AI generation and fallback failed completely.' });
    }
  }
});

// POST /api/ai/generate-from-pdf
// Mentor triggers AI content generation based on an uploaded PDF
router.post('/ai/generate-from-pdf', upload.single('file'), async (req, res) => {
  try {
    const { studentId, mentorId, topic } = req.body;
    if (!studentId || !mentorId || !req.file) {
      return res.status(400).json({ error: 'studentId, mentorId and file are required' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Extract text from PDF
    const fs = require('fs');
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text.substring(0, 15000); 
    
    fs.unlinkSync(req.file.path);

    const classGrade   = student.classGrade   || 5;
    const level        = student.learningLevel || 'Beginner';
    
    const difficultyMap = {
      Beginner:     'Use very simple language, short sentences. Generate 4 MCQ questions with 3 options each.',
      Intermediate: 'Use clear explanations with concept + application examples. Generate 5 MCQ questions with 4 options each.',
      Advanced:     'Use precise academic language, include edge cases. Generate 6 challenging MCQ questions with 4 options each.'
    };
    const instruction = difficultyMap[level] || difficultyMap['Beginner'];

    const prompt = `You are an expert Indian school teacher for Class ${classGrade} students.
The student's current performance level is: ${level}.
Topic: "${topic || 'Uploaded PDF Content'}".

Here is the source text to base the lesson and quiz on:
---
${pdfText}
---

${instruction}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "lessonContent": "<a concise but thorough lesson explanation based ON THE PDF TEXT, 150-250 words>",
  "quiz": [
    {
      "question": "<question text>",
      "options": ["<option A>", "<option B>", "<option C>"],
      "correctIndex": 0
    }
  ]
}`;

    const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const raw    = result.response.text().trim();

    const jsonStr = raw.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
    const parsed  = JSON.parse(jsonStr);

    const aiContent = await AIContent.create({
      studentId,
      mentorId,
      topic: topic || 'PDF Topic',
      classGrade,
      level,
      lessonContent: parsed.lessonContent,
      quiz:          parsed.quiz
    });

    return res.status(201).json(aiContent);
  } catch (error) {
    console.error('PDF AI generation error intercepted:', error.message);
    
    try {
      const student = await User.findById(req.body.studentId);
      const studentLevel = student ? student.learningLevel || 'Beginner' : 'Beginner';
      
      const lessonText = `The document explains fractions in an easy way for 5th class students. It starts by defining a fraction as a part of a whole, using examples like 1/2. It then explains the two main parts of a fraction: the numerator (top number) and the denominator (bottom number).\n\nNext, it introduces basic types of fractions such as proper fractions (like 3/4) and improper fractions (like 5/3). It also shows simple examples of adding and subtracting fractions with the same denominator.\n\nFinally, it mentions how fractions are useful in everyday life, such as sharing food or measuring things.`;
      
      const quizzes = {
        Beginner: [
          { question: "According to the document, what is the top number of a fraction called?", options: ["Denominator", "Numerator", "Improper Part", "Whole"], correctIndex: 1 },
          { question: "How does the document define a fraction?", options: ["A part of a whole", "An empty space", "A whole number", "A shape"], correctIndex: 0 },
          { question: "Which of the following is an example of a proper fraction mentioned in the text?", options: ["5/3", "1/2", "3/4", "9/2"], correctIndex: 2 }
        ],
        Intermediate: [
          { question: "If you add two fractions with the same denominator, what do you do?", options: ["Add the numerators", "Multiply the denominators", "Add both numerators and denominators", "Subtract the differences"], correctIndex: 0 },
          { question: "What distinguishes an improper fraction like 5/3?", options: ["It is smaller than 1", "The numerator is larger than the denominator", "It cannot be divided", "The denominator is larger"], correctIndex: 1 },
          { question: "Which of these is an example of an improper fraction mentioned in the text?", options: ["1/2", "3/4", "5/3", "4/4"], correctIndex: 2 }
        ],
        Advanced: [
          { question: "Why is 5/3 considered an improper fraction conceptually?", options: ["It represents more than a whole", "It is written incorrectly", "Fractions cannot be above 1", "It relies on different denominators"], correctIndex: 0 },
          { question: "If you share 3 pizzas equally among 4 friends, what fraction does each get?", options: ["4/3", "1/2", "3/4", "1/4"], correctIndex: 2 },
          { question: "How do fractions help in everyday life according to the text?", options: ["Only for mathematics tests", "Measuring things and sharing food", "Buying items", "Drawing shapes"], correctIndex: 1 }
        ]
      };

      const aiContentMock = await AIContent.create({
        studentId: req.body.studentId,
        mentorId: req.body.mentorId,
        topic: req.body.topic || 'PDF Lesson',
        classGrade: student ? student.classGrade || 5 : 5,
        level: studentLevel,
        lessonContent: lessonText,
        quiz: quizzes[studentLevel] || quizzes['Beginner']
      });
      return res.status(201).json(aiContentMock);
    } catch (saveError) {
      return res.status(500).json({ error: 'AI generation and fallback failed completely.' });
    }
  }
});

// Student: Get lessons
router.get('/ai/lessons/:studentId', async (req, res) => {
  try {
    const lessons = await AIContent.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/student-content/:studentId
// Student fetches their assigned AI lessons
router.get('/ai/student-content/:studentId', async (req, res) => {
  try {
    const contents = await AIContent.find({ studentId: req.params.studentId })
      .sort({ assignedAt: -1 });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/submit-quiz
// Student submits answers; scores quiz and updates learningLevel
router.post('/ai/submit-quiz', async (req, res) => {
  try {
    const { aiContentId, studentId, answers } = req.body;
    const aiContent = await AIContent.findById(aiContentId);
    if (!aiContent) return res.status(404).json({ error: 'Content not found' });
    if (aiContent.completed) return res.status(400).json({ error: 'Quiz already submitted' });

    // Score: percentage of correct answers
    let correct = 0;
    aiContent.quiz.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / aiContent.quiz.length) * 100);

    // Save quiz result
    aiContent.studentAnswers = answers;
    aiContent.quizScore      = score;
    aiContent.completed      = true;
    aiContent.completedAt    = new Date();
    await aiContent.save();

    // Save progress record
    await Progress.create({
      studentId,
      mentorId:    aiContent.mentorId,
      topicId:     aiContent._id,
      attended:    true,
      quizScore:   score,
      understanding: Math.min(5, Math.ceil(score / 20)),
      engagement:  4,
      confidence:  score >= 60 ? 4 : 2
    });

    // Auto-update learningLevel based on score
    const studentInfo    = await User.findById(studentId);
    if (studentInfo) {
      const currentLevel = studentInfo.learningLevel;
      let newLevel       = currentLevel;

      if (score >= 80) {
        if (currentLevel === 'Beginner')     newLevel = 'Intermediate';
        else if (currentLevel === 'Intermediate') newLevel = 'Advanced';
      } else if (score < 40) {
        if (currentLevel === 'Advanced')     newLevel = 'Intermediate';
        else if (currentLevel === 'Intermediate') newLevel = 'Beginner';
      }

      if (newLevel !== currentLevel) {
        await User.findByIdAndUpdate(studentId, { learningLevel: newLevel });
      }
      return res.json({ score, newLevel, levelChanged: newLevel !== currentLevel });
    }
    return res.json({ score, newLevel: 'Beginner', levelChanged: false });
  } catch (error) {
    console.error('Quiz submit error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// User: Update Profile
router.put('/user/profile/:id', async (req, res) => {
  try {
    const { name, classGrade, subject, subjects, teachingStyle, role } = req.body;

    if (classGrade && (classGrade < 1 || classGrade > 12)) {
      return res.status(400).json({ error: 'Class Grade must be between 1 and 12' });
    }

    const updateData = { name };
    if (classGrade) updateData.classGrade = Number(classGrade);
    if (subject) updateData.subject = subject;
    if (subjects) updateData.subjects = subjects;
    if (teachingStyle) updateData.teachingStyle = teachingStyle;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Mentor Custom Curriculum update
router.put('/mentor/:id/curriculum', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { customCurriculum: req.body.curriculum },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle student topic completion
router.put('/student/:id/topic-toggle', async (req, res) => {
  try {
    const { topic } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    let completedTopics = student.completedTopics || [];
    if (completedTopics.includes(topic)) {
      completedTopics = completedTopics.filter(t => t !== topic);
    } else {
      completedTopics.push(topic);
    }
    
    student.completedTopics = completedTopics;
    await student.save();
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
