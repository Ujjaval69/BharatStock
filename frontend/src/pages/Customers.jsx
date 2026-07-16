import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const emptyForm = {
  name: '',
  phone: '',
  address: '',
};

export default function Customers() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listCustomers(token);
      setCustomers(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createCustomer(token, form);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Your directory of regular clients and accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Customer
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search customers by name/phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ minWidth: 300 }}
        />
      </div>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th className="row-index">#</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Billing Address</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length ? (
              filteredCustomers.map((c, i) => (
                <tr key={c._id}>
                  <td className="row-index">{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{c.phone || '—'}</td>
                  <td>{c.address || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-state">
                  No customers found. Create a new profile to track custom orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal ? (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Customer</h2>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label htmlFor="c-name">Customer Name</label>
                <input id="c-name" value={form.name} onChange={update('name')} required />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Phone Number</label>
                <input id="c-phone" value={form.phone} onChange={update('phone')} placeholder="e.g. 9876543210" />
              </div>
              <div className="field">
                <label htmlFor="c-address">Address</label>
                <input id="c-address" value={form.address} onChange={update('address')} placeholder="e.g. Sector-4, Meerut" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
