import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  Leaf,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Droplets,
  ArrowRight,
} from 'lucide-react'

const SkincareGuidePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Are Botanique products vegan?',
      a: 'The Rose Face Oil, Aloe Calm Gel, and Vitamin Glow Serum do not contain animal-derived ingredients based on current formulations. However, the Shea Repair Balm and Herbal Lip Balm contain Beeswax and are therefore not vegan.',
    },
    {
      q: 'Do you test products on animals?',
      a: 'Botanique does not conduct animal testing on any of its formulations.',
    },
    {
      q: 'Are your products safe for sensitive skin?',
      a: 'We recommend performing a patch test on a small area of skin before first use. If you have specific skin concerns, chronic conditions, or known allergies, please consult a dermatologist before use. Botanique formulations are not clinically tested or dermatologically approved.',
    },
    {
      q: 'How should I perform a patch test?',
      a: 'Apply a small amount of product (1–2 drops or a small dab) to the inner forearm or behind the ear. Leave the area undisturbed and dry for 24 hours. If any redness, burning, itching, or irritation develops, discontinue use immediately and do not apply to the face.',
    },
    {
      q: 'Can Botanique products cure acne or eczema?',
      a: 'No. Botanique products are cosmetic botanical preparations designed for everyday skincare rituals. They do not claim to treat, cure, or diagnose any medical or dermatological condition.',
    },
    {
      q: 'Is Aloe Calm Gel preservative-free?',
      a: 'No. Aloe Calm Gel contains a preservative system to maintain formulation integrity. We do not advertise or label it as preservative-free.',
    },
  ]

  const ingredientsGlossary = [
    {
      name: 'Squalane',
      role: 'Emollient & Barrier Support',
      details:
        'A lightweight, non-greasy lipid that spreads smoothly, helping maintain skin surface moisture without feeling heavy.',
    },
    {
      name: 'Jojoba Seed Oil',
      role: 'Botanical Wax Ester',
      details:
        'Closely resembles natural sebum composition; useful for sealing moisture and maintaining balanced surface texture.',
    },
    {
      name: 'Rosehip Seed Oil',
      role: 'Antioxidant-Rich Plant Oil',
      details:
        'Naturally rich in fatty acids (linoleic and linolenic) that offer surface conditioning and botanical nourishment.',
    },
    {
      name: 'Shea Butter',
      role: 'Rich Conditioning Butter',
      details:
        'Derived from the shea nut, provides a dense protective moisture barrier ideal for dry and exposed skin areas.',
    },
    {
      name: 'Aloe Vera Leaf Juice',
      role: 'Hydrating Botanical Base',
      details:
        'A refreshing, water-rich botanical juice that helps supply surface moisture and soothing comfort.',
    },
    {
      name: 'Niacinamide (Vitamin B3)',
      role: 'Surface Tone & Texture Harmony',
      details:
        'A well-researched cosmetic ingredient recognized for assisting barrier balance and skin surface clarity.',
    },
    {
      name: 'Panthenol (Provitamin B5)',
      role: 'Humectant & Skin Conditioner',
      details:
        'Attracts and retains moisture at the surface level, enhancing softness and suppleness.',
    },
    {
      name: 'Sodium Hyaluronate',
      role: 'Water-Binding Agent',
      details:
        'A salt form of Hyaluronic Acid with high water-binding capacity, delivering plump surface hydration.',
    },
    {
      name: 'Calendula Extract',
      role: 'Botanical Flower Extract',
      details:
        'Extracted from marigold blossoms, traditionally valued in soothing balms for delicate skin areas.',
    },
    {
      name: 'Tocopherol (Vitamin E)',
      role: 'Antioxidant Component',
      details:
        'Helps protect botanical oils against oxidative degradation while conditioning the skin surface.',
    },
  ]

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-subtitle">Education & Transparency</p>
          <h1 className="section-title mb-4">Botanical Skincare Guide</h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed">
            A comprehensive, transparent guide to navigating botanical ingredients, patch
            testing, and mindful ritual choices.
          </p>
        </div>

        {/* ─── Medical Disclaimer Banner ──────────────────────────── */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 mb-12 flex items-start gap-4">
          <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
            <h3 className="font-serif font-semibold text-sm">
              General Information Disclaimer — Not Medical Advice
            </h3>
            <p>
              The content provided on this website and in this guide is for general educational
              and informational purposes only. It is not intended as medical, dermatological, or
              clinical advice. Botanique products are cosmetic formulations and are not
              manufactured to diagnose, treat, cure, or prevent any disease, disorder, or skin
              condition. If you have chronic skin symptoms, severe sensitivity, or allergies,
              please consult a licensed healthcare practitioner.
            </p>
          </div>
        </div>

        {/* ─── Patch Testing Protocol ─────────────────────────────── */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl border border-beige shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-forest/10 text-forest">
              <Droplets size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                How to Patch Test Before Use
              </h2>
              <p className="text-xs text-sage">Recommended for all new skincare formulations</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light mb-6">
            Even mild, plant-derived ingredients can cause unexpected sensitivities in certain
            individuals. Performing a simple patch test prior to full application is the safest
            way to assess skin compatibility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-cream border border-beige">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block mb-1">
                Step 1: Apply
              </span>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Dispense 1–2 drops or a small pea-sized amount onto the inner forearm or behind
                the ear on clean, dry skin.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cream border border-beige">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block mb-1">
                Step 2: Observe
              </span>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Leave the area undisturbed for 24 hours. Keep it away from friction and do not
                wash the test spot.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cream border border-beige">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block mb-1">
                Step 3: Evaluate
              </span>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                If no redness, swelling, burning, or itching occurs, proceed with cautious
                regular use. Discontinue if any reaction develops.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Skin Sensitivity Considerations ─────────────────────── */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl border border-beige shadow-sm mb-12">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal mb-4">
            Skin Sensitivity & Mindful Selection
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-charcoal/80 leading-relaxed font-light">
            <p>
              Every individual’s skin barrier behaves uniquely based on climate, genetics,
              lifestyle, and existing skincare routines. Here are key principles to keep in
              mind:
            </p>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong>Introduce one formulation at a time:</strong> Wait 5–7 days before
                introducing another new product so you can easily observe how your skin responds.
              </li>
              <li>
                <strong>Respect barrier limits:</strong> Less is often more. Overloading with
                too many oils, actives, or heavy balms simultaneously can cause temporary surface
                congestion.
              </li>
              <li>
                <strong>Beeswax awareness:</strong> If you avoid animal-derived byproducts or
                have known bee-product sensitivities, choose the Rose Face Oil, Aloe Calm Gel, or
                Vitamin Glow Serum instead of our balms.
              </li>
            </ul>
          </div>
        </section>

        {/* ─── Ingredient Glossary ─────────────────────────────────── */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl border border-beige shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-forest/10 text-forest">
              <Leaf size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                Botanique Ingredient Glossary
              </h2>
              <p className="text-xs text-sage">Working components in our 5 official formulations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ingredientsGlossary.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-xl bg-cream/70 border border-beige space-y-1"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-sm font-semibold text-charcoal">
                    {item.name}
                  </h3>
                  <span className="text-[10px] text-sage font-medium">{item.role}</span>
                </div>
                <p className="text-xs text-charcoal/70 leading-relaxed">{item.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Frequently Asked Questions ──────────────────────────── */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl border border-beige shadow-sm mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-full bg-forest/10 text-forest">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                Frequently Asked Skincare Questions
              </h2>
              <p className="text-xs text-sage">Clear, factual responses</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="border border-beige rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-charcoal hover:bg-cream/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-sage transition-transform shrink-0 ml-2 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-charcoal/75 leading-relaxed font-light border-t border-beige/40 pt-3 bg-cream/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Support Link */}
        <div className="text-center p-8 rounded-2xl bg-beige/50 border border-beige">
          <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
            Have a question about your order or ritual?
          </h3>
          <p className="text-xs text-charcoal/70 mb-4">
            Our team is glad to assist you with honest, thoughtful guidance.
          </p>
          <Link to="/contact" className="btn-secondary text-xs px-6 py-2.5">
            Contact Botanique Support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SkincareGuidePage

