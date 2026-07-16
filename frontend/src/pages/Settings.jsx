import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { business, user, updateBusiness } = useAuth();
  const [name, setName] = useState(business?.name || '');
  const [ownerName, setOwnerName] = useState(business?.ownerName || '');
  const [city, setCity] = useState(business?.city || '');
  const [gstin, setGstin] = useState(business?.gstin || '');
  const [lowStockThresholdDefault, setLowStockThresholdDefault] = useState(business?.lowStockThresholdDefault ?? 5);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isOwner = user?.role === 'owner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await updateBusiness({
        name,
        ownerName,
        city,
        gstin,
        lowStockThresholdDefault: Number(lowStockThresholdDefault) || 5,
      });
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyBusinessId = () => {
    navigator.clipboard.writeText(business?._id || business?.id || '');
    alert('Business ID copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your business ledger and stock defaults.</p>
        </div>
      </div>

      {success && (
        <div style={{
          background: 'var(--success-bg)',
          color: 'var(--success)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 20,
          borderLeft: '4px solid var(--success)'
        }}>
          {success}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="stat-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 12 }}>
          Ledger Access Details
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>
          Share this Business ID with your staff so they can log into this shop's dashboard.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--bg-primary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: 13,
            flex: 1
          }}>
            {business?._id || business?.id || 'N/A'}
          </div>
          <button className="btn btn-ghost" onClick={copyBusinessId} style={{ padding: '10px 16px' }}>
            Copy ID
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stat-card">
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>
          Shop Profile
        </h2>

        <div className="field">
          <label htmlFor="shopName">Shop Name</label>
          <input
            id="shopName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="ownerName">Owner Name</label>
          <input
            id="ownerName"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            disabled={!isOwner}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        <div className="field">
          <label htmlFor="gstin">GSTIN (optional)</label>
          <input
            id="gstin"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            placeholder="e.g. 09AAAAA1111A1Z1"
            disabled={!isOwner}
          />
        </div>

        <div className="field">
          <label htmlFor="defaultThreshold">Default Low Stock Threshold</label>
          <input
            id="defaultThreshold"
            type="number"
            min="0"
            value={lowStockThresholdDefault}
            onChange={(e) => setLowStockThresholdDefault(e.target.value)}
            disabled={!isOwner}
          />
        </div>

        {isOwner ? (
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 10 }}>
            {saving ? 'Saving changes…' : 'Save Settings'}
          </button>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--danger)', fontStyle: 'italic', marginTop: 16 }}>
            * Only the business owner can edit shop profiles or configuration.
          </p>
        )}
      </form>
    </div>
  );
}
