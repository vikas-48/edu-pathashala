import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, BookOpen, ShieldCheck, X, Smartphone, Globe, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));

        // Normalize role and use it for navigation
        const roleStr = (data.user.role || selectedRole).toLowerCase().trim();

        if (roleStr === 'admin') {
          navigate('/admin');
        } else if (roleStr === 'mentor') {
          navigate('/mentor');
        } else {
          navigate('/student');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPassword === 'youngistaan') {
      navigate('/admin');
    } else {
      setAdminError(true);
      setTimeout(() => setAdminError(false), 2000);
    }
  };

  const demoAccounts = [
    { role: 'Admin', email: 'admin@edu.org', pass: 'password123' },
    { role: 'Mentor', email: 'anil@mentor.org', pass: 'password123' },
    { role: 'Student', email: 'ravi@student.org', pass: 'password123' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={32} color="var(--primary-color)" />
          </div>
          <h1>EDU Pathashala</h1>
          <p>Login to your portal</p>
        </div>

        {error && <div style={{ color: 'var(--alert-red)', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. ravi@student.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In Now'} <LogIn size={18} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
            <p style={{ fontSize: '0.85rem' }}>New to platform? <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Create account</Link></p>
          </div>
        </form>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowAdminModal(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            style={{ 
              background: 'rgba(99, 102, 241, 0.05)', 
              border: '1px solid rgba(99, 102, 241, 0.2)', 
              color: 'var(--primary-color)', 
              padding: '10px 15px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontSize: '0.8rem', 
              opacity: 0.6, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontWeight: '600', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            <ShieldCheck size={14} /> NGO Staff Support Access
          </button>
        </div>
      </div>

      {/* ── Admin Portal Access Modal ── */}
      {showAdminModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
        }}>
          <div className="glass-panel animate-slide-up" style={{ 
            width: '90%', maxWidth: '380px', padding: '2.5rem', 
            position: 'relative', border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setShowAdminModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'grab', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.1)', 
                borderRadius: '12px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 1rem' 
              }}>
                <ShieldCheck size={28} color="var(--primary-color)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>Admin Auth</h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Secure gateway for platform coordinators</p>
            </div>

            <form onSubmit={handleAdminAuth}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Portal Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter security key"
                    autoFocus
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{ 
                      paddingLeft: '35px', 
                      borderColor: adminError ? 'var(--alert-red)' : 'rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                </div>
                {adminError && <p style={{ color: 'var(--alert-red)', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center', fontWeight: 'bold' }}>Access Denied: Invalid Key</p>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', marginTop: '1rem', 
                  background: adminError ? 'var(--alert-red)' : 'var(--primary-color)',
                  transition: 'all 0.3s'
                }}
              >
                Unlock Dashboard
              </button>
            </form>
            
            <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.5, marginTop: '1.5rem' }}>
              Restricted Environment • NGO Authorized Personnel Only
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
