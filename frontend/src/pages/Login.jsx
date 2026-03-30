import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, BookOpen } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');

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
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => {
              const p = prompt('Enter Admin Password:');
              if (p === 'youngistaan') navigate('/admin');
              else if (p) alert('Access Denied');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6 }}
          >
            NGO Administrative Portal Access
          </button>
        </div>
      </div>
    </div>
  );
}
