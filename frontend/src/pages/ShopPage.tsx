import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Leaf,
  ChevronDown,
  Info,
} from 'lucide-react'
import api from '../lib/api'
import { Product, Category } from '../types'
import ProductCard from '../components/product/ProductCard'

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || ''

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [priceRange, setPriceRange] = useState<number>(2000)
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false)

  // Sync category param with state
  useEffect(() => {
    const cat = searchParams.get('category') || ''
    setSelectedCategory(cat)
  }, [searchParams])

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['shop-categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories')
      return res.data
    },
  })

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
    error,
  } = useQuery<{ products: Product[]; pagination: any }>({
    queryKey: ['shop-products', selectedCategory, sortBy, priceRange],
    queryFn: async () => {
      let sortField = 'createdAt'
      let sortOrder = 'desc'

      if (sortBy === 'price-low') {
        sortField = 'price'
        sortOrder = 'asc'
      } else if (sortBy === 'price-high') {
        sortField = 'price'
        sortOrder = 'desc'
      } else if (sortBy === 'name') {
        sortField = 'name'
        sortOrder = 'asc'
      }

      const params: Record<string, any> = {
        sort: sortField,
        order: sortOrder,
        maxPrice: priceRange,
        limit: 50,
      }

      if (selectedCategory) {
        params.category = selectedCategory
      }

      const res = await api.get('/products', { params })
      return res.data
    },
  })

  // Filter products by local search query
  const filteredProducts = (productsData?.products || []).filter((product) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      (product.shortDesc && product.shortDesc.toLowerCase().includes(q)) ||
      (product.ingredients &&
        product.ingredients.some((i) => i.name.toLowerCase().includes(q)))
    )
  })

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="section-subtitle">Official Catalogue</p>
          <h1 className="section-title mb-3">Botanical Formulations</h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            Thoughtfully developed botanical oils, balms, and gels crafted in small batches.
            Simple, honest skincare for mindful everyday rituals.
          </p>
        </div>

        {/* Search & Mobile Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-beige shadow-sm">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
            <input
              type="text"
              placeholder="Search by product or ingredient…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 py-2 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-beige rounded-full text-xs font-medium text-charcoal hover:border-forest"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal/60 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2 px-3 text-xs border border-beige rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ─── Desktop Filter Sidebar ───────────────────────────── */}
          <aside className="hidden md:block col-span-1 space-y-8">
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm">
              <h3 className="font-serif text-base font-medium text-charcoal mb-4 flex items-center gap-2">
                <Leaf size={16} className="text-forest" />
                <span>Categories</span>
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === ''
                      ? 'bg-forest text-cream font-medium'
                      : 'text-charcoal/80 hover:bg-beige/50'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-[10px] opacity-70">5</span>
                </button>

                {categoriesData?.categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-forest text-cream font-medium'
                        : 'text-charcoal/80 hover:bg-beige/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-[10px] opacity-70">{cat._count.products}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm">
              <h3 className="font-serif text-base font-medium text-charcoal mb-4">
                Max Price
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="350"
                  max="2000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
                <div className="flex justify-between text-xs text-charcoal/70">
                  <span>₹350</span>
                  <span className="font-semibold text-forest">₹{priceRange}</span>
                </div>
              </div>
            </div>

            {/* Transparency Note */}
            <div className="bg-beige/50 p-5 rounded-2xl border border-beige text-xs text-charcoal/75 leading-relaxed">
              <div className="flex items-center gap-2 font-medium text-charcoal mb-2">
                <Info size={14} className="text-forest" />
                <span>Authentic Catalog</span>
              </div>
              <p>
                All 5 formulations represent Botanique’s actual catalogue. We never publish
                invented product ranges or fabricated cosmetic claims.
              </p>
            </div>
          </aside>

          {/* ─── Mobile Filters Drawer ────────────────────────────── */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex justify-end md:hidden">
              <div className="bg-cream w-4/5 max-w-sm h-full p-6 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-beige mb-6">
                    <h2 className="font-serif text-lg font-medium text-charcoal">Filters</h2>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 rounded-full text-charcoal hover:bg-beige"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-sm font-medium text-charcoal mb-3">
                        Categories
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            handleCategoryChange('')
                            setMobileFilterOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                            selectedCategory === ''
                              ? 'bg-forest text-cream font-medium'
                              : 'text-charcoal hover:bg-beige'
                          }`}
                        >
                          All Products
                        </button>
                        {categoriesData?.categories?.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              handleCategoryChange(cat.slug)
                              setMobileFilterOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                              selectedCategory === cat.slug
                                ? 'bg-forest text-cream font-medium'
                                : 'text-charcoal hover:bg-beige'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-sm font-medium text-charcoal mb-3">
                        Max Price: ₹{priceRange}
                      </h3>
                      <input
                        type="range"
                        min="350"
                        max="2000"
                        step="50"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full accent-forest"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn-primary w-full justify-center text-xs mt-6"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* ─── Product Grid ─────────────────────────────────────── */}
          <main className="col-span-1 md:col-span-3">
            {/* Active filters pill list */}
            {(selectedCategory || searchQuery || priceRange < 2000) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-charcoal/60">Active filters:</span>
                {selectedCategory && (
                  <span className="badge bg-beige text-charcoal text-xs inline-flex items-center gap-1.5 py-1 px-3">
                    Category: {selectedCategory}
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="hover:text-forest"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="badge bg-beige text-charcoal text-xs inline-flex items-center gap-1.5 py-1 px-3">
                    Query: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-forest">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {priceRange < 2000 && (
                  <span className="badge bg-beige text-charcoal text-xs inline-flex items-center gap-1.5 py-1 px-3">
                    Max: ₹{priceRange}
                    <button onClick={() => setPriceRange(2000)} className="hover:text-forest">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    handleCategoryChange('')
                    setSearchQuery('')
                    setPriceRange(2000)
                  }}
                  className="text-xs text-forest hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="flex justify-between items-center mb-6 text-xs text-charcoal/60">
              <p>
                Showing <strong>{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'formulation' : 'formulations'}
              </p>
            </div>

            {/* Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl h-84 animate-pulse border border-beige"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-beige text-center max-w-md mx-auto my-12">
                <Leaf size={32} className="mx-auto text-sage mb-3" />
                <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                  No matching formulations found
                </h3>
                <p className="text-xs text-charcoal/70 leading-relaxed mb-6">
                  Try clearing your search filters or resetting the price slider to explore all
                  Botanique products.
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange('')
                    setSearchQuery('')
                    setPriceRange(2000)
                  }}
                  className="btn-secondary text-xs py-2 px-6"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ShopPage

