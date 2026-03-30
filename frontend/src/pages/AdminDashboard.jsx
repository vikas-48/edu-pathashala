import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, TrendingUp, LogOut, AlertTriangle, UserPlus, Download, Check, X, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPendingMatches();
  }, []);

  const fetchStats = () => {
    fetch('http://127.0.0.1:5000/api/admin/stats')
      .then(r => r.json())
      .then(data => setStats(data));
  };

  const fetchPendingMatches = () => {
    fetch('http://127.0.0.1:5000/api/admin/pending-matches')
      .then(r => r.json())
      .then(data => setPendingMatches(data));
  };

  const approveMatch = async (matchId) => {
    try {
      await fetch('http://127.0.0.1:5000/api/admin/approve-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      fetchPendingMatches();
      fetchStats();
    } catch (error) {
      console.error('Error approving match:', error);
    }
  };

  const rejectMatch = async (matchId) => {
    try {
      await fetch('http://127.0.0.1:5000/api/admin/reject-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      fetchPendingMatches();
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const downloadReport = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/reports');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NGO_Impact_Report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
    setLoadingReport(false);
  };

  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardType, setOnboardType] = useState('Student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: 'password123', age: '', learningLevel: 'Beginner',
    subject: 'Math', language: 'Telugu', timeSlot: '5-6 PM', preferredStyle: 'Interactive',
    subjects: ['Math'], languages: ['Telugu'], timeSlotMentor: '5-6 PM', teachingStyle: 'Interactive', effectiveness: 0.8
  });

  const handleOnboard = async (e) => {
    e.preventDefault();
    const endpoint = onboardType === 'Student' ? '/api/students' : '/api/mentors';
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert(`${onboardType} onboarded successfully!`);
        setShowOnboard(false);
        fetchStats();
        fetchPendingMatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>NGO Admin Dashboard</h1>
          <p>Platform overview and impact insights</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowOnboard(!showOnboard)} className="btn btn-primary">
            <UserPlus size={16} /> {showOnboard ? 'Close Form' : 'Onboard User'}
          </button>
          <button onClick={downloadReport} className="btn btn-secondary" disabled={loadingReport}>
            <Download size={16} /> {loadingReport ? 'Exporting...' : 'Export'}
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-secondary" style={{ border: '1px solid var(--border-color)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {showOnboard && (
        <div className="glass-panel mb-4 animate-slide-up" style={{ border: '2px solid var(--primary-color)' }}>
           <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <button 
                className={`btn ${onboardType === 'Student' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setOnboardType('Student')}
              >Onboard Student</button>
              <button 
                className={`btn ${onboardType === 'Mentor' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setOnboardType('Mentor')}
              >Onboard Mentor</button>
           </div>

           <form onSubmit={handleOnboard} className="grid-cols-2" style={{ gap: '1.5rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-control" type="text" required onChange={e => updateForm('name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" required onChange={e => updateForm('email', e.target.value)} />
              </div>

              {onboardType === 'Student' ? (
                <>
                  <div>
                    <label className="form-label">Subject</label>
                    <select className="form-control" onChange={e => updateForm('subject', e.target.value)}>
                      <option>Math</option>
                      <option>English</option>
                      <option>Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Language</label>
                    <select className="form-control" onChange={e => updateForm('language', e.target.value)}>
                      <option>Telugu</option>
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Preferred Time</label>
                    <select className="form-control" onChange={e => updateForm('timeSlot', e.target.value)}>
                      <option>5-6 PM</option>
                      <option>6-7 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Learning Style</label>
                    <select className="form-control" onChange={e => updateForm('preferredStyle', e.target.value)}>
                      <option>Interactive</option>
                      <option>Theory</option>
                      <option>Visual</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="form-label">Expertise (Subject)</label>
                    <select className="form-control" onChange={e => updateForm('subjects', [e.target.value])}>
                      <option>Math</option>
                      <option>English</option>
                      <option>Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Languages</label>
                    <select className="form-control" onChange={e => updateForm('languages', [e.target.value])}>
                      <option>Telugu</option>
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Teaching Style</label>
                    <select className="form-control" onChange={e => updateForm('teachingStyle', e.target.value)}>
                      <option>Interactive</option>
                      <option>Theory</option>
                      <option>Visual</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Effectiveness (0.1 - 1.0)</label>
                    <input className="form-control" type="number" step="0.1" min="0.1" max="1" defaultValue="0.8" onChange={e => updateForm('effectiveness', parseFloat(e.target.value))} />
                  </div>
                </>
              )}
              
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Complete Onboarding</button>
              </div>
           </form>
        </div>
      )}

      {!stats ? (
         <p>Loading analytics...</p>
      ) : (
        <>
          <div className="grid-cols-3 mb-4">
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={32} color="var(--primary-color)" />
                <div>
                  <h3 style={{ margin: 0 }}>{stats.studentsCount}</h3>
                  <p style={{ margin: 0 }}>Total Students</p>
                </div>
              </div>
            </div>
            
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={32} color="var(--primary-hover)" />
                <div>
                  <h3 style={{ margin: 0 }}>{stats.mentorsCount}</h3>
                  <p style={{ margin: 0 }}>Active Mentors</p>
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={32} color="var(--primary-color)" />
                <div>
                  <h3 style={{ margin: 0 }}>{stats.avgScore.toFixed(0)}%</h3>
                  <p style={{ margin: 0 }}>Avg Performance</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="glass-panel">
              <h2><AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} color="var(--alert-red)" /> System Alerts</h2>
              <p>Critical: {pendingMatches.length} pending mentor assignments require your approval.</p>
              <button className="btn btn-secondary">Review At-Risk Students</button>
            </div>

            <div className="glass-panel">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="var(--primary-color)" /> Pending Matches
              </h2>
              <p>Top compatible matches based on subject, time, and language.</p>
              
              <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                {pendingMatches.length === 0 ? (
                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No pending matching requests.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pendingMatches.map((match) => (
                      <div key={match._id} className="glass-panel" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary-color)' }}>{match.studentId?.name}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span>{match.studentId?.subject}</span> • <span>{match.studentId?.language}</span> • <span>{match.studentId?.timeSlot}</span>
                            </div>
                          </div>
                          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {Math.round(match.score * 100)}% Match
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                          <small style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Mentor</small>
                          <strong style={{ display: 'block', fontSize: '1rem' }}>{match.mentorId?.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary-hover)' }}>
                             Style: {match.mentorId?.teachingStyle || 'N/A'} • Effectiveness: {match.mentorId?.effectiveness || 0.7}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, padding: '6px' }}
                            onClick={() => approveMatch(match._id)}
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ flex: 1, padding: '6px' }}
                            onClick={() => rejectMatch(match._id)}
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
