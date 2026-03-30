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
          <h1>EDU Patashala</h1>
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

          <div className="form-group">
            <label className="form-label">Login As (Override)</label>
            <select 
               className="form-control" 
               value={selectedRole} 
               onChange={(e) => setSelectedRole(e.target.value)}
               style={{ opacity: 0.8 }}
            >
              <option value="Student">Student</option>
              <option value="Mentor">Mentor</option>
              <option value="Admin">NGO Admin (Special Access)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In Now'} <LogIn size={18} />
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
             <p style={{ fontSize: '0.85rem' }}>New to platform? <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Create account</Link></p>
          </div>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
           <button 
             onClick={() => setShowDemo(!showDemo)}
             style={{ background: 'none', border: 'none', color: 'var(--primary-hover)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', marginBottom: '1rem' }}
           >
             {showDemo ? 'Hide Quick Login' : 'Try Quick Login (Demo)'}
           </button>
           
           {showDemo && (
             <div className="animate-slide-up" style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {demoAccounts.map(acc => (
                  <div key={acc.email} style={{ marginBottom: '10px', cursor: 'pointer', padding: '5px', borderRadius: '4px' }} 
                       onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                       onMouseLeave={(e) => e.target.style.background = 'transparent'}
                       onClick={() => { 
                         setEmail(acc.email); 
                         setPassword(acc.pass); 
                         setSelectedRole(acc.role); 
                       }}>
                    <strong style={{ color: 'var(--primary-color)', display: 'block' }}>{acc.role} Account</strong>
                    <span>{acc.email} / {acc.pass}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Developer Quick Links */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin')} style={{ padding: '5px 10px', fontSize: '10px', opacity: 0.5 }}>Go Admin</button>
          <button onClick={() => navigate('/student')} style={{ padding: '5px 10px', fontSize: '10px', opacity: 0.5 }}>Go Student</button>
      </div>
    </div>
  );
}
