import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        const { token, user } = data
        localStorage.setItem('botanique_token', token)
        set({ user, token, isAuthenticated: true, isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' })
      },

      register: async (registerData) => {
        const { data } = await api.post('/auth/register', registerData)
        const { token, user } = data
        localStorage.setItem('botanique_token', token)
        set({ user, token, isAuthenticated: true, isAdmin: false })
      },

      logout: () => {
        localStorage.removeItem('botanique_token')
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false })
      },

      setUser: (user) => {
        set({ user, isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' })
      },
    }),
    {
      name: 'botanique_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, isAdmin: state.isAdmin }),
    }
  )
)

