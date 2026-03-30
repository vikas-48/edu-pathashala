import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Award, PlayCircle, MessageCircle, Mic, Send, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  
  // New States for Doubts and Quizzes
  const [doubtText, setDoubtText] = useState('');
  const [doubtStatus, setDoubtStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState('');

  useEffect(() => {
    const loggedIn = JSON.parse(localStorage.getItem('user'));
    if (!loggedIn || loggedIn.role !== 'Student') return navigate('/login');
    setUser(loggedIn);

    fetch(`http://127.0.0.1:5000/api/student/dashboard/${loggedIn._id}`)
      .then(res => res.json())
      .then(d => setData(d));
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Prepare chart data
  const chartData = data?.progress?.map((p, i) => ({
    name: `Quiz ${i+1}`,
    score: p.quizScore
  })).reverse() || [];

  // Submit Doubt Logic
  const submitDoubt = async (type = 'text', textOverride) => {
    const question = textOverride || doubtText;
    if (!question) return;
    
    setDoubtStatus('Sending...');
    try {
      await fetch('http://127.0.0.1:5000/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user._id,
          mentorId: user.mentorId, // could be null if unassigned
          question,
          inputType: type
        })
      });
      setDoubtStatus('Sent! Your mentor will respond soon.');
      setDoubtText('');
    } catch (e) {
      setDoubtStatus('Failed to send.');
    }
  };

  // Mock Voice Recording (uses Web Speech API)
  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      submitDoubt('voice', transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  // Submit Mock Quiz
  const submitQuiz = async () => {
    if(!quizScore) return;
    try {
      await fetch('http://127.0.0.1:5000/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user._id,
          mentorId: user.mentorId,
          topicId: data.currentTopic?._id || "000000000000000000000000",
          attended: true,
          quizScore: Number(quizScore),
          understanding: Math.min(5, Math.ceil(Number(quizScore)/20)),
          engagement: 4,
          confidence: 3
        })
      });
      setTakingQuiz(false);
      window.location.reload(); // Quick refresh for MVP
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Student Portal</h1>
          <p>Welcome back! You are on <span style={{color:'var(--primary-hover)', fontWeight:'bold'}}>{user?.learningLevel}</span> Level.</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout <LogOut size={16} />
        </button>
      </div>

      {!data ? <p>Loading your learning journey...</p> : (
        <div className="grid-cols-2">
          
          {/* Weekly Plan */}
          <div className="glass-panel">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={24} color="var(--primary-color)" /> Your Weekly Plan
            </h2>
            <p>Topic: <strong>{data.currentTopic?.topic}</strong></p>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.plan?.map((dayPlan, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Day {dayPlan.day}
                  </div>
                  <div>
                    {dayPlan.activity}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary mt-2" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setTakingQuiz(true)}>
               <PlayCircle size={18} /> Take Weekly Quiz
            </button>
          </div>

          {takingQuiz && (
            <div className="glass-panel" style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, 0)', zIndex: 100, width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
               <h3>Mock Quiz Component</h3>
               <p>Enter a mock score to simulate completing a generic module test.</p>
               <input type="number" className="form-control mb-3" placeholder="Score 0-100" value={quizScore} onChange={(e) => setQuizScore(e.target.value)} />
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button className="btn btn-primary" onClick={submitQuiz} style={{flex: 1}}>Submit Quiz</button>
                 <button className="btn btn-secondary" onClick={() => setTakingQuiz(false)} style={{flex: 1}}>Cancel</button>
               </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="glass-panel">
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
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="var(--primary-color)" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <p>No test data available yet.</p>
            )}
          </div>

          {/* Doubt Hub */}
          <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
             <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={24} color="var(--primary-color)" /> Doubt Hub
            </h2>
            <p>Stuck on an activity? Ask your volunteer mentor directly!</p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
               <div style={{ flex: 1 }}>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Type your question here..."
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                  ></textarea>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <small style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{doubtStatus}</small>
                    <button className="btn btn-secondary" onClick={() => submitDoubt('text')} disabled={!doubtText}>
                      <Send size={16} /> Send Text
                    </button>
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 10px' }}>
                  <button onClick={startVoiceRecording} className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`} style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}>
                    <Mic size={20} />
                  </button>
                  <small style={{ marginTop: '5px', fontSize: '0.75rem', color: isRecording ? 'var(--alert-red)' : 'var(--text-muted)' }}>
                    {isRecording ? 'Listening...' : 'Voice Note'}
                  </small>
               </div>
            </div>

            {/* Response History */}
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Mentor Responses</h4>
            {data.doubts?.length === 0 ? (
               <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No questions asked yet.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                  {data.doubts?.map((doubt) => (
                    <div key={doubt._id} style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: `4px solid ${doubt.status === 'Answered' ? 'var(--primary-hover)' : 'var(--border-color)'}` }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                         <small style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Q: {doubt.question}</small>
                         <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: doubt.status === 'Answered' ? 'var(--primary-light)' : '#ccc', color: doubt.status === 'Answered' ? 'var(--primary-color)' : '#666' }}>
                           {doubt.status}
                         </span>
                       </div>
                       {doubt.answer && (
                         <div style={{ marginTop: '8px', padding: '8px', background: 'var(--primary-light)', borderRadius: '4px', fontSize: '0.9rem' }}>
                            <strong style={{ color: 'var(--primary-color)' }}>A: </strong> {doubt.answer}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
