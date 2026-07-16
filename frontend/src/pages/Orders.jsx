import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function formatINR(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function Orders() {
  const { token, business } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Order fields
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState(''); // fallback name for walk-in
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [lines, setLines] = useState([{ productId: '', qty: 1 }]);

  // Details Modal fields
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [orderData, productData, customerData] = await Promise.all([
        api.listOrders(token),
        api.listProducts(token),
        api.listCustomers(token),
      ]);
      setOrders(orderData);
      setProducts(productData);
      setCustomers(customerData);
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

  const addLine = () => setLines((l) => [...l, { productId: '', qty: 1 }]);
  const removeLine = (idx) => setLines((l) => l.filter((_, i) => i !== idx));
  const updateLine = (idx, field, value) =>
    setLines((l) => l.map((line, i) => (i === idx ? { ...line, [field]: value } : line)));

  const resetForm = () => {
    setCustomerId('');
    setCustomerName('');
    setIsWalkIn(true);
    setLines([{ productId: '', qty: 1 }]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const items = lines
        .filter((l) => l.productId && Number(l.qty) > 0)
        .map((l) => ({ productId: l.productId, qty: Number(l.qty) }));

      if (items.length === 0) {
        throw new Error('Add at least one product to the order');
      }

      // Client-side stock check for immediate feedback
      for (const line of items) {
        const prod = products.find(p => p._id === line.productId);
        if (prod && line.qty > prod.stockQty) {
          throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stockQty} ${prod.unit} available.`);
        }
      }

      const payload = {
        items,
        customerId: isWalkIn ? undefined : (customerId || undefined),
        customerName: isWalkIn ? (customerName || 'Walk-in') : undefined,
      };

      await api.createOrder(token, payload);
      setShowModal(false);
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(token, orderId, status);
      // Update selected order details view if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const estimatedTotal = lines.reduce((sum, l) => {
    const product = products.find((p) => p._id === l.productId);
    if (!product) return sum;
    return sum + product.sellingPrice * (Number(l.qty) || 0);
  }, 0);

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to print invoices.');
      return;
    }
    const itemsHtml = order.items.map(it => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${it.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${it.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${it.unitPrice.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(it.qty * it.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = order.totalAmount / (business?.gstin ? 1.18 : 1);
    const gst = order.totalAmount - subtotal;
    const cgst = gst / 2;
    const sgst = gst / 2;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e2a3a; padding: 30px; max-width: 650px; margin: 0 auto; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px dashed #ddd3ba; padding-bottom: 18px; margin-bottom: 20px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px; color: #56606f; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th { border-bottom: 2px solid #1e2a3a; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; color: #56606f; letter-spacing: 0.05em; }
            .totals { text-align: right; font-size: 14px; line-height: 1.8; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; border-top: 1px dashed #ddd3ba; padding-top: 20px; color: #56606f; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0 0 5px 0; font-family: Georgia, serif; font-size: 26px;">${business?.name || 'BharatStock'}</h1>
            <div style="font-size: 14px; color: #56606f;">${business?.city || ''}</div>
            ${business?.gstin ? `<div style="font-size: 13px; font-weight: bold; margin-top: 6px; font-family: monospace;">GSTIN: ${business.gstin}</div>` : ''}
            <h2 style="margin: 15px 0 0 0; font-size: 18px; letter-spacing: 0.1em; color: #1e2a3a;">TAX INVOICE</h2>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br/>
              ${order.customerNameSnapshot}
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${order.orderNumber}<br/>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} ${new Date(order.createdAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}<br/>
              <strong>Status:</strong> ${order.status.toUpperCase()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th style="text-align: right; width: 60px;">Qty</th>
                <th style="text-align: right; width: 100px;">Rate</th>
                <th style="text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            ${business?.gstin ? `
              Subtotal (Tax Excl.): ₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
              CGST (9%): ₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
              SGST (9%): ₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
            ` : ''}
            <span style="font-size: 18px; font-weight: bold; color: #1e2a3a;">Total Payable: ₹${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="footer">
            Thank you for shopping at ${business?.name || 'BharatStock'}!<br/>
            <span style="font-size: 10px; color: #a6adba;">System generated tax invoice via BharatStock</span>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Every sale, and what it did to your stock.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New order
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : (
        <table className="ledger">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="num">Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.map((o) => (
                <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--marigold-deep)', fontWeight: 'bold' }}>
                    {o.orderNumber}
                  </td>
                  <td>{o.customerNameSnapshot}</td>
                  <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    {o.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                  </td>
                  <td className="num">{formatINR(o.totalAmount)}</td>
                  <td>
                    <span className={`pill ${o.status}`}>{o.status}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {o.status === 'pending' ? (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(o._id, 'fulfilled')}>
                            Fulfill
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(o._id, 'cancelled')}>
                            Cancel
                          </button>
                        </>
                      ) : null}
                      <button className="btn btn-ghost btn-sm" onClick={() => handlePrint(o)}>
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-state">
                  No orders yet. Create one to see stock move in real time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* New Order Modal */}
      {showModal ? (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2>New order</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: 15, marginBottom: 12 }}>
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={isWalkIn}
                    onChange={() => setIsWalkIn(true)}
                  />
                  Walk-in Guest
                </label>
                <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={!isWalkIn}
                    onChange={() => setIsWalkIn(false)}
                  />
                  Registered Customer
                </label>
              </div>

              {isWalkIn ? (
                <div className="field">
                  <label htmlFor="customerName">Guest Customer Name</label>
                  <input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                  />
                </div>
              ) : (
                <div className="field">
                  <label htmlFor="customerId">Select Customer</label>
                  <select
                    id="customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Select a customer…</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {lines.map((line, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
                  <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Product</label>
                    <select value={line.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)}>
                      <option value="">Select…</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id} disabled={p.stockQty === 0}>
                          {p.name} ({p.stockQty} {p.unit} in stock) — ₹{p.sellingPrice}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ width: 80, marginBottom: 0 }}>
                    <label>Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.qty}
                      onChange={(e) => updateLine(idx, 'qty', e.target.value)}
                    />
                  </div>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeLine(idx)}
                      style={{ marginBottom: 1 }}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              ))}

              <button type="button" className="btn btn-ghost btn-sm" onClick={addLine} style={{ marginTop: 8 }}>
                + Add another item
              </button>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span>Estimated total</span>
                <strong>{formatINR(estimatedTotal)}</strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Placing…' : 'Place order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Order Details Modal */}
      {selectedOrder ? (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Order {selectedOrder.orderNumber}</span>
              <span className={`pill ${selectedOrder.status}`} style={{ fontSize: 12 }}>{selectedOrder.status}</span>
            </h2>

            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
              <div><strong>Billed To:</strong> {selectedOrder.customerNameSnapshot}</div>
              <div><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</div>
            </div>

            <table className="ledger" style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th className="num">Qty</th>
                  <th className="num">Rate</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td className="num">{item.qty}</td>
                    <td className="num">₹{item.unitPrice}</td>
                    <td className="num">₹{item.qty * item.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              borderTop: '1px solid var(--line)',
              paddingTop: 12,
              marginBottom: 20
            }}>
              {business?.gstin ? (
                <>
                  <div>Subtotal: {formatINR(selectedOrder.totalAmount / 1.18)}</div>
                  <div>CGST (9%): {formatINR((selectedOrder.totalAmount - (selectedOrder.totalAmount / 1.18)) / 2)}</div>
                  <div>SGST (9%): {formatINR((selectedOrder.totalAmount - (selectedOrder.totalAmount / 1.18)) / 2)}</div>
                </>
              ) : null}
              <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--ink)', marginTop: 4 }}>
                Total: {formatINR(selectedOrder.totalAmount)}
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <div>
                {selectedOrder.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleStatus(selectedOrder._id, 'fulfilled')}>
                      Fulfill Order
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatus(selectedOrder._id, 'cancelled')}>
                      Cancel Order
                    </button>
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost" onClick={() => handlePrint(selectedOrder)}>
                  Print Invoice
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
