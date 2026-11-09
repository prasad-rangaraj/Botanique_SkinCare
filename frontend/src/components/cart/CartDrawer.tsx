import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

const CartDrawer: React.FC = () => {
  const { items, isOpen, isLoading, closeCart, updateItem, removeItem, subtotal } =
    useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const primaryImage = (images: { url: string; isPrimary: boolean }[]) =>
    images?.find((img) => img.isPrimary)?.url || images?.[0]?.url || ''

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Shopping cart"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl
                   flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-forest" />
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Your Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-sage">
                  ({items.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-beige rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-20 h-20 bg-beige rounded-full flex items-center justify-center mb-5">
                <ShoppingBag size={32} className="text-sage" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-sage mb-6">
                Discover our botanical skincare collection and find your perfect ritual.
              </p>
              <button onClick={closeCart} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-beige">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-beige shrink-0">
                    {primaryImage(item.product.images) ? (
                      <img
                        src={primaryImage(item.product.images)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BotanicalPlaceholder size={32} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-medium text-charcoal leading-snug mb-0.5 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-sage mb-2">
                      {item.product.size} {item.product.unit}
                    </p>
                    <p className="text-sm font-semibold text-forest">
                      ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-sage">
                      ₹{Number(item.product.price).toLocaleString('en-IN')} each
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-sage hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-beige rounded-full px-2 py-1">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        className="p-0.5 text-charcoal hover:text-forest transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          item.quantity < item.product.stock
                            ? updateItem(item.id, item.quantity + 1)
                            : undefined
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="p-0.5 text-charcoal hover:text-forest transition-colors disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-beige px-6 py-5 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal font-medium">Subtotal</span>
              <span className="font-serif text-lg font-semibold text-forest">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-sage">
              Shipping calculated at checkout. Orders above ₹999 qualify for free shipping.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={closeCart}
              className="btn-secondary w-full justify-center"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// Minimal inline SVG placeholder for products without images
const BotanicalPlaceholder: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-sage/50"
  >
    <path
      d="M20 8C20 8 12 14 12 22C12 26.4183 15.5817 30 20 30C24.4183 30 28 26.4183 28 22C28 14 20 8 20 8Z"
      fill="currentColor"
    />
    <path d="M20 20L20 36" stroke="#A8B8A0" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default CartDrawer
