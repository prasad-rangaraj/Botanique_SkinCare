import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AnnouncementBar from './components/layout/AnnouncementBar'
import CartDrawer from './components/cart/CartDrawer'
import ChatbotWidget from './components/chatbot/ChatbotWidget'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import OurStoryPage from './pages/OurStoryPage'
import SkincareGuidePage from './pages/SkincareGuidePage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AccountPage from './pages/account/AccountPage'
import OrdersPage from './pages/account/OrdersPage'
import OrderDetailPage from './pages/account/OrderDetailPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminRequestsPage from './pages/admin/AdminRequestsPage'
import { useCartStore } from './store/cartStore'
import { useAuthStore } from './store/authStore'

function App() {
  const location = useLocation()
  const { fetchCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-cream">
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route path="/skincare-guide" element={<SkincareGuidePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

        {/* Protected customer routes */}
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
        <Route path="/admin/requests" element={<AdminRoute><AdminRequestsPage /></AdminRoute>} />
      </Routes>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatbotWidget />}
    </div>
  )
}

export default App

