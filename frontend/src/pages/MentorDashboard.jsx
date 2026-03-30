import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCheck, AlertCircle, TrendingUp, CheckCircle, Edit3, Calendar, HelpCircle, MessageSquare } from 'lucide-react';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [user, setUser] = useState(null);
  
  const [answeringDoubtId, setAnsweringDoubtId] = useState(null);
  const [answerText, setAnswerText] = useState('');

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
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const answerDoubt = async (doubtId) => {
    if(!answerText) return;
    try {
      await fetch('http://127.0.0.1:5000/api/doubts/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doubtId, answer: answerText })
      });
      setAnsweringDoubtId(null);
      setAnswerText('');
      loadData(user);
    } catch(e) {}
  };

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Volunteer Mentor Portal</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout <LogOut size={16} />
        </button>
      </div>

      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={24} color="var(--primary-color)"/> Upcoming Sessions</h2>
        {sessions.length === 0 ? <p>No scheduled sessions.</p> : (
            <div className="grid-cols-3">
              {sessions.filter(s => s.status === 'Scheduled').map(session => (
                  <div className="glass-panel" key={session._id}>
                      <h4 style={{ margin: 0 }}>{new Date(session.date).toLocaleDateString()}</h4>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{session.studentId?.name}</p>
                      <p style={{ margin: 0 }}>Topic: {session.topic}</p>
                      <button className="btn btn-primary mt-2" style={{width: '100%'}}>Start Session</button>
                  </div>
              ))}
            </div>
        )}
      </div>

      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={24} color="var(--alert-red)"/> Doubt Inbox</h2>
        {doubts.length === 0 ? <p>No pending doubts.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doubts.map(doubt => (
                  <div className="glass-panel" key={doubt._id} style={{ borderColor: 'var(--alert-red)' }}>
                      <p style={{ margin: 0 }}><strong>{doubt.studentId?.name}</strong> asked ({doubt.inputType}):</p>
                      <p style={{ fontSize: '1.1rem', color: 'var(--secondary-color)', fontStyle: 'italic' }}>"{doubt.question}"</p>
                      
                      {answeringDoubtId === doubt._id ? (
                          <div style={{ marginTop: '10px' }}>
                              <textarea className="form-control" value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Type answer..."></textarea>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                 <button className="btn btn-primary" onClick={() => answerDoubt(doubt._id)}>Submit Answer</button>
                                 <button className="btn btn-secondary" onClick={() => setAnsweringDoubtId(null)}>Cancel</button>
                              </div>
                          </div>
                      ) : (
                          <button className="btn btn-secondary mt-2" onClick={() => setAnsweringDoubtId(doubt._id)}><MessageSquare size={16}/> Reply</button>
                      )}
                  </div>
              ))}
            </div>
        )}
      </div>

      <div className="mb-4">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={24} color="var(--primary-hover)"/> Your Assigned Students</h2>
      </div>

      {!data ? <p>Loading data...</p> : (
        <div className="grid-cols-2">
          {data.map((item, index) => (
            <div className="glass-panel" key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} color="var(--primary-color)" /> {item.student.name}
                </h3>
                <span className="badge badge-success">{item.student.learningLevel}</span>
              </div>
              
              <div className="mb-3">
                <p style={{ margin: 0 }}><strong>Latest Score:</strong> {item.latestProgress?.quizScore || 'N/A'}%</p>
                <p style={{ margin: 0 }}><strong>Topic:</strong> {item.latestProgress ? 'Addition & Subtraction' : 'N/A'}</p>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '1rem 0' }} />

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                 Guidance Suggestions
              </h4>
              <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: 'var(--border-radius-md)' }}>
                {item.suggestions && item.suggestions.length > 0 ? (
                  item.suggestions.map((sug, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      {sug.type === 'Alert' ? <AlertCircle color="var(--alert-red)" size={18} style={{marginTop:'3px'}} /> : <TrendingUp color="var(--primary-color)" size={18} style={{marginTop:'3px'}} />}
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: sug.type==='Alert' ? 'var(--alert-red)' : 'var(--primary-color)' }}>
                           Action: {sug.action}
                        </strong>
                        <span style={{ fontSize: '0.85rem' }}>{sug.message}</span>
                      </div>
                    </div>
                  ))
                ) : (
                   <span style={{ fontSize: '0.85rem' }}>No recent data. Please log progress.</span>
                )}
              </div>

              <button className="btn btn-primary mt-2" style={{ width: '100%', marginTop: '1rem' }}>
                 <Edit3 size={16} /> Log New Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
