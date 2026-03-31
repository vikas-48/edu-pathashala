import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, TrendingUp, LogOut, AlertTriangle, UserPlus, Download, Check, X, Bell, Upload, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [class5Data, setClass5Data] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchPendingMatches();
    fetchClass5Data();
  }, []);

  const fetchClass5Data = () => {
    fetch('http://127.0.0.1:5000/api/students/class/5')
      .then(res => res.json())
      .then(data => setClass5Data(data));
  };

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

   

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingCSV(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('http://127.0.0.1:5000/api/admin/bulk-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: results.data })
          });
          const data = await res.json();
          if (res.ok) {
            alert(`Success! Imported ${data.count} users and generated ${data.generatedMatches} new matches.`);
            setShowBulkUpload(false);
            fetchStats();
            fetchPendingMatches();
          } else {
            alert(`Error processing file: ${data.error}`);
          }
        } catch (error) {
          alert('Failed to connect to bulk upload API.');
        }
        setUploadingCSV(false);
      },
      error: (error) => {
        alert('Error parsing CSV file');
        setUploadingCSV(false);
      }
    });
  };

  const [showUserModal, setShowUserModal] = useState(false);
  const [modalRole, setModalRole] = useState('Student');
  const [modalUsers, setModalUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const openUserModal = async (role) => {
    setModalRole(role);
    setShowUserModal(true);
    setLoadingUsers(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users?role=${role}`);
      const data = await res.json();
      setModalUsers(data);
    } catch(e) { console.error(e) }
    setLoadingUsers(false);
  };

  const exportModalUsers = () => {
    if (!modalUsers || modalUsers.length === 0) return;
    const rawHeaders = ['Name', 'Email', 'Role'];
    if (modalRole === 'Student') rawHeaders.push('Level', 'Language', 'Subject');
    else rawHeaders.push('Subjects', 'Teaching Style', 'Effectiveness');
    
    let csvContent = "data:text/csv;charset=utf-8," + rawHeaders.join(",") + "\n";
    modalUsers.forEach(user => {
        const base = `"${user.name || ''}","${user.email || ''}","${user.role || ''}"`;
        let extra = '';
        if (modalRole === 'Student') {
            extra = `,"${user.learningLevel || 'N/A'}","${user.language || 'N/A'}","${user.subject || 'N/A'}"`;
        } else {
            extra = `,"${(user.subjects || []).join(';') || 'N/A'}","${user.teachingStyle || 'N/A'}","${user.effectiveness || ''}"`;
        }
        csvContent += base + extra + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${modalRole}s_Directory.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <div className="container animate-fade-in">
        <div className="dashboard-header">
          <div>
            <h1>NGO Admin Dashboard</h1>
            <p>Platform overview and impact insights</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowBulkUpload(!showBulkUpload)} className="btn btn-primary">
              <Upload size={16} /> Bulk Upload Users
            </button>
            <button onClick={downloadReport} className="btn btn-secondary" disabled={loadingReport}>
              <Download size={16} /> {loadingReport ? 'Exporting...' : 'Export'}
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-secondary" style={{ border: '1px solid var(--border-color)' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {showBulkUpload && (
          <div className="glass-panel mb-4 animate-slide-up" style={{ border: '2px solid var(--primary-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload color="var(--primary-color)" /> Bulk Import Users</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Upload an offline CSV file. The system will ingest users, auto-generate passwords if missing, and actively match unassigned students.</p>
            
            <div style={{ padding: '25px', border: `2px dashed ${uploadingCSV ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '12px', textAlign: 'center', background: 'var(--bg-color)', transition: 'all 0.3s' }}>
                <Upload size={36} color={uploadingCSV ? "var(--primary-color)" : "var(--text-muted)"} style={{ marginBottom: '10px' }} />
                <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>{uploadingCSV ? 'Processing rows and running matching engine...' : 'Select a .csv file to integrate'}</div>
                {uploadingCSV ? (
                  <p style={{ color: 'var(--primary-color)', fontStyle: 'italic' }}>Please wait, AI generation in progress...</p>
                ) : (
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                )}
            </div>
            
            <div style={{ marginTop: '1.5rem', background: 'var(--primary-light)', padding: '15px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Required Student Columns:</strong> name, email, role (Student), subject, language, timeSlot, learningLevel, preferredStyle<br/>
              <strong style={{ marginTop: '5px', display: 'inline-block' }}>Required Mentor Columns:</strong> name, email, role (Mentor), subjects, languages, timeSlotMentor, teachingStyle, effectiveness
            </div>
          </div>
        )}

        {!stats ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <div className="grid-cols-3 mb-4">
              <div className="glass-panel" onClick={() => openUserModal('Student')} style={{ cursor: 'pointer', border: '1px solid transparent' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={32} color="var(--primary-color)" />
                  <div>
                    <h3 style={{ margin: 0 }}>{stats.studentsCount}</h3>
                    <p style={{ margin: 0 }}>Total Students</p>
                  </div>
                </div>
              </div>
              
              <div className="glass-panel" onClick={() => openUserModal('Mentor')} style={{ cursor: 'pointer', border: '1px solid transparent' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-hover)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}><AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} color="var(--alert-red)" /> System Alerts</h2>
                  <button 
                    className="btn btn-primary" 
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                    onClick={async () => {
                      const res = await fetch('http://127.0.0.1:5000/api/admin/run-matching', { method: 'POST' });
                      const d = await res.json();
                      alert(d.message);
                      fetchPendingMatches();
                    }}
                  >
                    <RefreshCw size={14} /> Run AI Re-Match
                  </button>
                </div>
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

                          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <small style={{ textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7, fontSize: '0.7rem' }}>Suggested Mentor</small>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                <TrendingUp size={14} /> {(match.mentorId?.effectiveness * 100 || 85).toFixed(0)}% Eff.
                              </div>
                            </div>
                            
                            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '8px' }}>{match.mentorId?.name}</strong>
                            
                            {/* Factors Section */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {match.factors && match.factors.map((factor, i) => (
                                <span key={i} style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '2px 8px', 
                                  background: 'var(--primary-light)', 
                                  color: 'var(--primary-color)', 
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                  border: '1px solid rgba(99, 102, 241, 0.1)'
                                }}>
                                  {factor}
                                </span>
                              ))}
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

            {/* ── Class 5 Dropout Monitor ── */}
            <div className="glass-panel mt-5" style={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--alert-red)' }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.04, transform: 'rotate(15deg)' }}>
                <AlertTriangle size={150} />
              </div>

              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--alert-red)', margin: '0 0 5px 0' }}>
                <AlertTriangle size={24} /> High-Risk Group: Class 5 Tracker
              </h2>
              <p style={{ opacity: 0.8, marginTop: 0, marginBottom: '20px', fontSize: '0.95rem' }}>NGO tracking for all Class 5 students to prevent dropouts and analyze growth.</p>
              
              {class5Data.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: 'var(--alert-red)' }}>No Class 5 students found.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', background: 'var(--bg-color)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                        <th style={{ padding: '16px 20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary-color)', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>Student Name</th>
                        <th style={{ padding: '16px 20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary-color)', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>Mentor</th>
                        <th style={{ padding: '16px 20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary-color)', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>Level</th>
                        <th style={{ padding: '16px 20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary-color)', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>Score</th>
                        <th style={{ padding: '16px 20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--secondary-color)', borderBottom: '2px solid rgba(239, 68, 68, 0.2)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {class5Data.map((item, index) => {
                        const levelColor = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#6366f1' };
                        const isAtRisk = item.latestProgress && item.latestProgress.quizScore < 40;
                        return (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{item.student.name}</td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.student.mentorId ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  {item.student.mentorId.name.charAt(0).toUpperCase()}
                                </div>
                                {item.student.mentorId.name}
                              </div>
                            ) : <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--alert-red)' }}>Unassigned</span>}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span className="badge" style={{ background: levelColor[item.student.learningLevel] + '22', color: levelColor[item.student.learningLevel], padding: '6px 10px' }}>
                              {item.student.learningLevel}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.latestProgress ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '50px', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${item.latestProgress.quizScore}%`, background: isAtRisk ? 'var(--alert-red)' : 'var(--primary-color)' }}></div>
                                </div>
                                <span style={{ color: isAtRisk ? 'var(--alert-red)' : 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                  {item.latestProgress.quizScore}%
                                </span>
                              </div>
                            ) : <span style={{ opacity: 0.5, fontSize: '0.85rem', fontStyle: 'italic' }}>No data</span>}
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {item.latestProgress ? (
                              isAtRisk ? 
                                <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--alert-red)' }}><AlertTriangle size={14} /> At Risk</span> :
                                <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><TrendingUp size={14} /> Growing</span>
                            ) : <span style={{ opacity: 0.5 }}>-</span>}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', background: 'white', position: 'relative' }}>
            <button onClick={() => setShowUserModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-muted)" />
            </button>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              {modalRole === 'Student' ? <Users color="var(--primary-color)" /> : <BookOpen color="var(--primary-hover)" />} 
              {modalRole} Directory
            </h2>
            <button onClick={exportModalUsers} className="btn btn-primary" style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Download size={16} /> Export to CSV
            </button>
            
            {loadingUsers ? <p>Loading user data...</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-color)', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Name</th>
                      <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Email</th>
                      {modalRole === 'Student' ? (
                        <>
                          <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Level</th>
                          <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Subject/Goal</th>
                        </>
                      ) : (
                        <>
                          <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Expertise</th>
                          <th style={{ padding: '12px 15px', color: 'var(--secondary-color)' }}>Style</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {modalUsers.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 15px' }}>{u.name}</td>
                        <td style={{ padding: '12px 15px' }}>{u.email}</td>
                        {modalRole === 'Student' ? (
                          <>
                            <td style={{ padding: '12px 15px' }}>{u.learningLevel || 'N/A'}</td>
                            <td style={{ padding: '12px 15px' }}>{u.subject || 'N/A'}</td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '12px 15px' }}>{(u.subjects || []).join(', ')}</td>
                            <td style={{ padding: '12px 15px' }}>{u.teachingStyle || 'N/A'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                    {modalUsers.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
