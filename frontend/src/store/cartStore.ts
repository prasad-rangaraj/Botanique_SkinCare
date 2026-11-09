import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    size: string
    unit: string
    stock: number
    images: { url: string; isPrimary: boolean }[]
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  fetchCart: () => Promise<void>
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  openCart: () => void
  closeCart: () => void
  get subtotal(): number
  get itemCount(): number
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  get subtotal() {
    return get().items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  },

  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  fetchCart: async () => {
    try {
      const token = localStorage.getItem('botanique_token')
      if (!token) return
      set({ isLoading: true })
      const { data } = await api.get('/cart')
      set({ items: data.cart?.items || [] })
    } catch {
      set({ items: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity })
    set({ items: data.cart?.items || [], isOpen: true })
  },

  updateItem: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity })
    set({ items: data.cart?.items || [] })
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}`)
    set({ items: data.cart?.items || [] })
  },

  clearCart: async () => {
    await api.delete('/cart/clear')
    set({ items: [] })
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}))

