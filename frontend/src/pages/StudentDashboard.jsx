import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Award, PlayCircle, MessageCircle, Mic, Send, HelpCircle, BookOpen, CheckCircle, XCircle, Star, User, Settings, Edit2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);

  const [doubtText, setDoubtText] = useState('');
  const [doubtStatus, setDoubtStatus] = useState('');
  const [showDoubtPanel, setShowDoubtPanel] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', classGrade: '', subject: '' });
  const [lessons, setLessons] = useState([]);
  const [openLesson, setOpenLesson] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const levelColor = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#6366f1' };
  const levelEmoji = { Beginner: '🌱', Intermediate: '📈', Advanced: '🚀' };

  const loadDashboard = useCallback(async (u) => {
    if (!u) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/student/dashboard/${u._id}`);
      const d = await res.json();
      setData(d);
      
      // Sync entire student profile from API to ensure everything (including mentor info) is up-to-date
      if (d.student) {
        setUser(prev => ({ ...prev, ...d.student }));
      }
      
      const resAI = await fetch(`http://127.0.0.1:5000/api/ai/lessons/${u._id}`);
      const jAI = await resAI.json();
      setLessons(Array.isArray(jAI) ? jAI : []);

      const resSessions = await fetch(`http://127.0.0.1:5000/api/sessions/student/${u._id}`);
      const jSessions = await resSessions.json();
      setUpcomingSessions(Array.isArray(jSessions) ? jSessions : []);
    } catch (err) {
      console.error('Frontend error:', err);
    }
  }, []);

  const toggleProfile = () => {
    if (!showProfile) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        classGrade: user.classGrade || '',
        subject: user.subject || ''
      });
    }
    setShowProfile(!showProfile);
    setIsEditing(false);
  };

  const updateProfile = async () => {
    try {
      console.log('Updating profile with payload:', {
        ...profileForm,
        classGrade: parseInt(profileForm.classGrade)
      });
      const res = await fetch(`http://127.0.0.1:5000/api/user/profile/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          classGrade: parseInt(profileForm.classGrade)
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsEditing(false);
        loadDashboard(data);
        alert('Profile updated successfully!');
      } else {
        alert(`Update failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Network error: Could not reach the server.');
    }
  };

  useEffect(() => {
    const loggedIn = JSON.parse(localStorage.getItem('user'));
    if (!loggedIn || loggedIn.role !== 'Student') return navigate('/login');
    setUser(loggedIn);
    loadDashboard(loggedIn);

    const poll = setInterval(() => loadDashboard(loggedIn), 30000);
    return () => clearInterval(poll);
  }, [navigate, loadDashboard]);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const chartData = [...(data?.progress || [])].reverse().map((p, i) => ({ name: `Quiz ${i + 1}`, score: p.quizScore }));

  const submitDoubt = async (type = 'text', textOverride) => {
    const question = textOverride || doubtText;
    if (!question) return;
    setDoubtStatus('Sending...');
    try {
      await fetch('http://127.0.0.1:5000/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user._id, mentorId: user.mentorId, question, inputType: type })
      });
      setDoubtStatus('Sent! Your mentor will respond soon.');
      setDoubtText('');
      loadDashboard(user); // Force Refresh list
    } catch { setDoubtStatus('Failed to send.'); }
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window)) { alert('Voice input requires Chrome.'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e) => { submitDoubt('voice', e.results[0][0].transcript); setIsRecording(false); };
    rec.onerror = rec.onend = () => setIsRecording(false);
    rec.start();
  };

  const openLessonView = (lesson) => {
    setOpenLesson(lesson);
    setQuizMode(false);
    setUserAnswers({});
    setQuizResult(null);
  };

  const submitQuiz = async () => {
    const total = openLesson.quiz.length;
    if (Object.keys(userAnswers).length < total) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const answers = openLesson.quiz.map((_, i) => userAnswers[i] ?? -1);
      const res = await fetch('http://127.0.0.1:5000/api/ai/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiContentId: openLesson._id, studentId: user._id, answers })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuizResult(json);
      // If level changed, update localStorage user
      if (json.levelChanged) {
        const stored = JSON.parse(localStorage.getItem('user'));
        stored.learningLevel = json.newLevel;
        localStorage.setItem('user', JSON.stringify(stored));
        setUser(stored);
      }
      // Refresh lessons list
      loadDashboard(user);
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="container animate-fade-in">
        <div className="dashboard-header">
          <div>
            <h1>Student Portal</h1>
            <p>
              Welcome back! You are on{' '}
              <span style={{ color: levelColor[user?.learningLevel], fontWeight: 'bold' }}>
                {levelEmoji[user?.learningLevel]} {user?.learningLevel}
              </span>{' '}Level.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={toggleProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Profile
            </button>
            <button className="btn btn-secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Logout <LogOut size={16} />
            </button>
          </div>
        </div>

        {!data ? <p>Loading your learning journey...</p> : (
          <div className="grid-cols-2">
            {/* Progress Chart */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={24} color="var(--primary-hover)" /> Your Progress
              </h2>
              <p>Recent quiz scores</p>
              {chartData.length > 0 ? (
                <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="var(--primary-color)" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <p>No test data available yet.</p>}
            </div>

            {/* ── Upcoming Sessions ── */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <Calendar size={24} color="var(--primary-color)" /> My Upcoming Sessions
              </h2>
              {upcomingSessions.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No sessions scheduled yet. Check back soon!</p>
              ) : (
                <div className="grid-cols-3" style={{ gap: '1rem' }}>
                  {upcomingSessions.map((session, idx) => (
                    <div key={idx} className="glass-panel" style={{ background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h4>
                      <p style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{session.time}</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>Mentor: {session.mentorId?.name}</p>
                      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Topic: {session.topic}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── AI Lessons from Mentor ── */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <BookOpen size={24} color="#6366f1" /> My AI Lessons from Mentor
              </h2>

              {lessons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📚</div>
                  <p>No lessons assigned yet. Your mentor will send personalised lessons soon!</p>
                </div>
              ) : (
                <div className="grid-cols-2" style={{ gap: '1rem' }}>
                  {lessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="glass-panel"
                      style={{
                        cursor: 'pointer',
                        border: lesson.completed ? '1px solid #22c55e' : '1px solid rgba(99,102,241,0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: '#6366f1' }}>📖 {lesson.topic}</h4>
                        {lesson.completed
                          ? <span style={{ fontSize: '0.78rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: '20px' }}>✓ Done · {lesson.quizScore}%</span>
                          : <span style={{ fontSize: '0.78rem', background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '2px 8px', borderRadius: '20px' }}>New</span>
                        }
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '0.82rem', opacity: 0.7 }}>
                        Class {lesson.classGrade} · {lesson.level} · {lesson.quiz.length} questions
                      </p>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', opacity: 0.6 }}>
                        {new Date(lesson.assignedAt).toLocaleDateString()}
                      </p>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', background: lesson.completed ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: lesson.completed ? '#22c55e' : '#fff' }}
                        onClick={() => openLessonView(lesson)}
                      >
                        {lesson.completed ? '📋 Review Lesson' : '▶ Start Lesson & Quiz'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Doubt Hub (Message Icon) ── */}
      <button 
        className="btn btn-primary" 
        style={{ 
          position: 'fixed', bottom: '30px', right: '30px', 
          width: '56px', height: '56px', borderRadius: '50%', padding: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={() => setShowDoubtPanel(!showDoubtPanel)}
      >
        {showDoubtPanel ? <XCircle size={28} /> : <MessageCircle size={28} />}
      </button>

      {showDoubtPanel && (
        <div className="glass-panel animate-slide-up" style={{ 
          position: 'fixed', bottom: '100px', right: '30px', 
          width: '380px', maxHeight: '500px', overflowY: 'auto', 
          zIndex: 100, border: '1px solid rgba(255,255,255,0.2)' 
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '1rem' }}>
            <HelpCircle size={20} color="var(--primary-color)" /> Doubt Hub
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <textarea className="form-control" rows="2" placeholder="Type your question..." value={doubtText} onChange={e => setDoubtText(e.target.value)} style={{ padding: '8px', fontSize: '0.9rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <small style={{ color: 'var(--primary-color)', fontSize: '0.7rem' }}>{doubtStatus}</small>
                <button className="btn btn-secondary" onClick={() => submitDoubt('text')} disabled={!doubtText} style={{ padding: '4px 10px', fontSize: '0.8rem' }}><Send size={14} /></button>
              </div>
            </div>
            <button onClick={startVoiceRecording} className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`} style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
              <Mic size={16} />
            </button>
          </div>

          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Recent Responses</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.doubts?.length === 0 ? <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>No messages yet.</p> :
              data?.doubts?.map(doubt => (
              <div key={doubt._id} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '4px' }}><strong>Q:</strong> {doubt.question}</div>
                {doubt.answer && <div style={{ color: 'var(--primary-color)', background: 'rgba(99,102,241,0.1)', padding: '6px', borderRadius: '4px' }}><strong>A:</strong> {doubt.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lesson + Quiz Modal ── */}
      {openLesson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#6366f1' }}>📖 {openLesson.topic}</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Class {openLesson.classGrade} · {openLesson.level}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setOpenLesson(null)}>✕ Close</button>
            </div>

            {/* Quiz Result Banner */}
            {quizResult && (
              <div style={{
                padding: '16px 20px', borderRadius: '12px', marginBottom: '1.5rem',
                background: quizResult.score >= 80 ? 'rgba(34,197,94,0.15)' : quizResult.score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${quizResult.score >= 80 ? '#22c55e' : quizResult.score >= 40 ? '#f59e0b' : '#ef4444'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Star size={28} color={quizResult.score >= 80 ? '#22c55e' : quizResult.score >= 40 ? '#f59e0b' : '#ef4444'} />
                  <div>
                    <h3 style={{ margin: 0 }}>You scored {quizResult.score}%</h3>
                    {quizResult.levelChanged
                      ? <p style={{ margin: 0, fontWeight: 'bold' }}>🎉 Level updated to <span style={{ color: levelColor[quizResult.newLevel] }}>{levelEmoji[quizResult.newLevel]} {quizResult.newLevel}</span>!</p>
                      : <p style={{ margin: 0, opacity: 0.8 }}>Level stays at <strong>{quizResult.newLevel}</strong>. Keep going!</p>
                    }
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            {!quizResult && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                <button className={`btn ${!quizMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setQuizMode(false)} style={{ flex: 1 }}>
                  📖 Lesson
                </button>
                <button 
                  className={`btn ${quizMode ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setQuizMode(true)} 
                  style={{ flex: 1, background: quizMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '' }}
                >
                  📝 {openLesson.completed ? `Review Quiz` : 'Take Quiz'}
                </button>
              </div>
            )}

            {/* Lesson Content */}
            {(!quizMode || quizResult) && (
              <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #6366f1', lineHeight: 1.8 }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.97rem' }}>{openLesson.lessonContent}</p>
              </div>
            )}

            {/* Quiz Mode (New or Review) */}
            {quizMode && !quizResult && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#f59e0b' }}>
                  {openLesson.completed ? `📝 Quiz Review (Last Score: ${openLesson.quizScore}%)` : '📝 Take Quiz — Answer all questions'}
                </h3>
                {openLesson.quiz.map((q, qi) => {
                  const isCompleted = openLesson.completed;
                  const correct = q.correctIndex;
                  return (
                    <div key={qi} style={{ 
                      background: 'var(--bg-color)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', 
                      border: isCompleted ? (qi % 2 === 0 ? '1px solid #22c55e33' : '1px solid #6366f133') : (userAnswers[qi] !== undefined ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent')
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.75rem' }}>
                         {isCompleted && <CheckCircle size={18} color="#22c55e" style={{ marginTop: '2px' }} />}
                         <p style={{ margin: 0, fontWeight: 'bold' }}>Q{qi + 1}. {q.question}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            style={{
                              padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem',
                              background: isCompleted && oi === correct ? 'rgba(34,197,94,0.15)' : (userAnswers[qi] === oi ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.03)'),
                              border: (isCompleted && oi === correct) ? '1px solid #22c55e' : (userAnswers[qi] === oi ? '1px solid #6366f1' : '1px solid transparent'),
                              display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                          >
                            {!isCompleted && (
                              <input
                                type="radio" name={`q${qi}`} value={oi}
                                checked={userAnswers[qi] === oi}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [qi]: oi }))}
                              />
                            )}
                            <span>{String.fromCharCode(65 + oi)}. {opt} {isCompleted && oi === correct && '✓'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setQuizMode(false)} style={{ flex: 1 }}>← Back to Lesson</button>
                  {!openLesson.completed && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 2, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                      onClick={submitQuiz}
                      disabled={submitting || Object.keys(userAnswers).length < openLesson.quiz.length}
                    >
                      {submitting ? 'Submitting...' : `Submit Quiz (${Object.keys(userAnswers).length}/${openLesson.quiz.length} answered)`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Review mode: show correct/wrong answers */}
            {quizResult && (
              <div>
                <h3 style={{ color: '#6366f1', marginBottom: '1rem' }}>Answer Review</h3>
                {openLesson.quiz.map((q, qi) => {
                  const chosen = userAnswers[qi];
                  const correct = q.correctIndex;
                  const isRight = chosen === correct;
                  return (
                    <div key={qi} style={{
                      background: 'var(--bg-color)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem',
                      borderLeft: `4px solid ${isRight ? '#22c55e' : '#ef4444'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        {isRight ? <CheckCircle size={18} color="#22c55e" style={{ marginTop: '2px' }} /> : <XCircle size={18} color="#ef4444" style={{ marginTop: '2px' }} />}
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>Q{qi + 1}. {q.question}</p>
                      </div>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{
                          padding: '4px 10px', margin: '3px 0', borderRadius: '4px', fontSize: '0.85rem',
                          background: oi === correct ? 'rgba(34,197,94,0.15)' : (oi === chosen && !isRight) ? 'rgba(239,68,68,0.1)' : 'transparent',
                          color: oi === correct ? '#22c55e' : (oi === chosen && !isRight) ? '#ef4444' : 'inherit'
                        }}>
                          {String.fromCharCode(65 + oi)}. {opt}
                          {oi === correct && ' ✓'}
                          {oi === chosen && !isRight && ' ✗'}
                        </div>
                      ))}
                    </div>
                  );
                })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Class / Grade</label>
                  {isEditing ? (
                    <select 
                      className="form-control" 
                      value={profileForm.classGrade} 
                      onChange={e => setProfileForm({...profileForm, classGrade: e.target.value})}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  ) : (
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Class {user.classGrade || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Preferred Subject</label>
                  {isEditing ? (
                    <select 
                      className="form-control" 
                      value={profileForm.subject} 
                      onChange={e => setProfileForm({...profileForm, subject: e.target.value})}
                    >
                      <option>Math</option>
                      <option>English</option>
                      <option>Science</option>
                    </select>
                  ) : (
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{user.subject || 'Not Set'}</p>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '5px' }}>Current Learning Level</label>
                <span className="badge" style={{ background: levelColor[user.learningLevel] + '22', color: levelColor[user.learningLevel], border: `1px solid ${levelColor[user.learningLevel]}` }}>
                   {levelEmoji[user.learningLevel]} {user.learningLevel}
                </span>
              </div>

              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.1)', marginTop: '5px' }}>
                <label style={{ fontSize: '0.85rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Assigned Mentor</label>
                {user.mentorId && typeof user.mentorId === 'object' && user.mentorId.name ? (
                  <>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1rem' }}>
                      👤 {user.mentorId.name}
                    </p>
                  </>
                ) : (upcomingSessions.length > 0 && upcomingSessions[0].mentorId?.name) ? (
                  <>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1rem' }}>
                      👤 {upcomingSessions[0].mentorId.name}
                    </p>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--alert-red)', fontStyle: 'italic' }}>
                    🕒 Waiting for assignment...
                  </p>
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
    </>
  );
}
