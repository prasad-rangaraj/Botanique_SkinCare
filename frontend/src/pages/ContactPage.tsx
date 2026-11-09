import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import api from '../lib/api'

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return

    setStatus('loading')
    try {
      await api.post('/contact', formData)
      setStatus('success')
      setStatusMessage('Thank you. Your message has been received by the Botanique team.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: any) {
      setStatus('error')
      setStatusMessage(
        err.response?.data?.message || 'Failed to submit your message. Please try again.'
      )
    }
  }

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-subtitle">Customer Care</p>
          <h1 className="section-title mb-4">Contact Botanique</h1>
          <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed font-light">
            We are here to assist with formulation questions, order inquiries, and general
            support. Reach out through the form below or explore our quick help resources.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* ─── Contact Information & Guidelines ─────────────────── */}
          <div className="space-y-6">
            {/* Business background */}
            <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Atelier Location
              </h2>
              <div className="space-y-3 text-xs text-charcoal/80">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>BOTANIQUE</strong>
                    <br />
                    Bengaluru, Karnataka, India
                  </span>
                </div>
              </div>
            </div>

            {/* Support channels */}
            <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Support Channels
              </h2>
              <div className="space-y-3 text-xs text-charcoal/70">
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className="text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Contact Form:</strong> Best for order tracking, feedback,
                    returns, and detailed queries.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <HelpCircle size={16} className="text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Botanique AI Assistant:</strong> Use the floating assistant at the
                    bottom-right for immediate answers about ingredients and policies.
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-beige text-[11px] text-charcoal/60 leading-relaxed">
                <em>Note:</em> Official support phone numbers, email addresses, and active
                operating hours are maintained by our administrative team in site settings.
              </div>
            </div>

            {/* Quick Policy Links */}
            <div className="bg-beige/50 p-6 rounded-2xl border border-beige space-y-3 text-xs">
              <h3 className="font-serif font-medium text-charcoal text-sm">
                Helpful Navigation
              </h3>
              <ul className="space-y-2 text-charcoal/80">
                <li>
                  <Link to="/skincare-guide" className="text-forest hover:underline">
                    • Skincare & Patch Testing Guide
                  </Link>
                </li>
                <li>
                  <Link to="/account/orders" className="text-forest hover:underline">
                    • Track Existing Order Status
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-forest hover:underline">
                    • Browse Full Product Catalogue
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* ─── Contact Form ───────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-charcoal mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs text-charcoal/60 mb-8">
              Please provide complete details so we can assist you accurately.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Query Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input text-xs bg-white"
                  >
                    <option value="">Select a topic…</option>
                    <option value="Order Tracking">Order Tracking & Shipping</option>
                    <option value="Product Formulation">Product Formulation & Ingredients</option>
                    <option value="Return or Replacement">Return, Refund, or Replacement</option>
                    <option value="Adverse Reaction">Report Skin Reaction</option>
                    <option value="General Inquiry">General Brand Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Your Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please describe your query in detail. If related to an order, include your order reference (e.g., BOT-XXXXXX)."
                  className="input text-xs resize-none"
                />
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <div className="p-4 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{statusMessage}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary text-xs px-8 py-3.5 inline-flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>{status === 'loading' ? 'Sending Message…' : 'Submit Message'}</span>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-beige text-[11px] text-charcoal/50 leading-relaxed">
              We handle customer information with discretion and privacy. We do not sell or
              distribute your contact information.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

