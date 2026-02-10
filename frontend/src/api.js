const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || res.statusText || 'Request failed');
  return data;
}

export async function getProducts(includeDeleted = false) {
  const q = includeDeleted ? '?include_deleted=true' : '';
  return request(`/inventory/${q}`);
}

export async function getLowStock(threshold) {
  const q = threshold != null ? `?threshold=${threshold}` : '';
  return request(`/inventory/low-stock${q}`);
}

export async function addProduct(product_name, quantity, price = 0) {
  return request('/inventory/', {
    method: 'POST',
    body: JSON.stringify({
      product_name,
      quantity: Number(quantity),
      price: Number(price),
    }),
  });
}

export async function updateQuantity(product_id, quantity) {
  return request(`/inventory/${product_id}/quantity`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity: Number(quantity) }),
  });
}

export async function updateProduct(product_id, data) {
  return request(`/inventory/${product_id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function sellProduct(product_id, quantity) {
  return request(`/inventory/${product_id}/sell`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity: Number(quantity) }),
  });
}

export async function deleteProduct(product_id) {
  return request(`/inventory/${product_id}`, { method: 'DELETE' });
}
