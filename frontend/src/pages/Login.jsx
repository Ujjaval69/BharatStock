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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(businessId.trim(), email.trim(), password);
      localStorage.setItem('bs_last_business_id', businessId.trim());
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-brand">BharatStock</h1>
        <p className="auth-tagline">Sign in to your shop's ledger.</p>

        {error ? <div className="error-banner">{error}</div> : null}

        <form onSubmit={handleSubmit}>
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

        <p className="auth-switch">
          New shop?{' '}
          <button type="button" onClick={() => navigate('/register')}>
            Register your business
          </button>
        </p>
      </div>
    </div>
  );
}
