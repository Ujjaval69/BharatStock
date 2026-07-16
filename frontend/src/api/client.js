const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  registerBusiness: (payload) => request('/auth/register-business', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateBusiness: (token, payload) => request('/auth/business', { method: 'PUT', body: payload, token }),

  listProducts: (token, params = '') => request(`/products${params}`, { token }),
  createProduct: (token, payload) => request('/products', { method: 'POST', body: payload, token }),
  updateProduct: (token, id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload, token }),
  adjustStock: (token, id, delta) => request(`/products/${id}/adjust-stock`, { method: 'PATCH', body: { delta }, token }),
  deleteProduct: (token, id) => request(`/products/${id}`, { method: 'DELETE', token }),

  listOrders: (token, params = '') => request(`/orders${params}`, { token }),
  createOrder: (token, payload) => request('/orders', { method: 'POST', body: payload, token }),
  updateOrderStatus: (token, id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),

  listCustomers: (token) => request('/customers', { token }),
  createCustomer: (token, payload) => request('/customers', { method: 'POST', body: payload, token }),

  salesSummary: (token) => request('/reports/summary', { token }),
  lowStock: (token) => request('/reports/low-stock', { token }),
};
