import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState(() => localStorage.getItem('bs_last_business_id') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 3D Parallax Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const factor = 10; // Max tilt rotation in degrees
    const rotateX = -(y / (box.height / 2)) * factor;
    const rotateY = (x / (box.width / 2)) * factor;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(businessId.trim(), email.trim(), password);
      localStorage.setItem('bs_last_business_id', businessId.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual-side">
        {/* Glowing 3D Glass Spheres */}
        <div className="auth-3d-sphere"></div>
        <div className="auth-3d-sphere-secondary"></div>

        <div className="auth-visual-content">
          <h2 className="auth-visual-title">
            Simple. Sober.<br />
            <span>Highly Effective.</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
            BharatStock is engineered to keep your shop's inventory, billing, and sales running with zero friction.
          </p>

          <div className="auth-visual-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="auth-feature-text">
                <h4>Stock Control</h4>
                <p>Track stock levels in real time. Receive low-stock warning banners immediately.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="auth-feature-text">
                <h4>Receipt Billing</h4>
                <p>Register local customer transactions and print clean, tax-breakdown bills.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              </div>
              <div className="auth-feature-text">
                <h4>Sales Trends</h4>
                <p>Visualize aggregate monthly revenues using custom vector graph components.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div
          className="auth-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.08s ease-out, box-shadow 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          <div style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
            <h1 className="auth-brand">BharatStock</h1>
            <p className="auth-tagline">Sign in to your shop's ledger.</p>
          </div>

          {error ? (
            <div className="error-banner" style={{ transform: 'translateZ(30px)' }}>
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
            <div className="field">
              <label htmlFor="businessId">Business ID</label>
              <input
                id="businessId"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                placeholder="the ID you got at signup"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch" style={{ transform: 'translateZ(20px)' }}>
            New shop?{' '}
            <button type="button" onClick={() => navigate('/register')}>
              Register your business
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
