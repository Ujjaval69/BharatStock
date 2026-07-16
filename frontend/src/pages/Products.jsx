import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unit: 'pcs',
  costPrice: '',
  sellingPrice: '',
  stockQty: '',
  lowStockThreshold: '',
};

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [adjustDrafts, setAdjustDrafts] = useState({}); // productId -> delta string

  // Editing state
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await api.listProducts(token, params);
      setProducts(data);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateEdit = (field) => (e) => setEditForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createProduct(token, {
        ...form,
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice),
        stockQty: Number(form.stockQty) || 0,
        lowStockThreshold: form.lowStockThreshold === '' ? undefined : Number(form.lowStockThreshold),
      });
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      unit: product.unit || 'pcs',
      costPrice: product.costPrice ?? '',
      sellingPrice: product.sellingPrice ?? '',
      stockQty: product.stockQty ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.updateProduct(token, editingProduct._id, {
        ...editForm,
        costPrice: editForm.costPrice === '' ? 0 : Number(editForm.costPrice),
        sellingPrice: Number(editForm.sellingPrice),
        stockQty: Number(editForm.stockQty),
        lowStockThreshold: editForm.lowStockThreshold === '' ? undefined : Number(editForm.lowStockThreshold),
      });
      setShowEditModal(false);
      setEditingProduct(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdjust = async (productId) => {
    const raw = adjustDrafts[productId];
    const delta = Number(raw);
    if (!raw || Number.isNaN(delta) || delta === 0) return;
    try {
      await api.adjustStock(token, productId, delta);
      setAdjustDrafts((d) => ({ ...d, [productId]: '' }));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async (productId) => {
    if (!confirm('Remove this product from your active catalog?')) return;
    try {
      await api.deleteProduct(token, productId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uniqueCategories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'General')))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return (p.category || 'General') === selectedCategory;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Your catalog and stock on hand.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add product
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      <div style={{ display: 'flex', gap: 15, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <form className="toolbar" onSubmit={handleSearchSubmit} style={{ marginBottom: 0 }}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" type="submit">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }} htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              background: 'var(--paper-raised)',
              fontSize: 13,
            }}
          >
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th className="row-index">#</th>
              <th>Product</th>
              <th>Category</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th>Adjust</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length ? (
              filteredProducts.map((p, i) => (
                <tr key={p._id}>
                  <td className="row-index">{i + 1}</td>
                  <td>
                    <span className={`status-dot ${p.stockQty <= p.lowStockThreshold ? 'low' : 'ok'}`} />
                    <strong>{p.name}</strong>
                    {p.sku ? <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{p.sku}</div> : null}
                  </td>
                  <td>{p.category || 'General'}</td>
                  <td className="num">₹{p.sellingPrice}</td>
                  <td className="num">
                    {p.stockQty} {p.unit}
                    {p.stockQty === 0 ? (
                      <span className="pill cancelled" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>Out</span>
                    ) : p.stockQty <= p.lowStockThreshold ? (
                      <span className="pill pending" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>Low</span>
                    ) : (
                      <span className="pill fulfilled" style={{ marginLeft: 6, fontSize: 10, padding: '1px 5px' }}>OK</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        placeholder="±qty"
                        value={adjustDrafts[p._id] || ''}
                        onChange={(e) => setAdjustDrafts((d) => ({ ...d, [p._id]: e.target.value }))}
                        style={{
                          width: 70,
                          padding: '6px 8px',
                          border: '1px solid var(--line)',
                          borderRadius: 3,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                        }}
                      />
                      <button className="btn btn-ghost btn-sm" onClick={() => handleAdjust(p._id)}>
                        Apply
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(p)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(p._id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  No products found. Add your first one to start tracking stock.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal ? (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add product</h2>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" value={form.name} onChange={update('name')} required />
              </div>
              <div className="field">
                <label htmlFor="sku">SKU (optional)</label>
                <input id="sku" value={form.sku} onChange={update('sku')} />
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <input id="category" value={form.category} onChange={update('category')} placeholder="e.g. Grocery, Snacks, Dairy" />
              </div>
              <div className="field">
                <label htmlFor="unit">Unit</label>
                <input id="unit" value={form.unit} onChange={update('unit')} placeholder="pcs, kg, litre…" />
              </div>
              <div className="field">
                <label htmlFor="sellingPrice">Selling price (₹)</label>
                <input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={update('sellingPrice')}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="costPrice">Cost price (₹)</label>
                <input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={update('costPrice')}
                />
              </div>
              <div className="field">
                <label htmlFor="stockQty">Starting stock</label>
                <input id="stockQty" type="number" min="0" value={form.stockQty} onChange={update('stockQty')} />
              </div>
              <div className="field">
                <label htmlFor="lowStockThreshold">Low stock alert at</label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={update('lowStockThreshold')}
                  placeholder="5"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Add product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit product</h2>
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label htmlFor="edit-name">Name</label>
                <input id="edit-name" value={editForm.name} onChange={updateEdit('name')} required />
              </div>
              <div className="field">
                <label htmlFor="edit-sku">SKU</label>
                <input id="edit-sku" value={editForm.sku} onChange={updateEdit('sku')} />
              </div>
              <div className="field">
                <label htmlFor="edit-category">Category</label>
                <input id="edit-category" value={editForm.category} onChange={updateEdit('category')} />
              </div>
              <div className="field">
                <label htmlFor="edit-unit">Unit</label>
                <input id="edit-unit" value={editForm.unit} onChange={updateEdit('unit')} />
              </div>
              <div className="field">
                <label htmlFor="edit-sellingPrice">Selling price (₹)</label>
                <input
                  id="edit-sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.sellingPrice}
                  onChange={updateEdit('sellingPrice')}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="edit-costPrice">Cost price (₹)</label>
                <input
                  id="edit-costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.costPrice}
                  onChange={updateEdit('costPrice')}
                />
              </div>
              <div className="field">
                <label htmlFor="edit-stockQty">Current Stock</label>
                <input id="edit-stockQty" type="number" min="0" value={editForm.stockQty} onChange={updateEdit('stockQty')} />
              </div>
              <div className="field">
                <label htmlFor="edit-lowStockThreshold">Low stock alert at</label>
                <input
                  id="edit-lowStockThreshold"
                  type="number"
                  min="0"
                  value={editForm.lowStockThreshold}
                  onChange={updateEdit('lowStockThreshold')}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowEditModal(false); setEditingProduct(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
