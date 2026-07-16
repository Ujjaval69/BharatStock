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
        <div className="landing-hero-badge">⚡ The Intelligent POS & Billing Ledger for Retailers</div>
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

      {/* Features Section */}
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

      {/* How It Works Section */}
      <section className="landing-steps">
        <h2 className="section-heading">Get Started in 3 Simple Steps</h2>
        <p className="section-subheading">Setting up BharatStock for your shop takes less than a minute.</p>
        
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Register Your Shop</h3>
            <p>Enter your store details and email to generate your unique **Business ID**. Save this ID to log in and connect your staff accounts.</p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>Populate Your Inventory</h3>
            <p>Add your products, configure categories, pricing, unit measurements, and set custom warning alerts for low stocks.</p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Log Sales & Print Bills</h3>
            <p>Select products, add customer details, auto-calculate GST tax breakdowns, and print clean invoices instantly.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="landing-faq">
        <h2 className="section-heading">Frequently Asked Questions</h2>
        <p className="section-subheading">Everything you need to know about BharatStock.</p>
        
        <div className="faq-container">
          <div className="faq-item">
            <h4>Is BharatStock completely free to use?</h4>
            <p>Yes! BharatStock is 100% free for shop owners, retail merchants, and local businesses. There are no hidden fees or payment gates.</p>
          </div>
          <div className="faq-item">
            <h4>Can my staff members access the same store ledger?</h4>
            <p>Yes. Once you register, you get a unique **Business ID**. Simply share this Business ID with your staff members, and they can log into the same shop ledger from their devices.</p>
          </div>
          <div className="faq-item">
            <h4>Do I need a special thermal printer to print receipts?</h4>
            <p>No. The "Print Invoice" button triggers your standard browser print dialog, which automatically scales to normal A4 paper or standard thermal receipt rolls depending on your local printer settings.</p>
          </div>
          <div className="faq-item">
            <h4>Is my business data secure?</h4>
            <p>Yes. BharatStock utilizes a secure multi-tenant architecture on MongoDB. Your inventory counts, client names, and sales ledgers are isolated and completely private to your login session.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-content">
          <h2>Ready to Digitize Your Store Ledger?</h2>
          <p>Create your account today and experience lightning-fast stock tracking and order billing.</p>
          <button 
            className="btn btn-primary btn-lg" 
            style={{ background: '#ffffff', color: '#0f172a', fontWeight: 'bold' }} 
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Open Free Account'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 BharatStock. All rights reserved. Built for local merchants across India.</div>
      </footer>
    </div>
  );
}
