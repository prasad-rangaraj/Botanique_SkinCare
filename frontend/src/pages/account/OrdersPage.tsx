import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import api from '../../lib/api'
import { Order } from '../../types'

const statusBadge = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case 'PROCESSING':
      return <span className="badge bg-blue-100 text-blue-800 text-[11px]">{status}</span>
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return <span className="badge bg-amber-100 text-amber-800 text-[11px]">{status.replace(/_/g, ' ')}</span>
    case 'DELIVERED':
      return <span className="badge bg-green-100 text-green-800 text-[11px]">{status}</span>
    case 'CANCELLED':
    case 'REFUNDED':
      return <span className="badge bg-gray-100 text-gray-800 text-[11px]">{status}</span>
    default:
      return <span className="badge bg-stone-100 text-stone-800 text-[11px]">{status}</span>
  }
}

const OrdersPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<{ orders: Order[] }>({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const res = await api.get('/users/orders')
      return res.data
    },
  })

  const orders = data?.orders || []

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-4xl">
        {/* Back Link */}
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-forest mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Account</span>
        </Link>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Order History
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Review and track your previous botanical orders.
            </p>
          </div>
          <span className="badge bg-forest/10 text-forest text-xs">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {/* Order Listing */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-36 border border-beige animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl border border-beige shadow-sm hover:border-forest/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-beige/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-charcoal">
                      {order.orderRef}
                    </span>
                    {statusBadge(order.status)}
                  </div>
                  <span className="text-[11px] text-charcoal/50">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="text-charcoal/80">
                        <span className="font-medium">
                          {(item as any).productName || item.product?.name}
                        </span>{' '}
                        <span className="text-charcoal/50">× {item.quantity}</span>
                      </div>
                      <span className="text-charcoal/70">
                        ₹{(Number(item.price || (item as any).unitPrice) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-beige/60">
                  <div className="text-xs">
                    <span className="text-charcoal/60">Total: </span>
                    <span className="font-semibold text-forest text-sm">
                      ₹{Number(order.total).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    to={`/account/orders/${order.id}`}
                    className="btn-secondary text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-beige text-center max-w-md mx-auto">
            <Package size={36} className="mx-auto text-sage mb-3" />
            <h3 className="font-serif text-lg font-medium text-charcoal mb-2">
              No orders placed yet
            </h3>
            <p className="text-xs text-charcoal/60 mb-6 leading-relaxed">
              When you place an order with Botanique, you will be able to monitor fulfillment,
              tracking details, and order receipts here.
            </p>
            <Link to="/shop" className="btn-primary text-xs py-2.5 px-6">
              Explore Catalogue
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage

