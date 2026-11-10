import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isStaff: boolean
  isStaffOrAdmin: boolean
  login: (email: string, password: string) => Promise<User>
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
      isStaff: false,
      isStaffOrAdmin: false,

      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password })
          const { token, user } = data
          localStorage.setItem('botanique_token', token)
          const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          const isStaff = user.role === 'STAFF'
          const isStaffOrAdmin = isAdmin || isStaff
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin,
            isStaff,
            isStaffOrAdmin,
          })
          return user
        } catch (err: any) {
          // If network error / server offline, support instant 3-role demo login
          const isNetworkError =
            !err.response ||
            err.code === 'ERR_NETWORK' ||
            err.code === 'ECONNABORTED' ||
            err.message?.includes('Network Error')

          if (isNetworkError) {
            const clean = email.trim().toLowerCase()
            if (clean === 'admin@botanique.in') {
              const demoAdmin: User = {
                id: 'usr-admin-demo',
                email: 'admin@botanique.in',
                firstName: 'Founder',
                lastName: '& Owner',
                role: 'ADMIN',
              }
              const demoToken = 'mock_jwt_token_admin_demo'
              localStorage.setItem('botanique_token', demoToken)
              set({
                user: demoAdmin,
                token: demoToken,
                isAuthenticated: true,
                isAdmin: true,
                isStaff: false,
                isStaffOrAdmin: true,
              })
              return demoAdmin
            }
            if (clean === 'staff@botanique.in') {
              const demoStaff: User = {
                id: 'usr-staff-demo',
                email: 'staff@botanique.in',
                firstName: 'Meera',
                lastName: 'Nair',
                role: 'STAFF',
              }
              const demoToken = 'mock_jwt_token_staff_demo'
              localStorage.setItem('botanique_token', demoToken)
              set({
                user: demoStaff,
                token: demoToken,
                isAuthenticated: true,
                isAdmin: false,
                isStaff: true,
                isStaffOrAdmin: true,
              })
              return demoStaff
            }
            if (clean === 'customer@botanique.in' || clean.includes('@')) {
              const demoCustomer: User = {
                id: 'usr-customer-demo',
                email: clean || 'customer@botanique.in',
                firstName: 'Priya',
                lastName: 'Sharma',
                role: 'CUSTOMER',
              }
              const demoToken = 'mock_jwt_token_customer_demo'
              localStorage.setItem('botanique_token', demoToken)
              set({
                user: demoCustomer,
                token: demoToken,
                isAuthenticated: true,
                isAdmin: false,
                isStaff: false,
                isStaffOrAdmin: false,
              })
              return demoCustomer
            }
          }
          throw err
        }
      },

      register: async (registerData) => {
        try {
          const { data } = await api.post('/auth/register', registerData)
          const { token, user } = data
          localStorage.setItem('botanique_token', token)
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: false,
            isStaff: false,
            isStaffOrAdmin: false,
          })
        } catch (err: any) {
          const isNetworkError =
            !err.response ||
            err.code === 'ERR_NETWORK' ||
            err.message?.includes('Network Error')

          if (isNetworkError) {
            const demoUser: User = {
              id: 'usr-new-reg',
              email: registerData.email,
              firstName: registerData.firstName,
              lastName: registerData.lastName,
              role: 'CUSTOMER',
            }
            const demoToken = 'mock_jwt_token_registered'
            localStorage.setItem('botanique_token', demoToken)
            set({
              user: demoUser,
              token: demoToken,
              isAuthenticated: true,
              isAdmin: false,
              isStaff: false,
              isStaffOrAdmin: false,
            })
            return
          }
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('botanique_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isStaff: false,
          isStaffOrAdmin: false,
        })
      },

      setUser: (user) => {
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
        const isStaff = user.role === 'STAFF'
        const isStaffOrAdmin = isAdmin || isStaff
        set({
          user,
          isAdmin,
          isStaff,
          isStaffOrAdmin,
        })
      },
    }),
    {
      name: 'botanique_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isStaff: state.isStaff,
        isStaffOrAdmin: state.isStaffOrAdmin,
      }),
    }
  )
)

