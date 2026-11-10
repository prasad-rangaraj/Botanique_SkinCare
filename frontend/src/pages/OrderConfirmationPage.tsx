import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Send,
  ExternalLink,
} from 'lucide-react'
import api from '../lib/api'

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery<{ order: any }>({
    queryKey: ['order-confirmation', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const order = data?.order

  return (
    <div className="bg-cream min-h-screen py-16 px-4">
      <div className="page-container max-w-2xl bg-white p-8 sm:p-12 rounded-3xl border border-beige shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>

        <p className="text-xs uppercase tracking-widest text-sage font-semibold mb-2">
          Thank you for choosing Botanique
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal mb-4">
          Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed max-w-md mx-auto mb-8 font-light">
          We have received your order and are carefully preparing your botanical formulations
          for small-batch dispatch from our Bengaluru atelier.
        </p>

        {/* Order Details Summary Box */}
        {order ? (
          <div className="p-6 rounded-2xl bg-cream border border-beige text-left space-y-4 mb-8 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-beige">
              <span className="text-charcoal/60">Order Reference:</span>
              <span className="font-mono font-bold text-charcoal text-sm">
                {order.orderRef}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-beige">
              <span className="text-charcoal/60">Status:</span>
              <span className="badge bg-forest text-cream font-medium">
                {order.status}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-beige">
              <span className="text-charcoal/60">Estimated Delivery:</span>
              <span className="font-medium text-charcoal">
                2–5 business days (Bengaluru) / 4–8 business days (Pan-India)
              </span>
            </div>

            <div className="flex justify-between items-center font-serif text-sm font-semibold text-forest pt-1">
              <span>Total Paid:</span>
              <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-cream border border-beige mb-8 text-xs text-charcoal/70">
            Order Reference: <span className="font-mono font-semibold">BOT-{id?.slice(0, 8)}</span>
          </div>
        )}

        {/* Next Steps Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs mb-6">
          <div className="p-4 rounded-xl border border-beige bg-cream/30 space-y-1">
            <div className="flex items-center gap-2 font-medium text-charcoal">
              <Truck size={14} className="text-forest" />
              <span>Dispatch Notification</span>
            </div>
            <p className="text-charcoal/60 font-light">
              You will receive tracking details once your package is handed over to our courier.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-beige bg-cream/30 space-y-1">
            <div className="flex items-center gap-2 font-medium text-charcoal">
              <Leaf size={14} className="text-forest" />
              <span>Patch Test Reminder</span>
            </div>
            <p className="text-charcoal/60 font-light">
              Remember to perform a 24-hour forearm patch test before introducing new products
              to your facial ritual.
            </p>
          </div>
        </div>

        {/* Telegram Customer Care Bot Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-sky-200 bg-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-left mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              <Send size={16} className="-rotate-45 ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-charcoal">
                  Telegram Customer Care Bot
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 text-sky-800">
                  24/7 Support
                </span>
              </div>
              <p className="text-xs text-charcoal/70 font-light mt-0.5">
                Have questions about your order or formulation ritual? Chat directly with{' '}
                <strong className="text-charcoal font-medium">@Skin_Carenow_Bot</strong>.
              </p>
            </div>
          </div>
          <a
            href="https://t.me/Skin_Carenow_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs shrink-0"
          >
            <span>Open Telegram</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn-primary text-xs py-3 px-8 justify-center">
            <span>Continue Shopping</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/account/orders" className="btn-secondary text-xs py-3 px-8 justify-center">
            View in Orders
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage

