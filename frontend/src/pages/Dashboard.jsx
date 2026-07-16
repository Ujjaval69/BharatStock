import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function formatINR(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function Dashboard() {
  const { token, business } = useAuth();
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Active chart hover point index
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [summaryData, lowStockData] = await Promise.all([api.salesSummary(token), api.lowStock(token)]);
        if (!cancelled) {
          setSummary(summaryData);
          setLowStock(lowStockData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Generate continuous timeline for last 30 days
  const getTimelineData = () => {
    if (!summary?.salesByDay) return [];
    const data = [];
    const now = new Date();
    // Start 29 days ago up to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const match = summary.salesByDay.find((s) => s._id === dateStr);
      data.push({
        date: dateStr,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orderCount : 0,
      });
    }
    return data;
  };

  const timelineData = getTimelineData();
  const maxRevenue = Math.max(...timelineData.map((d) => d.revenue), 1000);

  // SVG Chart Geometry
  const width = 680;
  const height = 220;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = timelineData.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / 29;
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.length
    ? `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(' ')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
        paddingTop + chartHeight
      } Z`
    : '';

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back to {business?.name || 'your shop'}. Here is your sales activity.</p>
        </div>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {loading ? (
        <p className="empty-state">Loading dashboard summary…</p>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat-card" style={{ position: 'relative' }}>
              <div className="stat-label">30-Day Revenue</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{formatINR(summary?.revenue || 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Orders Placed</div>
              <div className="stat-value">{summary?.orderCount ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Restock Alerts</div>
              <div className="stat-value" style={{ color: lowStock.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                {lowStock.length}
              </div>
            </div>
          </div>

          {/* Visual SVG Sales Trend Chart */}
          <div className="stat-card" style={{ padding: '24px 20px 20px', marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Sales Trend</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>Daily revenue tracking for the last 30 days.</p>
            </div>

            <div style={{ position: 'relative', overflow: 'visible' }}>
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = paddingTop + chartHeight * ratio;
                  const value = Math.round(maxRevenue * (1 - ratio));
                  return (
                    <g key={index}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={width - paddingRight}
                        y2={y}
                        stroke="var(--border-color)"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        fill="var(--text-secondary)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                        textAnchor="end"
                      >
                        ₹{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis labels (only show 5 labels to prevent clutter) */}
                {points.filter((_, i) => i % 7 === 0 || i === 29).map((p, index) => (
                  <text
                    key={index}
                    x={p.x}
                    y={paddingTop + chartHeight + 16}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                ))}

                {/* Main Area under line */}
                {points.length > 0 && (
                  <path d={areaD} fill="url(#chartGradient)" />
                )}

                {/* Main Trend Line */}
                {points.length > 0 && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Active Hover point circle */}
                {hoveredIndex !== null && (
                  <circle
                    cx={points[hoveredIndex].x}
                    cy={points[hoveredIndex].y}
                    r="6"
                    fill="var(--text-primary)"
                    stroke="var(--bg-secondary)"
                    strokeWidth="2"
                  />
                )}

                {/* Invisible hover capture slots */}
                {points.map((p, index) => {
                  const slotWidth = chartWidth / 29;
                  return (
                    <rect
                      key={index}
                      x={p.x - slotWidth / 2}
                      y={paddingTop}
                      width={slotWidth}
                      height={chartHeight}
                      fill="transparent"
                      cursor="crosshair"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Floating precision HTML Tooltip card */}
              {hoveredIndex !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${(points[hoveredIndex].x / width) * 100}%`,
                    top: `${(points[hoveredIndex].y / height) * 100 - 15}%`,
                    transform: 'translate(-50%, -100%)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    pointerEvents: 'none',
                    zIndex: 10,
                    fontSize: '12px',
                    lineHeight: '1.4',
                    whiteSpace: 'nowrap',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{points[hoveredIndex].label}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: '700', marginTop: 2 }}>{formatINR(points[hoveredIndex].revenue)}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{points[hoveredIndex].orders} orders</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Top Products Card */}
            <div className="stat-card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 0, marginBottom: 16 }}>
                Top-Selling Products
              </h2>
              <table className="ledger">
                <thead>
                  <tr>
                    <th className="row-index">#</th>
                    <th>Product</th>
                    <th className="num">Sold</th>
                    <th className="num">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.topProducts?.length ? (
                    summary.topProducts.map((p, i) => (
                      <tr key={p._id || i}>
                        <td className="row-index">{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td className="num">{p.unitsSold}</td>
                        <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(p.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        No transactions registered in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Needs Restocking Card */}
            <div className="stat-card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 0, marginBottom: 16 }}>
                Needs Restocking
              </h2>
              <table className="ledger">
                <thead>
                  <tr>
                    <th className="row-index">#</th>
                    <th>Product</th>
                    <th className="num">Stock</th>
                    <th className="num">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length ? (
                    lowStock.map((p, i) => (
                      <tr key={p._id}>
                        <td className="row-index">{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>
                          <span className="status-dot low" />
                          {p.name}
                        </td>
                        <td className="num" style={{ color: p.stockQty === 0 ? 'var(--rust)' : 'inherit', fontWeight: p.stockQty === 0 ? 'bold' : 'normal' }}>
                          {p.stockQty} {p.unit}
                        </td>
                        <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>{p.lowStockThreshold}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        All products are well stocked.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
