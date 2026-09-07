const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5233/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ideas_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/profile', { method: 'GET' }),

  // Products CRUD (Father resource)
  getProducts: (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/products${queryString}`, { method: 'GET' });
  },
  getProductById: (id) => request(`/products/${id}`, { method: 'GET' }),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Sales CRUD (Child related resource)
  getSales: (status = '', productId = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (productId) params.append('productId', productId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/sales${queryString}`, { method: 'GET' });
  },
  getSaleById: (id) => request(`/sales/${id}`, { method: 'GET' }),
  createSale: (data) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
  updateSale: (id, data) => request(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSale: (id) => request(`/sales/${id}`, { method: 'DELETE' }),

  // Dashboard Metrics
  getDashboardMetrics: () => request('/dashboard/metrics', { method: 'GET' })
};
