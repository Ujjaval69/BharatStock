import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registerBusiness } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: '', ownerName: '', city: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState(null);

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

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const business = await registerBusiness(form);
      setCreatedId(business.id);
      localStorage.setItem('bs_last_business_id', business.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (createdId) {
    return (
      <div className="auth-container">
        <div className="auth-form-side" style={{ flex: 1 }}>
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
              <h1 className="auth-brand">You're set up!</h1>
              <p className="auth-tagline">Save your Business ID — you'll need it to log in next time.</p>
            </div>
            <div className="credential-note" style={{ fontSize: 16, textAlign: 'center', margin: '20px 0', transform: 'translateZ(30px)' }}>
              Business ID: <strong style={{ fontFamily: 'var(--font-mono)' }}>{createdId}</strong>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', transform: 'translateZ(20px)' }} onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-visual-side">
        {/* Floating 3D Glass Spheres */}
        <div className="auth-3d-sphere"></div>
        <div className="auth-3d-sphere-secondary"></div>

        <div className="auth-visual-content">
          <h2 className="auth-visual-title">
            Open your shop<br />
            <span>in seconds.</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: 0 }}>
            Create your store ledger, customize your stock limits, and start generating professional GST tax receipts.
          </p>

          <div className="auth-visual-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">🏪</div>
              <div className="auth-feature-text">
                <h4>Multi-tenant Isolation</h4>
                <p>Your products, customer CRM, and billing logs are kept strictly secure and private.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">🛡️</div>
              <div className="auth-feature-text">
                <h4>Data Ownership</h4>
                <p>Save business details, GSTIN, and local stock configurations directly.</p>
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
            <h1 className="auth-brand">Register</h1>
            <p className="auth-tagline">Set up BharatStock for your shop in a minute.</p>
          </div>

          {error ? (
            <div className="error-banner" style={{ transform: 'translateZ(30px)' }}>
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}>
            <div className="field">
              <label htmlFor="businessName">Shop name</label>
              <input id="businessName" value={form.businessName} onChange={update('businessName')} required />
            </div>
            <div className="field">
              <label htmlFor="ownerName">Your name</label>
              <input id="ownerName" value={form.ownerName} onChange={update('ownerName')} required />
            </div>
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" value={form.city} onChange={update('city')} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update('email')} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={update('password')}
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Creating…' : 'Create shop account'}
            </button>
          </form>

          <p className="auth-switch" style={{ transform: 'translateZ(20px)' }}>
            Already registered?{' '}
            <button type="button" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
