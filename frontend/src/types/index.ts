// ─── Shared Domain Types ───────────────────────────────────────────────────

export interface ProductImage {
  url: string
  isPrimary: boolean
  altText?: string
}

export interface Ingredient {
  name: string
  inci?: string
  purpose?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDesc?: string
  price: number
  size: string
  unit: string
  stock: number
  categoryId: string
  category?: Category
  images: ProductImage[]
  ingredients: Ingredient[]
  safetyNotes?: string
  patchTestNote?: string
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count?: { products: number }
}

export interface Address {
  id: string
  userId: string
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    size: string
    unit: string
    images: ProductImage[]
  }
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface Shipment {
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  shippedAt?: string
}

export interface Order {
  id: string
  orderRef: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  deliveryCharge: number
  total: number
  items: OrderItem[]
  address: Address
  shipment?: Shipment
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ReturnRequest {
  id: string
  orderId: string
  order: Pick<Order, 'orderRef' | 'total' | 'createdAt'>
  type: 'RETURN' | 'REFUND' | 'REPLACEMENT'
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  adminNote?: string
  createdAt: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  order: number
}

export interface SiteSettings {
  announcementText?: string
  announcementEnabled?: boolean
  supportEmail?: string
  supportPhone?: string
  instagramHandle?: string
}

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  createdAt: string
  _count?: { orders: number }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
