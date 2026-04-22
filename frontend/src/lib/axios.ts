import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 — only redirect if NOT on auth pages
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register'

      // ── Only redirect if user is on a protected page ──────────────────────
      // If they're already on login/register, DON'T redirect —
      // just let the error bubble up to useAuth so the UI can show it
      if (!isAuthRoute) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)