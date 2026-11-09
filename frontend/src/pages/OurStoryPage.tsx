import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, ShieldCheck, Heart, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

const OurStoryPage: React.FC = () => {
  return (
    <div className="bg-cream min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-forest text-cream py-20 md:py-28 relative overflow-hidden">
        <div className="page-container relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/20 border border-sage/30 text-xs text-cream mb-6">
            <Leaf size={13} className="text-sage" />
            <span>Bengaluru Artisanal Skincare</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream font-normal leading-tight mb-6">
            Rooted in Nature. <br />
            <span className="italic font-light">Committed to Truth.</span>
          </h1>

          <p className="text-base sm:text-lg text-cream/80 font-light leading-relaxed">
            Botanique is an artisanal personal care brand based in Bengaluru, India. We create
            thoughtfully formulated botanical skincare products designed for everyday rituals,
            grounded in calm aesthetics, ingredient honesty, and transparent communication.
          </p>
        </div>
      </section>

      {/* ─── About Botanique ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="section-subtitle">Our Background</p>
            <h2 className="section-title mb-6">
              A Thoughtful Approach to Personal Care
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
              <p>
                In an industry frequently crowded with hyperbolic promises and synthetic
                complexities, Botanique was conceived around an alternative principle: that
                daily skincare can be gentle, understated, and completely transparent.
              </p>
              <p>
                From our home in Bengaluru, we design working formulations centered on
                plant-derived oils, herbal extracts, and purposeful cosmetic humectants. Each
                product is built for mindful, unhurried routines—nourishing the skin with
                respect and simplicity.
              </p>
              <p>
                We do not believe skincare needs to be intimidating or exaggerated. We do not
                make claims of miraculous transformations, and we never claim our products cure
                or treat medical conditions.
              </p>
            </div>
          </div>

          <div className="bg-beige/60 p-8 sm:p-12 rounded-3xl border border-beige space-y-6">
            <h3 className="font-serif text-2xl text-charcoal font-medium">
              What Defines Botanique
            </h3>
            <ul className="space-y-4 text-xs text-charcoal/80">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Artisanal Small-Batch Mindset:</strong> Thoughtfully developed
                  formulations created in modest volumes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Full Disclosure:</strong> We share complete working ingredient lists
                  so you know exactly what touches your skin.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Honest Identity:</strong> We never describe beeswax-containing balms
                  as vegan or label preserved products as preservative-free.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Safety First:</strong> We actively advocate patch testing and remind
                  customers that skin tolerance is unique to each individual.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Core Values ──────────────────────────────────────────── */}
      <section className="py-20 bg-beige/40 border-y border-beige">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-subtitle">Our Principles</p>
            <h2 className="section-title mb-4">Values That Shape Every Decision</h2>
            <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
              Every formula, every communication, and every parcel we prepare reflects four
              core commitments to our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-beige shadow-sm">
              <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-5">
                <Leaf size={18} />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                Botanical Grounding
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                We draw from time-tested plant oils such as Rosehip, Jojoba, Sunflower, and
                botanicals like Aloe Vera and Calendula for their inherent skin affinity.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-beige shadow-sm">
              <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-5">
                <ShieldCheck size={18} />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                Truth in Communication
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                No invented certifications, no simulated clinical endorsements, and no
                dermatological claims. We communicate conservative, factual information.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-beige shadow-sm">
              <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-5">
                <Sparkles size={18} />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                Simplicity of Ritual
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                Skincare should be a soothing moment of care, not an overwhelming 12-step
                obligation. A few reliable steps are all that is needed.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-beige shadow-sm">
              <div className="w-10 h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-5">
                <Heart size={18} />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
                Customer Integrity
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                Real human support, clear shipping estimates, and honest handling of returns,
                replacements, and inquiries without automated runarounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Botanical Philosophy CTA ─────────────────────────────── */}
      <section className="py-20 md:py-28 page-container text-center max-w-2xl mx-auto">
        <Leaf size={32} className="mx-auto text-forest mb-4" />
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
          Experience the Botanique Shelf
        </h2>
        <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mb-8 font-light">
          Explore our five botanical working formulations—created with care in Bengaluru,
          packaged mindfully, and delivered directly to your doorstep.
        </p>
        <Link to="/shop" className="btn-primary text-xs px-8 py-3.5 inline-flex items-center gap-2">
          <span>Explore All Products</span>
          <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  )
}

export default OurStoryPage

