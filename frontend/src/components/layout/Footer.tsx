import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import api from '../../lib/api'

const Footer: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      await api.post('/newsletter/subscribe', { email })
      setStatus('success')
      setEmail('')
    } catch (err: unknown) {
      setStatus('error')
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMsg(axiosError?.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <footer className="bg-charcoal text-cream">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="w-9 h-9 bg-forest rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <Leaf size={18} className="text-cream" />
              </div>
              <span className="font-serif text-xl font-semibold tracking-tight text-cream">
                BOTANIQUE
              </span>
            </Link>
            <p className="text-sm text-cream/70 leading-relaxed mb-5 italic font-serif">
              "Rooted in Nature. Made for Your Ritual."
            </p>
            <p className="text-xs text-cream/50 leading-relaxed">
              An artisanal botanical skincare brand from Bengaluru, thoughtfully
              formulated for everyday rituals.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://t.me/Skin_Carenow_Bot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Customer Care Bot (@Skin_Carenow_Bot)"
                className="w-9 h-9 bg-cream/10 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors text-cream"
                title="Chat on Telegram: @Skin_Carenow_Bot"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
                </svg>
              </a>
              <button
                aria-label="Instagram"
                className="w-9 h-9 bg-cream/10 rounded-full flex items-center justify-center hover:bg-forest transition-colors text-cream"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </button>
              <button
                aria-label="Email"
                className="w-9 h-9 bg-cream/10 rounded-full flex items-center justify-center hover:bg-forest transition-colors"
              >
                <Mail size={16} />
              </button>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest mb-5 text-cream/90">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', to: '/shop' },
                { label: 'Face Oils', to: '/shop?category=face-oils' },
                { label: 'Face Wash', to: '/shop?category=face-wash' },
                { label: 'Serums', to: '/shop?category=serums' },
                { label: 'Lip Care', to: '/shop?category=lip-care' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-cream/60 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest mb-5 text-cream/90">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Our Story', to: '/our-story' },
                { label: 'Skincare Guide', to: '/skincare-guide' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Telegram Bot (@Skin_Carenow_Bot)', to: 'https://t.me/Skin_Carenow_Bot', isExternal: true },
                { label: 'My Account', to: '/account' },
                { label: 'My Orders', to: '/account/orders' },
              ].map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-sm text-cream/60 hover:text-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-widest mb-5 text-cream/90">
              Stay in Touch
            </h4>
            <p className="text-sm text-cream/60 mb-4 leading-relaxed">
              Skincare tips, new arrivals, and botanical insights — directly in
              your inbox.
            </p>

            {status === 'success' ? (
              <div className="bg-forest/30 border border-forest/50 rounded-xl p-4">
                <p className="text-sm text-cream font-medium">
                  ✓ Thank you for subscribing!
                </p>
                <p className="text-xs text-cream/70 mt-1">
                  We'll be in touch with updates and skincare tips.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-cream/10 border border-cream/20 rounded-xl px-4 py-3 text-sm
                             text-cream placeholder-cream/40 focus:outline-none focus:ring-2
                             focus:ring-forest focus:border-transparent transition-all"
                />
                {status === 'error' && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-forest text-cream py-3 rounded-xl text-sm font-medium
                             hover:bg-opacity-80 transition-all flex items-center justify-center gap-2
                             disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                  {status !== 'loading' && <ArrowRight size={15} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream/40">
              © 2024 BOTANIQUE. All rights reserved.
            </p>
            <p className="text-xs text-cream/30 text-center max-w-xl leading-relaxed">
              Information on this website is for general guidance only and is not medical advice.
              Always patch test new products. Consult a dermatologist for skin concerns.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
