import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Droplets,
  Heart,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
} from 'lucide-react'
import api from '../lib/api'
import { Product, Category } from '../types'
import ProductCard from '../components/product/ProductCard'

const HomePage: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery<{
    products: Product[]
  }>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/products/featured')
      return res.data
    },
  })

  // Fetch categories
  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories')
      return res.data
    },
  })

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterStatus('loading')
    try {
      await api.post('/newsletter/subscribe', { email: newsletterEmail })
      setNewsletterStatus('success')
      setNewsletterMessage('Thank you for subscribing to Botanique updates.')
      setNewsletterEmail('')
    } catch (err: any) {
      setNewsletterStatus('error')
      setNewsletterMessage(
        err.response?.data?.message || 'Could not subscribe. Please try again.'
      )
    }
  }

  const botanicalIngredients = [
    {
      name: 'Squalane',
      origin: 'Plant-derived lipid',
      description:
        'A lightweight, non-comedogenic emollient that mimics skin’s natural lipid barrier without a heavy residue.',
    },
    {
      name: 'Rosehip Seed Oil',
      origin: 'Rosa canina seed oil',
      description:
        'Cold-pressed oil naturally rich in essential fatty acids and antioxidants, valued in botanical face formulations.',
    },
    {
      name: 'Shea Butter',
      origin: 'Butyrospermum parkii',
      description:
        'A dense, nourishing plant butter that creates a comfortable protective layer on delicate and dry areas.',
    },
    {
      name: 'Aloe Vera Leaf Juice',
      origin: 'Aloe barbadensis',
      description:
        'A hydrating botanical base known for providing refreshing moisture and gentle surface comfort.',
    },
    {
      name: 'Niacinamide',
      origin: 'Vitamin B3',
      description:
        'A well-documented skincare ingredient that supports barrier balance and surface texture harmony.',
    },
    {
      name: 'Calendula Extract',
      origin: 'Calendula officinalis',
      description:
        'A time-honored floral extract traditionally incorporated into comforting botanical balms.',
    },
  ]

  return (
    <div className="bg-cream">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest text-cream pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Background botanical aesthetic elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 C30,40 70,60 100,100 L100,0 Z" fill="#A8B8A0" />
          </svg>
        </div>

        <div className="page-container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/20 border border-sage/30 text-xs text-cream mb-6 tracking-wide">
              <Leaf size={13} className="text-sage" />
              <span>Artisanal Botanical Formulations • Bengaluru</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream font-normal leading-[1.15] mb-6">
              Rooted in Nature. <br />
              <span className="italic font-light">Made for Your Ritual.</span>
            </h1>

            <p className="text-base sm:text-lg text-cream/80 font-light leading-relaxed mb-10 max-w-2xl">
              Thoughtfully formulated botanical skincare crafted for mindful everyday
              routines. Transparent ingredients, zero exaggerated claims, and an honest
              commitment to simplicity and skin care.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="bg-cream text-forest hover:bg-beige font-medium px-8 py-3.5 rounded-full text-sm tracking-wide transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <span>Shop Catalogue</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/our-story"
                className="border border-cream/40 text-cream hover:bg-cream/10 font-medium px-8 py-3.5 rounded-full text-sm tracking-wide transition-colors"
              >
                Discover Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Floating transparency banner */}
        <div className="mt-14 pt-8 border-t border-cream/10">
          <div className="page-container grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-cream/75">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-sage shrink-0" />
              <span>Full Ingredient Disclosure</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-sage shrink-0" />
              <span>Artisanal Small-Batch Ethos</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-sage shrink-0" />
              <span>No Exaggerated Beauty Claims</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-sage shrink-0" />
              <span>Secure Pan-India Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────────── */}
      <section className="py-20 md:py-28 page-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="section-subtitle">Working Catalogue</p>
            <h2 className="section-title">Formulations in the Spotlight</h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 md:mt-0 text-sm font-medium text-forest hover:text-forest/80 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View All Five Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-beige" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredData?.products && featuredData.products.length > 0 ? (
              featuredData.products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-sm text-charcoal/60 col-span-full">
                Catalogue is currently being updated by the team.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ─── Brand Philosophy ─────────────────────────────────────── */}
      <section className="py-20 bg-beige/40 border-y border-beige">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-subtitle">Our Guiding Standard</p>
            <h2 className="section-title mb-4">Honesty in Every Dropper and Jar</h2>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              We believe personal care should be calm, grounded, and entirely transparent.
              We do not invent clinical trials, promise miracle transformations, or claim
              our formulations cure medical skin conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-beige/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-6">
                  <Leaf size={22} />
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal mb-3">
                  Botanical Intent
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Carefully selected plant oils, herbal extracts, and purposeful cosmetic
                  ingredients formulated to complement your daily ritual without sensory
                  overload.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige text-xs text-sage font-medium">
                Plain ingredient declarations
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-beige/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-6">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal mb-3">
                  Total Transparency
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  What you read is what we formulate. We openly disclose our working
                  ingredients and clearly note when a formulation contains beeswax or a
                  standard preservative system.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige text-xs text-sage font-medium">
                No concealed components
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-beige/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-6">
                  <Sparkles size={22} />
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal mb-3">
                  Respect for Skin
                </h3>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  Skincare is an individual journey. We advocate patch testing before full
                  application and recognize that no single product suits every skin type or
                  sensitivity level.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige text-xs text-sage font-medium">
                Safety and patch test guidance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Category Discovery ───────────────────────────── */}
      <section className="py-20 md:py-28 page-container">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="section-subtitle">Categories</p>
          <h2 className="section-title mb-3">Explore the Botanique Shelf</h2>
          <p className="text-sm text-charcoal/70">
            Targeted botanical textures designed for different steps in your regimen.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {[
            { name: 'Face Oils', slug: 'face-oils', desc: 'Squalane & Rosehip' },
            { name: 'Balms', slug: 'balms', desc: 'Shea & Calendula' },
            { name: 'Gels', slug: 'gels', desc: 'Soothing Aloe Vera' },
            { name: 'Serums', slug: 'serums', desc: 'Niacinamide & Panthenol' },
            { name: 'Lip Care', slug: 'lip-care', desc: 'Botanical Lip Nourishment' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="bg-white p-6 rounded-2xl border border-beige text-center hover:border-forest/50 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-cream border border-beige flex items-center justify-center text-forest mb-4 group-hover:scale-110 transition-transform">
                <Leaf size={18} />
              </div>
              <h3 className="font-serif text-base font-medium text-charcoal group-hover:text-forest transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Botanical Ingredient Awareness ───────────────────────── */}
      <section className="py-20 bg-forest text-cream">
        <div className="page-container">
          <div className="max-w-2xl mb-14">
            <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-3">
              Ingredient Transparency
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-cream mb-4 font-normal">
              What Powers Our Formulations
            </h2>
            <p className="text-sm text-cream/80 leading-relaxed">
              Every botanical oil and active ingredient in our working formulations is
              selected for its specific cosmetic property. Here is a clear look at our core
              botanical components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {botanicalIngredients.map((item) => (
              <div
                key={item.name}
                className="bg-cream/5 border border-cream/15 p-6 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="font-serif text-lg font-medium text-cream">{item.name}</h3>
                  <span className="text-[11px] text-sage">{item.origin}</span>
                </div>
                <p className="text-xs text-cream/75 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl bg-cream/10 border border-cream/20 flex items-start gap-3.5 max-w-3xl">
            <AlertCircle size={18} className="text-sage shrink-0 mt-0.5" />
            <p className="text-xs text-cream/85 leading-relaxed">
              <strong>Formulation Note:</strong> Botanique products are formulated with
              working botanical specifications. We do not make claims of dermatological
              accreditation or clinical cure. Individual sensitivities may vary; always
              perform a 24-hour patch test prior to initial application.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Skincare Routine Suggestion ──────────────────────────── */}
      <section className="py-20 md:py-28 page-container">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="section-subtitle">Ritual Discovery</p>
          <h2 className="section-title mb-3">A Gentle Daily Cadence</h2>
          <p className="text-sm text-charcoal/70">
            Simple, unhurried steps to nurture your skin morning and night.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Morning */}
          <div className="bg-white p-8 rounded-2xl border border-beige shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-cream text-forest">
                <Sun size={20} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-charcoal">
                  Morning Ritual
                </h3>
                <p className="text-xs text-sage">Cleanse • Hydrate • Seal</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-charcoal/80">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  <strong>Hydration Step:</strong> After cleansing, smooth a light layer of{' '}
                  <Link to="/products/aloe-calm-gel" className="text-forest underline">
                    Aloe Calm Gel
                  </Link>{' '}
                  or{' '}
                  <Link to="/products/vitamin-glow-serum" className="text-forest underline">
                    Vitamin Glow Serum
                  </Link>{' '}
                  over slightly damp skin.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  <strong>Moisture Seal:</strong> Press 2–3 drops of{' '}
                  <Link to="/products/rose-face-oil" className="text-forest underline">
                    Rose Face Oil
                  </Link>{' '}
                  into the palms and gently tap over face and neck.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  <strong>Lip Care:</strong> Coat lips with{' '}
                  <Link to="/products/herbal-lip-balm" className="text-forest underline">
                    Herbal Lip Balm
                  </Link>{' '}
                  for everyday softness.
                </span>
              </li>
            </ol>
          </div>

          {/* Evening */}
          <div className="bg-white p-8 rounded-2xl border border-beige shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-full bg-cream text-forest">
                <Moon size={20} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-charcoal">
                  Evening Ritual
                </h3>
                <p className="text-xs text-sage">Unwind • Restore • Protect</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-charcoal/80">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  <strong>Restorative Moisture:</strong> Apply{' '}
                  <Link to="/products/vitamin-glow-serum" className="text-forest underline">
                    Vitamin Glow Serum
                  </Link>{' '}
                  to cleansed skin to supply gentle humectants overnight.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  <strong>Targeted Balm:</strong> Warm a pea-sized amount of{' '}
                  <Link to="/products/shea-repair-balm" className="text-forest underline">
                    Shea Repair Balm
                  </Link>{' '}
                  between fingertips and smooth onto dry or weathered zones.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-cream font-semibold text-forest flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  <strong>Rest:</strong> Allow your skin to rest undisturbed. Remember that
                  consistency and gentle care matter more than complex multilayer routines.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/skincare-guide"
            className="text-xs font-medium text-forest hover:underline inline-flex items-center gap-1.5"
          >
            <HelpCircle size={14} />
            <span>Read our complete Skincare & Patch Testing Guide</span>
          </Link>
        </div>
      </section>

      {/* ─── Newsletter Section ───────────────────────────────────── */}
      <section className="py-20 bg-beige/60 border-t border-beige">
        <div className="page-container max-w-xl text-center">
          <Leaf size={28} className="mx-auto text-forest mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">
            Stay Connected with Botanique
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mb-8">
            Receive updates on small-batch restocks, seasonal botanical announcements,
            and gentle skincare insights directly from our Bengaluru atelier.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="input flex-1 text-xs"
              disabled={newsletterStatus === 'loading'}
            />
            <button
              type="submit"
              disabled={newsletterStatus === 'loading'}
              className="btn-primary justify-center text-xs px-6 whitespace-nowrap"
            >
              {newsletterStatus === 'loading' ? 'Joining…' : 'Subscribe'}
            </button>
          </form>

          {newsletterStatus === 'success' && (
            <p className="mt-4 text-xs text-forest font-medium">{newsletterMessage}</p>
          )}
          {newsletterStatus === 'error' && (
            <p className="mt-4 text-xs text-red-600 font-medium">{newsletterMessage}</p>
          )}

          <p className="text-[11px] text-charcoal/50 mt-4">
            We respect your privacy. You can unsubscribe at any time.
          </p>

          <div className="mt-8 pt-6 border-t border-beige/80 flex flex-wrap items-center justify-center gap-2 text-xs text-charcoal/70">
            <span>Need real-time assistance with your ritual?</span>
            <a
              href="https://t.me/Skin_Carenow_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-sky-700 hover:text-sky-800 hover:underline"
            >
              <Send size={13} className="-rotate-45" />
              <span>Chat with @Skin_Carenow_Bot on Telegram</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

