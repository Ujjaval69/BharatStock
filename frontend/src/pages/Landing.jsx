import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function formatINR(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Landing() {
  const { user, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  // 1. FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);
  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  // 2. Interactive Mockup State
  const [mockProducts, setMockProducts] = useState([
    { id: '1', name: 'Basmati Rice (Premium)', stock: 120, unit: 'kg', price: 95, status: 'success', statusText: '120 kg in stock' },
    { id: '2', name: 'Fortune Mustard Oil', stock: 2, unit: 'L', price: 175, status: 'pending', statusText: 'Low Stock (2 left)' },
    { id: '3', name: 'Tata Salt (Iodized)', stock: 0, unit: 'pcs', price: 28, status: 'cancelled', statusText: 'Out of Stock' },
  ]);
  const [lastClickedId, setLastClickedId] = useState(null);

  const handleRestockClick = (id) => {
    setLastClickedId(id);
    setMockProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStock = p.stock === 0 ? 10 : p.stock + 10;
          return {
            ...p,
            stock: nextStock,
            status: 'success',
            statusText: `${nextStock} ${p.unit} in stock`,
          };
        }
        return p;
      })
    );
    // Remove the flash animation class after 500ms
    setTimeout(() => {
      setLastClickedId(null);
    }, 500);
  };

  // 3. Smooth Scroll Handler
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqData = [
    {
      q: 'Is BharatStock completely free to use?',
      a: 'Yes! BharatStock is 100% free for shop owners, retail merchants, and local businesses. There are no hidden fees or payment gates.',
    },
    {
      q: 'Can my staff members access the same store ledger?',
      a: 'Yes. Once you register, you get a unique Business ID. Simply share this Business ID with your staff members, and they can log into the same shop ledger from their devices.',
    },
    {
      q: 'Do I need a special thermal printer to print receipts?',
      a: 'No. The "Print Invoice" button triggers your standard browser print dialog, which automatically scales to normal A4 paper or standard thermal receipt rolls depending on your local printer settings.',
    },
    {
      q: 'Is my business data secure?',
      a: 'Yes. BharatStock utilizes a secure multi-tenant architecture on MongoDB. Your inventory counts, client names, and sales ledgers are isolated and completely private to your login session.',
    },
  ];

  return (
    <div className="landing-shell">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
          BharatStock
        </div>
        
        {/* Navigation Links for Smooth Scrolling */}
        <div className="landing-header-links">
          <button className="link-btn" onClick={() => scrollToSection('features')}>Features</button>
          <button className="link-btn" onClick={() => scrollToSection('steps')}>How It Works</button>
          <button className="link-btn" onClick={() => scrollToSection('faq')}>FAQ</button>
        </div>

        <nav className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme Toggle Button */}
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            style={{
              padding: 0,
              fontSize: '16px',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'var(--bg-primary)',
              transition: 'var(--transition)'
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

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

        {/* Interactive 3D Mockup Preview Box */}
        <div className="landing-mockup-wrapper">
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            💡 Tip: Click items below to simulate restocking!
          </div>
          <div className="landing-mockup-card">
            <div className="mockup-header">
              <span className="mockup-dot red"></span>
              <span className="mockup-dot yellow"></span>
              <span className="mockup-dot green"></span>
              <span className="mockup-title">Active Stock Simulator</span>
            </div>
            <div className="mockup-body">
              {mockProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleRestockClick(p.id)}
                  className={`mockup-row interactive-row ${lastClickedId === p.id ? 'flash-active' : ''}`}
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s, transform 0.1s' }}
                >
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span className={`pill ${p.status}`}>{p.statusText}</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(p.price)}/{p.unit}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
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
      <section id="steps" className="landing-steps">
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
      <section id="faq" className="landing-faq">
        <h2 className="section-heading">Frequently Asked Questions</h2>
        <p className="section-subheading">Everything you need to know about BharatStock.</p>
        
        <div className="faq-container-accordion">
          {faqData.map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className={`faq-accordion-item ${isOpen ? 'open' : ''}`} onClick={() => toggleFaq(index)}>
                <div className="faq-question-bar">
                  <h4>{item.q}</h4>
                  <span className="faq-chevron-icon">{isOpen ? '−' : '+'}</span>
                </div>
                <div className="faq-answer-panel" style={{ maxHeight: isOpen ? '200px' : '0' }}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
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
