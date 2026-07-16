import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Landing() {
  const { user, business } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  return (
    <div className="landing-shell">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-brand">BharatStock</div>
        <nav className="landing-nav-links">
          {isLoggedIn ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Register Shop
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">🚀 Simple. Sober. Highly Effective.</div>
        <h1 className="landing-title">
          The Smart POS & Ledger for <br />
          <span>Modern Indian Shops</span>
        </h1>
        <p className="landing-subtitle">
          Ditch the paper notebooks and complicated spreadsheets. Track inventory levels, log sales, calculate GST automatically, and print bills in seconds.
        </p>

        <div className="landing-ctas">
          {isLoggedIn ? (
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Open Free Account →
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
                Sign In to Shop
              </button>
            </>
          )}
        </div>

        {/* 3D-like Mockup Preview Box */}
        <div className="landing-mockup-wrapper">
          <div className="landing-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red"></span>
              <span className="mockup-dot yellow"></span>
              <span className="mockup-dot green"></span>
              <span className="mockup-title">Active Stock Snapshot</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-row">
                <span>Basmati Rice (Premium)</span>
                <span className="pill success">120 kg in stock</span>
                <strong>{formatINR(95)}/kg</strong>
              </div>
              <div className="mockup-row">
                <span>Fortune Mustard Oil</span>
                <span className="pill pending">Low Stock (2 left)</span>
                <strong>{formatINR(175)}/L</strong>
              </div>
              <div className="mockup-row">
                <span>Tata Salt (Iodized)</span>
                <span className="pill cancelled">Out of Stock</span>
                <strong>{formatINR(28)}/pcs</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-features">
        <h2 className="section-heading">Everything You Need to Run Your Shop</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">⚡</div>
            <h3>Lightning Fast POS Billing</h3>
            <p>Log transactions with registered clients or walk-in guests. Calculate taxes and print thermal receipt slips instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box">📦</div>
            <h3>Automated Stock Alerts</h3>
            <p>Set stock thresholds and receive immediate restock warnings. Prevent overselling with atomic client-side validators.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-box">📊</div>
            <h3>Visual Sales Trends</h3>
            <p>Track your daily store revenues and high-selling items through clean, vector graph dashboard panels.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-pricing">
        <h2 className="section-heading">Simple, Transparent Pricing</h2>
        <p className="section-subheading">Choose the plan that fits the size of your business ledger.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Starter Plan</h3>
            <div className="price-tag">₹0<span>/month</span></div>
            <p>Best for single-owner small local shops.</p>
            <ul>
              <li>✓ Manage up to 50 Products</li>
              <li>✓ Daily Sales & Order Logging</li>
              <li>✓ Tax Invoice Print Receipts</li>
              <li>✓ Basic Analytics Graph</li>
            </ul>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 24 }} onClick={() => navigate('/register')}>
              Get Started Free
            </button>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Pro Ledger</h3>
            <div className="price-tag">₹499<span>/month</span></div>
            <p>Best for busy shops needing multi-staff log entries.</p>
            <ul>
              <li>✓ **Unlimited** Products & Categories</li>
              <li>✓ Multiple Staff Account Logins</li>
              <li>✓ Complete Customer Directory CRM</li>
              <li>✓ Full Sales Trend & Revenue Reporting</li>
              <li>✓ Priority Email & Chat Support</li>
            </ul>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={() => navigate('/register')}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 BharatStock. All rights reserved. Built for local merchants across India.</div>
      </footer>
    </div>
  );
}
