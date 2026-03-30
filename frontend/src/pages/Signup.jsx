import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, BookOpen, Clock, Globe, Award, Sparkles, LogIn } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [onboardType, setOnboardType] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', learningLevel: 'Beginner',
    subject: 'Math', language: 'Telugu', timeSlot: '5-6 PM', preferredStyle: 'Interactive',
    subjects: ['Math'], languages: ['Telugu'], timeSlotMentor: '5-6 PM', teachingStyle: 'Interactive', effectiveness: 0.8
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = onboardType === 'Student' ? '/api/students' : '/api/mentors';
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Welcome! Your account has been created. Please log in.');
        navigate('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Connection error. Is the server running?');
    }
    setLoading(false);
  };

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
             <UserPlus size={32} color="var(--primary-color)" />
          </div>
          <h1>Create Your Account</h1>
          <p>Join the EDU Patashala community</p>
        </div>

        {error && <div style={{ color: 'var(--alert-red)', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.1)', padding: '5px', borderRadius: 'var(--border-radius-md)' }}>
          <button 
            className={`btn ${onboardType === 'Student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setOnboardType('Student')}
          >I'm a Student</button>
          <button 
            className={`btn ${onboardType === 'Mentor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setOnboardType('Mentor')}
          >I'm a Volunteer</button>
        </div>

        <form onSubmit={handleSignup} className="grid-cols-2" style={{ gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Full Name</label>
            <input className="form-control" type="text" placeholder="John Doe" required onChange={e => updateForm('name', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="john@example.com" required onChange={e => updateForm('email', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Create Password</label>
            <input className="form-control" type="password" placeholder="••••••••" required onChange={e => updateForm('password', e.target.value)} />
          </div>

          <div style={{ gridColumn: 'span 2', borderBottom: '1px solid var(--border-color)', margin: '10px 0', paddingBottom: '5px' }}>
             <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)' }}>Matching Preferences</h3>
             <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>This helps us find the perfect match for you.</p>
          </div>

          {onboardType === 'Student' ? (
            <>
              <div>
                <label className="form-label"><BookOpen size={14} style={{ marginRight: '5px' }} /> Learning Subject</label>
                <select className="form-control" onChange={e => updateForm('subject', e.target.value)}>
                  <option>Math</option>
                  <option>English</option>
                  <option>Science</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Globe size={14} style={{ marginRight: '5px' }} /> Preferred Language</label>
                <select className="form-control" onChange={e => updateForm('language', e.target.value)}>
                  <option>Telugu</option>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Clock size={14} style={{ marginRight: '5px' }} /> Time Slot</label>
                <select className="form-control" onChange={e => updateForm('timeSlot', e.target.value)}>
                  <option>5-6 PM</option>
                  <option>6-7 PM</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Sparkles size={14} style={{ marginRight: '5px' }} /> Learning Style</label>
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
                <label className="form-label"><BookOpen size={14} style={{ marginRight: '5px' }} /> Expertise</label>
                <select className="form-control" onChange={e => updateForm('subjects', [e.target.value])}>
                  <option>Math</option>
                  <option>English</option>
                  <option>Science</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Globe size={14} style={{ marginRight: '5px' }} /> Languages</label>
                <select className="form-control" onChange={e => updateForm('languages', [e.target.value])}>
                  <option>Telugu</option>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Clock size={14} style={{ marginRight: '5px' }} /> Teaching Time</label>
                <select className="form-control" onChange={e => updateForm('timeSlotMentor', e.target.value)}>
                  <option>5-6 PM</option>
                  <option>6-7 PM</option>
                </select>
              </div>
              <div>
                <label className="form-label"><Award size={14} style={{ marginRight: '5px' }} /> Teaching Style</label>
                <select className="form-control" onChange={e => updateForm('teachingStyle', e.target.value)}>
                  <option>Interactive</option>
                  <option>Theory</option>
                  <option>Visual</option>
                </select>
              </div>
            </>
          )}

          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
               <p style={{ fontSize: '0.9rem' }}>Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Login</Link></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
