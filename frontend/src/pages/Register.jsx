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
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-brand">You're set up</h1>
          <p className="auth-tagline">Save your Business ID — you'll need it to log in next time.</p>
          <div className="credential-note">Business ID: {createdId}</div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => navigate('/')}>
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-brand">Open your shop</h1>
        <p className="auth-tagline">Set up BharatStock for your business in a minute.</p>

        {error ? <div className="error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit}>
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

        <p className="auth-switch">
          Already registered?{' '}
          <button type="button" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
