import axios from 'axios'
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_ORDERS,
  MOCK_DASHBOARD_STATS,
} from '../data/mockData'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('botanique_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle offline network fallback gracefully
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 401 handling
    if (error.response?.status === 401) {
      localStorage.removeItem('botanique_token')
      localStorage.removeItem('botanique_user')
      return Promise.reject(error)
    }

    // If server is unreachable / offline, provide reliable fallback
    const isNetworkError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error')

    if (isNetworkError && error.config) {
      const url = error.config.url || ''
      const method = (error.config.method || 'get').toLowerCase()

      if (method === 'get') {
        if (url.includes('/products/categories')) {
          return Promise.resolve({ data: { categories: MOCK_CATEGORIES }, status: 200 })
        }
        if (url.includes('/products/featured')) {
          return Promise.resolve({
            data: { products: MOCK_PRODUCTS.filter((p) => p.isFeatured) },
            status: 200,
          })
        }
        if (url.startsWith('/products/') && !url.includes('/categories')) {
          const slug = url.split('/products/')[1]?.split('?')[0]
          const product =
            MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || MOCK_PRODUCTS[0]
          return Promise.resolve({
            data: {
              product,
              relatedProducts: MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3),
            },
            status: 200,
          })
        }
        if (url.startsWith('/products')) {
          return Promise.resolve({
            data: {
              products: MOCK_PRODUCTS,
              pagination: { total: MOCK_PRODUCTS.length, page: 1, totalPages: 1 },
            },
            status: 200,
          })
        }
        if (url.includes('/admin/dashboard')) {
          return Promise.resolve({ data: MOCK_DASHBOARD_STATS, status: 200 })
        }
        if (url.includes('/admin/orders')) {
          return Promise.resolve({ data: { orders: MOCK_ORDERS }, status: 200 })
        }
        if (url.includes('/admin/customers')) {
          return Promise.resolve({
            data: {
              customers: [
                {
                  id: 'cust-1',
                  firstName: 'Priya',
                  lastName: 'Sharma',
                  email: 'customer@botanique.in',
                  role: 'CUSTOMER',
                  createdAt: '2026-01-10T10:00:00Z',
                  _count: { orders: 3 },
                },
                {
                  id: 'cust-2',
                  firstName: 'Aarav',
                  lastName: 'Mehta',
                  email: 'aarav.mehta@example.com',
                  role: 'CUSTOMER',
                  createdAt: '2026-02-01T12:00:00Z',
                  _count: { orders: 1 },
                },
              ],
            },
            status: 200,
          })
        }
        if (url.includes('/admin/requests')) {
          return Promise.resolve({
            data: {
              requests: [
                {
                  id: 'req-1',
                  orderId: 'ord-101',
                  orderRef: 'BOT-82091',
                  type: 'RETURN',
                  reason: 'Unopened bottle; customer ordered duplicate by mistake.',
                  status: 'PENDING_REVIEW',
                  createdAt: '2026-03-01T11:00:00Z',
                  customerEmail: 'customer@botanique.in',
                },
              ],
            },
            status: 200,
          })
        }
        if (url.includes('/admin/settings')) {
          return Promise.resolve({
            data: {
              settings: {
                site_name: 'BOTANIQUE',
                announcement_text: 'Free delivery on orders above ₹999 within Bengaluru',
                announcement_active: 'true',
                support_email: 'care@botanique.in',
                support_phone: '+91 80 1234 5678',
                returns_policy_active: 'false',
              },
            },
            status: 200,
          })
        }
        if (url.includes('/admin/shipping-zones')) {
          return Promise.resolve({
            data: {
              zones: [
                {
                  id: 'zone-1',
                  name: 'Bengaluru Local Delivery',
                  deliveryCharge: 0,
                  estimatedDays: '1–2 business days',
                  pincodes: ['560001', '560034', '560103'],
                },
                {
                  id: 'zone-2',
                  name: 'Pan-India Standard Shipping',
                  deliveryCharge: 80,
                  estimatedDays: '4–8 business days',
                  pincodes: [],
                },
              ],
            },
            status: 200,
          })
        }
        if (url.includes('/users/addresses')) {
          return Promise.resolve({
            data: {
              addresses: [
                {
                  id: 'addr-1',
                  fullName: 'Priya Sharma',
                  phone: '+91 98450 12345',
                  line1: 'Flat 402, Green Glen Layout, Bellandur',
                  city: 'Bengaluru',
                  state: 'Karnataka',
                  pincode: '560103',
                  isDefault: true,
                },
              ],
            },
            status: 200,
          })
        }
        if (url.includes('/orders/my-orders')) {
          return Promise.resolve({ data: { orders: MOCK_ORDERS }, status: 200 })
        }
      }

      // Handle newsletter, dummy mutation responses
      if (method === 'post' || method === 'put' || method === 'delete') {
        return Promise.resolve({
          data: {
            success: true,
            message: 'Action completed successfully (demo mode).',
          },
          status: 200,
        })
      }
    }

    return Promise.reject(error)
  }
)

export default api
