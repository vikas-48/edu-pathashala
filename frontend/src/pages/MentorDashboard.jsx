import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCheck, AlertCircle, TrendingUp, CheckCircle, Edit3, Calendar, HelpCircle, MessageSquare, MessageCircle, Sparkles, BookOpen, Send, Loader, XCircle, User, Settings, Edit2, Award } from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [user, setUser] = useState(null);

  const [answeringDoubtId, setAnsweringDoubtId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [showInboxPanel, setShowInboxPanel] = useState(false);

  // AI Content State
  const [activeGenStudent, setActiveGenStudent] = useState(null); // student object
  const [genTopic, setGenTopic] = useState('');
  const [genFile, setGenFile] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(null); // { lessonContent, quiz[], _id }
  const [genError, setGenError] = useState('');
  
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', subjects: [], teachingStyle: '' });

  // Curriculum State
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isEditingCurriculum, setIsEditingCurriculum] = useState(false);
  const [curriculumText, setCurriculumText] = useState('');
  const [curriculumData, setCurriculumData] = useState({
    'Class 1-5 (Primary)': {
      Math: [
        'Number Sense & Place Value (up to 1000)', 
        'Addition & Subtraction (Strategies & Word Problems)', 
        'Multiplication & Division Intro (Times Tables 1-10)', 
        'Fractions (Halves, Thirds, Fourths)', 
        'Basic Geometry (2D & 3D Shapes, Symmetry)', 
        'Measurements (Length, Weight, Capacity, Time)', 
        'Data Handling (Pictographs, Bar Graphs)'
      ],
      Science: [
        'Living vs. Non-Living Things', 
        'Human Body: Organs & Senses', 
        'Plant Life Cycle & Photosynthesis Basics', 
        'Animals: Habitats & Food Chains', 
        'Earth & Universe (Sun, Moon, Stars, Planets)', 
        'Water Cycle & Weather Variations', 
        'Basic Forces (Push & Pull, Friction Intro)'
      ],
      English: [
        'Phonics & Word Reading Fluency', 
        'Vocabulary Building (Synonyms, Antonyms, Homophones)', 
        'Basic Grammar (Nouns, Verbs, Adjectives, Pronouns)', 
        'Sentence Structure & Punctuation Marks', 
        'Reading Comprehension (Short Stories, Folktales)', 
        'Creative Writing (Short Paragraphs, Story Sequencing)', 
        'Listening & Speaking (Roleplays, Recitation)'
      ]
    },
    'Class 6-8 (Middle)': {
      Math: [
        'Fractions, Decimals, & Percentages (Operations & Equivalency)', 
        'Integers & Rational Numbers', 
        'Linear Equations & Introduction to Algebra', 
        'Ratio, Proportion, & Unitary Method', 
        'Geometry (Lines, Angles, Triangles, Quadrilaterals)', 
        'Mensuration (Area & Perimeter of 2D shapes, Volume Intro)', 
        'Statistics (Mean, Median, Mode)'
      ],
      Science: [
        'Components of Food & Human Digestion', 
        'Structure of Matter (Atoms, Molecules, Elements)', 
        'Force, Work, Energy, & Pressure', 
        'Light (Reflection, Refraction) & Sound', 
        'Microorganisms: Friend & Foe', 
        'Electricity (Circuits, Conductors, Insulators)', 
        'Environmental Science (Pollution, Conservation, Magnetism)'
      ],
      English: [
        'Advanced Grammar (Tenses, Active/Passive Voice, Direct/Indirect Speech)', 
        'Vocabulary Expansion (Idioms, Phrases, Root Words)', 
        'Reading Comprehension (Poetry, Expository Texts)', 
        'Formal & Informal Letter Writing', 
        'Essay Writing & Paragraph Expansion', 
        'Notice & Diary Entry Writing', 
        'Debate, Extempore, & Group Discussions'
      ]
    },
    'Class 9-10 (High)': {
      Math: [
        'Real Numbers, Polynomials, & Quadratic Equations', 
        'Trigonometry (Ratios, Identities, Heights & Distances)', 
        'Linear Equations in Two Variables', 
        'Coordinate Geometry', 
        'Circles, Tangents, & Theorems', 
        'Surface Areas & Volumes (3D Solids, Frustum)', 
        'Probability & Advanced Statistics'
      ],
      Science: [
        'Chemical Reactions & Equations', 
        'Acids, Bases, & Salts / Metals & Non-Metals', 
        'Life Processes (Respiration, Circulation, Excretion)', 
        'Control & Coordination (Nervous & Endocrine Systems)', 
        'Heredity & Evolution Intro', 
        'Electricity, Magnetism & Electromagnetism', 
        'Light (Mirrors, Lenses, Human Eye, Prism)'
      ],
      English: [
        'Complex Grammar & Editing (Clauses, Modals, Determiners)', 
        'Analyzing Literature (Themes, Character Sketches, Plot)', 
        'Reading Comprehension (Unseen Passages, Articles)', 
        'Analytical Paragraphs & Article Writing', 
        'Writing Speeches & Debates', 
        'Story Writing (Setting, Climax, Resolution)', 
        'Listening & Speaking Assessments (ASL)'
      ]
    },
    'Class 11-12 (Senior)': {
      Math: [
        'Sets, Relations, & Functions', 
        'Calculus (Limits, Continuity, Differentiation, Integration)', 
        'Algebra (Matrices, Determinants, Permutations & Combinations)', 
        'Vectors & 3D Geometry', 
        'Conic Sections (Parabola, Ellipse, Hyperbola)', 
        'Complex Numbers', 
        'Linear Programming & Advanced Probability'
      ],
      Science: [
        'Physics: Kinematics, Thermodynamics, Quantum Mechanics', 
        'Physics: Electromagnetism, Optics, Modern Physics', 
        'Chemistry: Organic (Hydrocarbons, Polymers), Inorganic (s,p,d,f blocks)', 
        'Chemistry: Physical Chemistry (Kinetics, Solutions)', 
        'Biology: Genetics, Molecular Basis of Inheritance', 
        'Biology: Human Physiology, Biotechnology, Ecology', 
        'Computer Science Intro (Algorithms, Data Structures)'
      ],
      English: [
        'In-depth Literary Critique & Central Ideologies', 
        'Note-making & Summarising', 
        'Report Writing (Newspapers, School Magazines)', 
        'Job Applications, Invitations, & Replies', 
        'Argumentative & Discursive Essays', 
        'Advanced Reading Skills (Scholarly Articles)', 
        'Extensive Speaking (Seminars, Presentations)'
      ]
    }
  });

  const toggleStudentTopic = async (studentId, topic) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/student/${studentId}/topic-toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const updatedStudent = await res.json();
        setData(prev => prev.map(item => item.student._id === studentId ? { ...item, student: updatedStudent } : item));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveCurriculum = async () => {
    try {
      const parsed = JSON.parse(curriculumText);
      const res = await fetch(`http://127.0.0.1:5000/api/mentor/${user._id}/curriculum`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculum: parsed })
      });
      if (res.ok) {
        setCurriculumData(parsed);
        setIsEditingCurriculum(false);
        const u = { ...user, customCurriculum: parsed };
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        alert('Curriculum saved successfully!');
      }
    } catch (e) {
      alert('Invalid JSON format. Please check your syntax.');
    }
  };

  const loadData = (loggedIn) => {
    fetch(`http://127.0.0.1:5000/api/mentor/students/${loggedIn._id}`)
      .then(res => res.json())
      .then(d => setData(d));

    fetch(`http://127.0.0.1:5000/api/sessions/mentor/${loggedIn._id}`)
      .then(res => res.json())
      .then(d => setSessions(d));

    fetch(`http://127.0.0.1:5000/api/doubts/mentor/${loggedIn._id}`)
      .then(res => res.json())
      .then(d => setDoubts(d));
  };

  useEffect(() => {
    const loggedIn = JSON.parse(localStorage.getItem('user'));
    if (!loggedIn || loggedIn.role !== 'Mentor') return navigate('/login');
    setUser(loggedIn);
    loadData(loggedIn);
    
    if (loggedIn.customCurriculum) {
      setCurriculumData(loggedIn.customCurriculum);
    }

    // Auto-refresh every 30 seconds to show latest student scores
    const poll = setInterval(() => loadData(loggedIn), 30000);
    return () => clearInterval(poll);
  }, [navigate]);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const toggleProfile = () => {
    if (!showProfile) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        subjects: user.subjects || [],
        teachingStyle: user.teachingStyle || ''
      });
    }
    setShowProfile(!showProfile);
    setIsEditing(false);
  };

  const updateProfile = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/profile/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(`Update failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error: Could not reach the server.');
    }
  };

  const answerDoubt = async (doubtId) => {
    if (!answerText) return;
    try {
      await fetch('http://127.0.0.1:5000/api/doubts/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubtId, answer: answerText })
      });
      setAnsweringDoubtId(null);
      setAnswerText('');
      loadData(user);
    } catch (e) {}
  };

  const openGenPanel = (student) => {
    setActiveGenStudent(student);
    setGenTopic('');
    setGenFile(null);
    setGenResult(null);
    setGenError('');
  };

  const generateContent = async () => {
    if (!genTopic.trim() && !genFile) return;
    setGenLoading(true);
    setGenError('');
    setGenResult(null);
    try {
      let res;
      if (genFile) {
        const formData = new FormData();
        formData.append('file', genFile);
        formData.append('studentId', activeGenStudent._id);
        formData.append('mentorId', user._id);
        if (genTopic) formData.append('topic', genTopic);
        
        res = await fetch('http://127.0.0.1:5000/api/ai/generate-from-pdf', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('http://127.0.0.1:5000/api/ai/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: activeGenStudent._id,
            mentorId: user._id,
            topic: genTopic
          })
        });
      }
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setGenResult(json);
    } catch (err) {
      setGenError(err.message || 'Generation failed. Try again.');
    }
    setGenLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const formattedName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Mentor';

  const levelColor = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#6366f1' };

  return (
    <div className="container animate-fade-in">
      <div 
        className="dashboard-header glass-panel" 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, hsl(240, 80%, 65%) 100%)', 
          color: 'white', 
          border: 'none', 
          borderRadius: 'var(--border-radius-lg)', 
          padding: '2.5rem 3rem', 
          marginBottom: '3rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '24px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Award size={48} color="white" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '2.8rem', margin: '0 0 8px 0', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Volunteer Mentor Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.95)', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#facc15" />
              <span>{getGreeting()}, <strong style={{color: 'white', fontWeight: 700, letterSpacing: '0.5px'}}>{formattedName}</strong>! Ready to inspire today?</span>
              {user?.subjects && user.subjects.length > 0 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', marginLeft: '8px' }}>{user.subjects[0]} Guide</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-end', maxWidth: '400px' }}>
          <button className="btn" onClick={() => setShowCurriculum(true)} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
            <BookOpen size={18} /> Curriculum
          </button>
          <button className="btn" onClick={toggleProfile} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
            <User size={18} /> Profile
          </button>
          <button className="btn" onClick={logout} style={{ background: 'white', color: 'var(--primary-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Logout <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Sessions ── */}
      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} color="var(--primary-color)" /> Upcoming Sessions</h2>
        {sessions.length === 0 ? <p>No scheduled sessions.</p> : (
          <div className="grid-cols-3">
            {sessions.filter(s => s.status === 'Scheduled').map(session => (
              <div className="glass-panel" key={session._id}>
                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                  {`${new Date(session.date).toDateString()} | ${session.time || session.studentId?.timeSlot || '4-5 PM'}`}
                </h4>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{session.studentId?.name}</p>
                <p style={{ margin: 0 }}>Topic: {session.topic}</p>
                <button className="btn btn-primary mt-2" style={{ width: '100%' }}>Start Session</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Doubt Inbox (Message Icon) ── */}
      <button 
        className="btn btn-primary" 
        style={{ 
          position: 'fixed', bottom: '30px', right: '30px', 
          width: '56px', height: '56px', borderRadius: '50%', padding: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setShowInboxPanel(!showInboxPanel)}
      >
        {showInboxPanel ? <XCircle size={28} /> : (
          <div style={{ position: 'relative' }}>
            <MessageCircle size={28} />
            {doubts.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-8px', right: '-8px', 
                background: 'var(--alert-red)', color: 'white', 
                borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' 
              }}>
                {doubts.length}
              </span>
            )}
          </div>
        )}
      </button>

      {showInboxPanel && (
        <div className="glass-panel animate-slide-up" style={{ 
          position: 'fixed', bottom: '100px', right: '30px', 
          width: '380px', maxHeight: '500px', overflowY: 'auto', 
          zIndex: 100, border: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '1rem' }}>
            <HelpCircle size={20} color="var(--alert-red)" /> Doubt Inbox
          </h2>
          {doubts.length === 0 ? <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>All clear! No pending doubts.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doubts.map(doubt => (
                <div key={doubt._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}><strong>{doubt.studentId?.name}</strong> asked:</p>
                  <p style={{ fontSize: '1rem', color: 'var(--secondary-color)', fontStyle: 'italic', marginBottom: '8px' }}>"{doubt.question}"</p>
                  {answeringDoubtId === doubt._id ? (
                    <div>
                      <textarea className="form-control" value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Type answer..." style={{ padding: '8px', fontSize: '0.9rem' }} />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="btn btn-primary" onClick={() => answerDoubt(doubt._id)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Submit</button>
                        <button className="btn btn-secondary" onClick={() => setAnsweringDoubtId(null)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => setAnsweringDoubtId(doubt._id)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}><MessageSquare size={14} /> Reply</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Assigned Students ── */}
      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={24} color="var(--primary-hover)" /> Your Assigned Students</h2>
      </div>

      {!data ? <p>Loading data...</p> : (
        <div className="grid-cols-2">
          {data.map((item, index) => (
            <div className="glass-panel" key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} color="var(--primary-color)" /> {item.student.name}
                </h3>
                <span className="badge badge-success" style={{ background: levelColor[item.student.learningLevel] + '22', color: levelColor[item.student.learningLevel] }}>
                  {item.student.learningLevel}
                </span>
              </div>

              <div className="mb-3">
                <p style={{ margin: 0 }}><strong>🏫 Class:</strong> {item.student.classGrade ? `Class ${item.student.classGrade}` : 'N/A'}</p>
                <p style={{ margin: 0 }}><strong>📚 Learning Subject:</strong> {item.student.subject || 'Not Set'}</p>
                <p style={{ margin: 0 }}><strong>📊 Latest Score:</strong> {item.latestProgress?.quizScore ?? 'N/A'}{item.latestProgress ? '%' : ''}</p>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '1rem 0' }} />

              {/* Guidance */}
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>Guidance Suggestions</h4>
              <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem' }}>
                {item.suggestions && item.suggestions.length > 0 ? (
                  item.suggestions.map((sug, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      {sug.type === 'Alert' ? <AlertCircle color="var(--alert-red)" size={18} style={{ marginTop: '3px' }} /> : <TrendingUp color="var(--primary-color)" size={18} style={{ marginTop: '3px' }} />}
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: sug.type === 'Alert' ? 'var(--alert-red)' : 'var(--primary-color)' }}>Action: {sug.action}</strong>
                        <span style={{ fontSize: '0.85rem' }}>{sug.message}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem' }}>No recent data. Please log progress.</span>
                )}
              </div>

              {/* ✨ AI Lesson Button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                onClick={() => openGenPanel(item.student)}
              >
                <Sparkles size={16} /> Generate AI Lesson for {item.student.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── AI Content Generator Modal ── */}
      {activeGenStudent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={22} color="#6366f1" /> AI Lesson Generator
                </h2>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
                  For <strong>{activeGenStudent.name}</strong> · Class {activeGenStudent.classGrade} · {activeGenStudent.learningLevel}
                </p>
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveGenStudent(null)}>✕ Close</button>
            </div>

            {/* Topic & File Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  className="form-control"
                  placeholder="Enter topic (e.g. Fractions, Photosynthesis)"
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateContent()}
                  style={{ flex: 1 }}
                />
                <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} /> {genFile ? 'Change PDF' : 'Upload PDF'}
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setGenFile(e.target.files[0])} />
                </label>
              </div>
              {genFile && (
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  📄 <strong>{genFile.name}</strong> selected. AI will extract text from this PDF!
                </div>
              )}
              <button
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', width: '100%' }}
                onClick={generateContent}
                disabled={genLoading || (!genTopic.trim() && !genFile)}
              >
                {genLoading ? <><Loader size={16} className="spin" /> Generating...</> : <><Sparkles size={16} /> Generate ✨</>}
              </button>
            </div>

            {genError && (
              <div style={{ color: 'var(--alert-red)', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' }}>
                ⚠️ {genError}
              </div>
            )}

            {genLoading && (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤖</div>
                <p>Gemini is crafting a personalised lesson for {activeGenStudent.name}...</p>
              </div>
            )}

            {/* Generated Result */}
            {genResult && !genLoading && (
              <div>
                {/* Lesson */}
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #6366f1' }}>
                  <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
                    <BookOpen size={18} /> Lesson: {genResult.topic}
                  </h4>
                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{genResult.lessonContent}</p>
                </div>

                {/* Quiz Preview */}
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ margin: '0 0 0.75rem', color: '#f59e0b' }}>📝 Quiz Preview ({genResult.quiz.length} questions)</h4>
                  {genResult.quiz.map((q, qi) => (
                    <div key={qi} style={{ marginBottom: '1rem', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 'bold', fontSize: '0.9rem' }}>Q{qi + 1}. {q.question}</p>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{
                          padding: '4px 10px', margin: '3px 0', borderRadius: '4px', fontSize: '0.85rem',
                          background: oi === q.correctIndex ? 'rgba(34,197,94,0.15)' : 'rgba(0,0,0,0.04)',
                          border: oi === q.correctIndex ? '1px solid #22c55e' : '1px solid transparent',
                          color: oi === q.correctIndex ? '#22c55e' : 'inherit'
                        }}>
                          {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctIndex && '✓'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Success */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid #22c55e' }}>
                  <CheckCircle size={20} color="#22c55e" />
                  <div>
                    <strong style={{ color: '#22c55e' }}>Lesson assigned to {activeGenStudent.name}!</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>The student will see this in their dashboard and can take the quiz.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── Curriculum Modal ── */}
      {showCurriculum && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '900px', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, paddingBottom: '10px', paddingTop: '5px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={24} color="var(--primary-color)" /> Reference Curriculum Guide
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" onClick={() => {
                  setCurriculumText(JSON.stringify(curriculumData, null, 2));
                  setIsEditingCurriculum(!isEditingCurriculum);
                }}>
                  {isEditingCurriculum ? 'Cancel Edit' : 'Edit Curriculum'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCurriculum(false)}>✕</button>
              </div>
            </div>

            {selectedTopic && (
              <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary-hover)' }}>Topic: {selectedTopic}</h3>
                  <button className="btn btn-secondary" onClick={() => setSelectedTopic(null)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Close</button>
                </div>
                {!data || data.length === 0 ? <p>No students assigned.</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.map(item => {
                      const student = item.student;
                      const isCompleted = student.completedTopics?.includes(selectedTopic);
                      return (
                        <div key={student._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
                           <span style={{ fontWeight: 'bold' }}>{student.name} <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 'normal' }}>(Class {student.classGrade || 'N/A'})</span></span>
                           <button onClick={() => toggleStudentTopic(student._id, selectedTopic)} className={`btn ${isCompleted ? 'btn-success' : 'btn-secondary'}`} style={{ padding: '4px 15px', display: 'flex', alignItems: 'center', gap: '5px', minWidth: '130px', justifyContent: 'center' }}>
                             {isCompleted ? <><CheckCircle size={16} /> Completed</> : 'Mark Complete'}
                           </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {isEditingCurriculum ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ opacity: 0.8, margin: 0 }}>Edit the JSON below to customize your curriculum hierarchy.</p>
                <textarea 
                  className="form-control" 
                  value={curriculumText} 
                  onChange={e => setCurriculumText(e.target.value)} 
                  style={{ height: '300px', fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre' }} 
                />
                <button className="btn btn-primary" onClick={saveCurriculum} style={{ alignSelf: 'flex-start' }}>Save Curriculum</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(curriculumData).map(([level, subjects]) => (
                  <div key={level} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', color: 'var(--secondary-color)', marginTop: 0 }}>
                      {level}
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
                      {Object.entries(subjects).map(([subject, topics]) => (
                        <div key={subject} style={{ flex: '1 1 200px' }}>
                          <h4 style={{ margin: '0 0 10px 0', opacity: 0.9, color: 'var(--primary-hover)' }}>{subject}</h4>
                          <ul style={{ paddingLeft: '20px', margin: 0, opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {topics.map((t, idx) => (
                              <li 
                                key={idx} 
                                onClick={() => setSelectedTopic(t)} 
                                style={{ marginBottom: '5px', cursor: 'pointer', borderBottom: '1px dashed transparent', display: 'inline-block' }}
                                onMouseOver={e => e.target.style.borderBottom = '1px dashed var(--primary-color)'}
                                onMouseOut={e => e.target.style.borderBottom = '1px dashed transparent'}
                              >
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Profile Modal ── */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={24} color="var(--primary-color)" /> {isEditing ? 'Edit Profile' : 'My Profile'}
              </h2>
              <button className="btn btn-secondary" onClick={() => setShowProfile(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Full Name</label>
                {isEditing ? (
                  <input className="form-control" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                ) : (
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{user.name}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Email Address</label>
                <p style={{ margin: 0, opacity: 0.9 }}>{user.email}</p>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Expertise (Primary Subject)</label>
                {isEditing ? (
                  <select 
                    className="form-control" 
                    value={profileForm.subjects[0] || 'Math'} 
                    onChange={e => setProfileForm({...profileForm, subjects: [e.target.value]})}
                  >
                    <option>Math</option>
                    <option>English</option>
                    <option>Science</option>
                  </select>
                ) : (
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{user.subjects?.join(', ') || 'None'}</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Teaching Style</label>
                {isEditing ? (
                  <select 
                    className="form-control" 
                    value={profileForm.teachingStyle} 
                    onChange={e => setProfileForm({...profileForm, teachingStyle: e.target.value})}
                  >
                    <option>Interactive</option>
                    <option>Theory</option>
                    <option>Visual</option>
                  </select>
                ) : (
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{user.teachingStyle || 'Not Set'}</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
              {isEditing ? (
                <>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={updateProfile}>Save Changes</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
