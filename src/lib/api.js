const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let detail = 'Request failed'
    try { const data = await res.json(); detail = data.detail || JSON.stringify(data) } catch {}
    throw new Error(detail)
  }
  try {
    return await res.json()
  } catch {
    return null
  }
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  listAccounts: () => request('/admin/accounts'),
  toggleActive: (payload) => request('/admin/toggle-active', { method: 'POST', body: JSON.stringify(payload) }),
  sendMessage: (payload) => request('/messages', { method: 'POST', body: JSON.stringify(payload) }),
  listMessages: (userId, peerId) => request(`/messages?user_id=${encodeURIComponent(userId)}${peerId ? `&peer_id=${encodeURIComponent(peerId)}`: ''}`),
}

export default api
