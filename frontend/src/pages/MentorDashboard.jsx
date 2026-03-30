import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCheck, AlertCircle, TrendingUp, CheckCircle, Edit3, Calendar, HelpCircle, MessageSquare, Sparkles, BookOpen, Send, Loader } from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [user, setUser] = useState(null);

  const [answeringDoubtId, setAnsweringDoubtId] = useState(null);
  const [answerText, setAnswerText] = useState('');

  // AI Content State
  const [activeGenStudent, setActiveGenStudent] = useState(null); // student object
  const [genTopic, setGenTopic] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(null); // { lessonContent, quiz[], _id }
  const [genError, setGenError] = useState('');

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

    // Auto-refresh every 30 seconds to show latest student scores
    const poll = setInterval(() => loadData(loggedIn), 30000);
    return () => clearInterval(poll);
  }, [navigate]);

  const logout = () => { localStorage.clear(); navigate('/login'); };

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
    setGenResult(null);
    setGenError('');
  };

  const generateContent = async () => {
    if (!genTopic.trim()) return;
    setGenLoading(true);
    setGenError('');
    setGenResult(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeGenStudent._id,
          mentorId: user._id,
          topic: genTopic
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setGenResult(json);
    } catch (err) {
      setGenError(err.message || 'Generation failed. Try again.');
    }
    setGenLoading(false);
  };

  const levelColor = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#6366f1' };

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Volunteer Mentor Portal</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Logout <LogOut size={16} /></button>
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

      {/* ── Doubt Inbox ── */}
      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={24} color="var(--alert-red)" /> Doubt Inbox</h2>
        {doubts.length === 0 ? <p>No pending doubts.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {doubts.map(doubt => (
              <div className="glass-panel" key={doubt._id} style={{ borderColor: 'var(--alert-red)' }}>
                <p style={{ margin: 0 }}><strong>{doubt.studentId?.name}</strong> asked ({doubt.inputType}):</p>
                <p style={{ fontSize: '1.1rem', color: 'var(--secondary-color)', fontStyle: 'italic' }}>"{doubt.question}"</p>
                {answeringDoubtId === doubt._id ? (
                  <div style={{ marginTop: '10px' }}>
                    <textarea className="form-control" value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Type answer..." />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button className="btn btn-primary" onClick={() => answerDoubt(doubt._id)}>Submit Answer</button>
                      <button className="btn btn-secondary" onClick={() => setAnsweringDoubtId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-secondary mt-2" onClick={() => setAnsweringDoubtId(doubt._id)}><MessageSquare size={16} /> Reply</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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

            {/* Topic Input */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <input
                className="form-control"
                placeholder="Enter topic (e.g. Fractions, Photosynthesis, World War II)"
                value={genTopic}
                onChange={e => setGenTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateContent()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', minWidth: '160px' }}
                onClick={generateContent}
                disabled={genLoading || !genTopic.trim()}
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
    </div>
  );
}
