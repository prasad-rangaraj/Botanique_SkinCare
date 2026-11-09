import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'

interface ProductCardProps {
  product: Product
  className?: string
}

// Botanical SVG placeholder
export const BotanicalSVGPlaceholder: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="200" height="200" fill="#E9E0D1" />
    <circle cx="100" cy="80" r="30" fill="#A8B8A0" opacity="0.4" />
    <path
      d="M100 50 C100 50 70 70 70 95 C70 111.569 83.4315 125 100 125 C116.569 125 130 111.569 130 95 C130 70 100 50 100 50Z"
      fill="#A8B8A0"
      opacity="0.6"
    />
    <path
      d="M100 90 L100 160"
      stroke="#254B3B"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.4"
    />
    <path
      d="M100 120 C100 120 85 110 78 100"
      stroke="#254B3B"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M100 130 C100 130 115 120 122 110"
      stroke="#254B3B"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.3"
    />
    <text
      x="100"
      y="178"
      textAnchor="middle"
      fontSize="10"
      fill="#A8B8A0"
      fontFamily="serif"
      opacity="0.8"
    >
      BOTANIQUE
    </text>
  </svg>
)

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addToCart } = useCartStore()

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    null

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0 || addingToCart) return
    setAddingToCart(true)
    try {
      await addToCart(product.id)
    } catch {
      // silently fail — cart drawer will show if logged out
    } finally {
      setTimeout(() => setAddingToCart(false), 800)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted((prev) => !prev)
  }

  return (
    <div className={`product-card ${className}`}>
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-beige relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <BotanicalSVGPlaceholder className="w-full h-full" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.stock === 0 && (
              <span className="badge bg-charcoal/80 text-cream text-xs">
                Out of Stock
              </span>
            )}
            {product.isFeatured && product.stock > 0 && (
              <span className="badge bg-forest/90 text-cream text-xs">
                Featured
              </span>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-charcoal
                         text-xs font-medium px-4 py-2 rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Eye size={13} />
              Quick View
            </Link>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-sage font-medium uppercase tracking-wider mb-1">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif text-base font-medium text-charcoal leading-snug mb-2 hover:text-forest transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + Size */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-semibold text-forest text-base">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-sage">
            / {product.size} {product.unit}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium
                        transition-all duration-200 ${
                          product.stock === 0
                            ? 'bg-beige text-sage cursor-not-allowed'
                            : addingToCart
                            ? 'bg-sage text-cream cursor-wait'
                            : 'bg-forest text-cream hover:bg-opacity-90'
                        }`}
          >
            <ShoppingBag size={13} />
            {product.stock === 0
              ? 'Out of Stock'
              : addingToCart
              ? 'Adding…'
              : 'Add to Cart'}
          </button>

          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="p-2.5 border border-beige rounded-full hover:border-forest transition-colors"
          >
            <Heart
              size={15}
              className={
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-sage'
              }
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
