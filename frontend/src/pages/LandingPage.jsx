import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertCircle,
  BarChart3,
  Map,
  Users,
  Target,
  Lightbulb,
  UserCheck,
  Layers,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800', color: 'var(--secondary-color)' }}>
            Adaptive Learning <br />
            <span style={{ color: 'var(--primary-color)' }}>Support System</span>
          </h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem', color: 'var(--text-muted)' }}>
            Empowering NGOs with intelligent learning, mentor guidance, and impact tracking.
            A unified framework to bridge the gap in underserved education.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Explore Platform <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section style={{ backgroundColor: '#f8fafc', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700' }}>What are we solving?</h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary-color)', margin: '1rem auto' }}></div>
          </div>

          <div className="grid-cols-2" style={{ gap: '2rem' }}>
            <div className="glass-panel" style={{ borderLeft: '5px solid #ef4444' }}>
              <div style={{ background: '#fee2e2', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <AlertCircle color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Structured Learning Support</h3>
              <p>Volunteers often lack a professional framework. Without a curriculum or session roadmap, teaching becomes inconsistent and fragmented.</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '5px solid #f59e0b' }}>
              <div style={{ background: '#fef3c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BarChart3 color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Progress Tracking System</h3>
              <p>Without data-driven insights, there is no way to measure numerical improvement or detect subtle learning gaps early enough to fix them.</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '5px solid #3b82f6' }}>
              <div style={{ background: '#dbeafe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Users color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Poor Mentor–Student Matching</h3>
              <p>Students are typically assigned randomly. This fails to consider individual needs, language compatibility, or time availability.</p>
            </div>

            <div className="glass-panel" style={{ borderLeft: '5px solid #6366f1' }}>
              <div style={{ background: '#e0e7ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldCheck color="#6366f1" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lack of Impact Visibility</h3>
              <p>NGOs often struggle to showcase tangible outcomes to donors and partners because they lack a centralized system of truth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STRONG QUOTE */}
      <section style={{ backgroundColor: '#fff', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <span style={{ fontSize: '4rem', color: 'var(--primary-color)', opacity: 0.2, fontFamily: 'serif', lineHeight: 0 }}>“</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '400', fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
            Education is the most powerful weapon which you can use to change the world.
          </h2>
          <p style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-color)' }}>— Nelson Mandela</p>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Our Solution</h2>
            <p style={{ maxWidth: '600px', margin: '1rem auto' }}>Intelligent tools designed for real-world social impact environments.</p>
          </div>

          <div className="grid-cols-3" style={{ gap: '2rem' }}>
            {/* Feature 1 */}
            <div className="glass-panel hover-grow">
              <Lightbulb size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
              <h3>Learning Intelligence Engine</h3>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <li>Tracks student progress in real-time</li>
                <li>Detects learning gaps early</li>
                <li>Generates adaptive learning paths</li>
              </ul>
            </div>

            {/* Feature 2 (Highlighted) */}
            <div className="glass-panel hover-grow" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-color)' }}>
              <UserCheck size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
              <h3>Mentor Guidance System</h3>
              <p style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Innovation Spotlight</p>
              <p style={{ fontSize: '0.95rem' }}>Automatically suggests specific teaching strategies for each student based on their unique performance and engagement levels.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel hover-grow">
              <Map size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
              <h3>Smart Matching</h3>
              <p style={{ fontSize: '0.95rem' }}>Advanced algorithm matching based on compatibility, subject expertise, and availability—with a final human-in-the-loop approval.</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel hover-grow">
              <Layers size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
              <h3>Structured Learning Content</h3>
              <p style={{ fontSize: '0.95rem' }}>Level-based modules that adapt to the student's actual knowledge point, not just their grade class. Automated weekly plans.</p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel hover-grow" style={{ gridColumn: 'span 2' }}>
              <Target size={32} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
              <div className="grid-cols-2" style={{ gap: '2rem' }}>
                <div>
                  <h3>NGO Impact Dashboard</h3>
                  <p style={{ fontSize: '0.95rem' }}>Centralized insights for coordinators to monitor entire community-based learning systems at a single glance.</p>
                </div>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <li>Real-time attendance & engagement</li>
                  <li>Individual student growth trends</li>
                  <li>Auditable impact reports for donors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section style={{ backgroundColor: '#1e293b', color: 'white', padding: '100px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white' }}>How it Works</h2>
          </div>

          <div className="grid-cols-4" style={{ gap: '2rem' }}>
            {[
              { step: '01', title: 'Data Collection', desc: 'Student enrollment and benchmark assessments.' },
              { step: '02', title: 'Deep Analysis', desc: 'System identifies specific strengths and weaknesses.' },
              { step: '03', title: 'Guided Teaching', desc: 'Mentors receive AI-backed guidance for each session.' },
              { step: '04', title: 'Measure Impact', desc: 'NGO coordinators track progress and prove impact.' }
            ].map((item, id) => (
              <div key={id} style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: '900', opacity: 0.1, marginBottom: '-2rem' }}>{item.step}</div>
                <h4 style={{ color: 'var(--primary-color)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION (YOUNGISTAAN) */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '60px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                  <Heart color="#ef4444" fill="#ef4444" size={24} />
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Real Impact Partner</span>
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Inspired by Real Impact</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                  <strong>Youngistaan Foundation</strong> is a leading NGO working on educating underserved children via volunteer mentorship. Their focus on holistic development in community-based learning environments is the core inspiration behind this framework.
                </p>
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '3px solid var(--primary-color)', paddingLeft: '1rem', marginBottom: '2.5rem' }}>
                  “This platform is specifically designed to support and scale high-impact initiatives like Youngistaan Foundation’s Bright Spark program.”
                </p>
                <a href="https://youngistaanfoundation.org" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Learn About Youngistaan <ExternalLink size={16} />
                </a>
              </div>
              <div style={{ flex: 1, height: '400px', background: 'var(--primary-light)', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={120} color="var(--primary-color)" opacity={0.3} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ backgroundColor: '#f8fafc', padding: '60px 0', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>EDU Patashala</h3>
              <p style={{ margin: 0 }}>Built for social impact.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Developed for NGOs by Team Pathashala</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>© 2026 Adaptive Learning Support System</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Global CSS for the Landing Page only */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .landing-wrapper { color: var(--text-main); }
        .hero-section { background: radial-gradient(circle at top right, var(--primary-light) 0%, #fff 60%); }
        .grid-cols-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .hover-grow { transition: transform 0.3s ease; }
        .hover-grow:hover { transform: scale(1.03); }
        .btn-lg { padding: 16px 32px; font-size: 1.1rem; border-radius: 12px; }
      `}} />
    </div>
  );
}
