import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Heart,
  ShoppingBag,
  ShieldAlert,
  Leaf,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import api from '../lib/api'
import { Product } from '../types'
import { useCartStore } from '../store/cartStore'
import { BotanicalSVGPlaceholder } from '../components/product/ProductCard'
import ProductCard from '../components/product/ProductCard'

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()

  const [quantity, setQuantity] = useState<number>(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [addedMessage, setAddedMessage] = useState<boolean>(false)

  const {
    data,
    isLoading,
    error,
  } = useQuery<{ product: Product; related: Product[] }>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`)
      return res.data
    },
    enabled: !!slug,
  })

  const product = data?.product
  const related = data?.related || []

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-beige/60 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-beige/60 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-beige/60 rounded animate-pulse" />
            <div className="h-6 w-24 bg-beige/60 rounded animate-pulse" />
            <div className="h-32 bg-beige/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-container py-20 text-center max-w-md mx-auto">
        <AlertCircle size={36} className="mx-auto text-forest mb-3" />
        <h2 className="font-serif text-2xl font-medium text-charcoal mb-2">
          Product Not Found
        </h2>
        <p className="text-xs text-charcoal/70 mb-6">
          The requested formulation could not be found or has not been published yet.
        </p>
        <Link to="/shop" className="btn-primary text-xs">
          Return to Shop
        </Link>
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (product.stock === 0 || isAdding) return
    setIsAdding(true)
    try {
      await addToCart(product.id, quantity)
      setAddedMessage(true)
      setTimeout(() => setAddedMessage(false), 2500)
    } catch {
      // handled in store
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (product.stock === 0) return
    try {
      await addToCart(product.id, quantity)
      navigate('/checkout')
    } catch {
      navigate('/checkout')
    }
  }

  const images = product.images && product.images.length > 0 ? product.images : []
  const currentImage = images[selectedImageIndex]?.url

  // Check ingredient characteristics for brand transparency tags
  const ingredientNames = (product.ingredients || []).map((i) => i.name.toLowerCase())
  const hasBeeswax = ingredientNames.some((n) => n.includes('beeswax'))
  const hasPreservative = ingredientNames.some((n) => n.includes('preservative'))

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-charcoal/60 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-forest">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-forest">
            Shop
          </Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-forest">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-charcoal font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Main Product Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="aspect-square bg-beige rounded-2xl overflow-hidden border border-beige relative shadow-sm">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BotanicalSVGPlaceholder className="w-full h-full" />
              )}

              {/* Status badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.stock === 0 ? (
                  <span className="badge bg-charcoal text-cream text-xs">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="badge bg-amber-700 text-cream text-xs">
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="badge bg-forest text-cream text-xs">
                    In Stock
                  </span>
                )}
                {product.isFeatured && (
                  <span className="badge bg-sage text-charcoal font-medium text-xs">
                    Curated Ritual
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector if multiple images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-forest scale-95' : 'border-beige'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-medium leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-serif text-2xl font-semibold text-forest">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-charcoal/60">
                  Size: {product.size} {product.unit} (Net quantity)
                </span>
              </div>
              <p className="text-[11px] text-charcoal/50">
                Inclusive of all taxes. Free shipping on Bengaluru orders above ₹999.
              </p>
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
                {product.shortDesc}
              </p>
            )}

            {/* Transparency Callouts */}
            <div className="flex flex-wrap gap-2 pt-2">
              {hasBeeswax ? (
                <span className="badge bg-amber-100 text-amber-900 text-xs border border-amber-200">
                  Contains Beeswax • Not Vegan
                </span>
              ) : (
                <span className="badge bg-green-100 text-green-900 text-xs border border-green-200">
                  No Animal-Derived Ingredients
                </span>
              )}

              {hasPreservative ? (
                <span className="badge bg-stone-100 text-stone-800 text-xs border border-stone-300">
                  Contains Preservative System • Not Preservative-Free
                </span>
              ) : null}

              <span className="badge bg-beige text-charcoal text-xs border border-beige">
                Artisanal Working Formulation
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-beige">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-charcoal">Quantity</span>
                <div className="inline-flex items-center border border-beige rounded-full bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="px-3.5 py-1.5 text-xs text-charcoal hover:text-forest disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-medium text-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="px-3.5 py-1.5 text-xs text-charcoal hover:text-forest disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAdding}
                  className="btn-primary flex-1 justify-center py-3.5 text-xs font-medium tracking-wide disabled:opacity-50"
                >
                  <ShoppingBag size={15} />
                  <span>
                    {product.stock === 0
                      ? 'Out of Stock'
                      : isAdding
                      ? 'Adding to Cart…'
                      : 'Add to Cart'}
                  </span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="btn-secondary flex-1 justify-center py-3.5 text-xs font-medium tracking-wide disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              {addedMessage && (
                <div className="p-3 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
                  <Check size={14} />
                  <span>Item added to your shopping bag.</span>
                </div>
              )}
            </div>

            {/* Delivery & Dispatch Note */}
            <div className="space-y-2 pt-4 border-t border-beige text-xs text-charcoal/70">
              <div className="flex items-center gap-2.5">
                <Truck size={14} className="text-forest shrink-0" />
                <span>
                  Bengaluru: 2–5 business days • Other Indian cities: 4–8 business days (estimated)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw size={14} className="text-forest shrink-0" />
                <span>
                  Proposed return review: unopened/unused within 7 days of delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Detailed Tabs / Sections ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Formulation & Description */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-beige space-y-6">
            <div>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-4">
                About this Formulation
              </h2>
              <div className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light whitespace-pre-line space-y-3">
                {product.description}
              </div>
            </div>

            {/* Complete Working Ingredients */}
            <div className="pt-6 border-t border-beige">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-medium text-charcoal flex items-center gap-2">
                  <Leaf size={16} className="text-forest" />
                  <span>Declared Working Ingredients</span>
                </h3>
                <span className="text-[11px] text-sage">Full disclosure</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-cream/70 border border-beige flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-charcoal">{ing.name}</span>
                      {ing.purpose && (
                        <span className="text-[10px] text-sage font-normal">{ing.purpose}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-charcoal/60">No ingredients listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Safety & Botanical Disclaimer Sidebar */}
          <div className="space-y-6">
            {/* Safety instructions */}
            <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-serif font-medium text-base">
                <ShieldAlert size={18} className="text-amber-700" />
                <span>Safety & Application Guidance</span>
              </div>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                {product.safetyNotes ||
                  'For adult external use only. Keep out of reach of children. Store in a cool, dry place away from direct sunlight.'}
              </p>
              <div className="p-3 rounded-xl bg-white border border-amber-200/80 text-[11px] text-charcoal/70 leading-relaxed">
                <strong>Patch Test Protocol:</strong> Apply 1–2 drops or a small dab to your
                inner forearm. Leave undisturbed for 24 hours. Discontinue if redness, itching,
                or discomfort occurs.
              </div>
            </div>

            {/* Non-medical disclaimer */}
            <div className="bg-beige/40 p-6 rounded-2xl border border-beige text-xs text-charcoal/70 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-charcoal">
                <AlertCircle size={14} className="text-forest" />
                <span>Regulatory Notice</span>
              </div>
              <p className="leading-relaxed">
                This product is a working catalogue formulation and has not been clinically
                tested or dermatologically certified. No claims are made that this product treats,
                cures, or prevents any skin disease or medical condition.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Related Products ─────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="pt-12 border-t border-beige">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-subtitle">Complementary Steps</p>
                <h2 className="section-title text-2xl md:text-3xl">Pair With These Formulations</h2>
              </div>
              <Link to="/shop" className="text-xs font-medium text-forest hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

