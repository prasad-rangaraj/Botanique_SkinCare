import axios from 'axios'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('botanique_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('botanique_token')
      localStorage.removeItem('botanique_user')
      if (!window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/login')) {
        // Let component handle the redirect
      }
    }
    return Promise.reject(error)
  }
)

export default api

