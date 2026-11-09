import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import api from '../../lib/api'
import { Order } from '../../types'

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [returnReason, setReturnReason] = useState('')
  const [returnType, setReturnType] = useState<'return' | 'refund' | 'replacement'>('return')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState('')
  const [requestError, setRequestError] = useState('')

  const { data, isLoading, error } = useQuery<{ order: any }>({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await api.get(`/users/orders/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const order = data?.order

  // Request actions mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/orders/${id}/cancel`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      setRequestSuccess('Cancellation request submitted.')
    },
    onError: (err: any) => {
      setRequestError(err.response?.data?.message || 'Failed to cancel order.')
    },
  })

  const handlePostDeliveryRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returnReason) return
    setIsSubmittingRequest(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await api.post(`/orders/${id}/${returnType}`, { reason: returnReason })
      setRequestSuccess(
        `Your ${returnType} request has been submitted for review by the Botanique team.`
      )
      setReturnReason('')
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
    } catch (err: any) {
      setRequestError(
        err.response?.data?.message || `Failed to submit ${returnType} request.`
      )
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container py-16 max-w-4xl">
        <div className="h-64 bg-white rounded-3xl border border-beige animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="page-container py-20 text-center max-w-md mx-auto">
        <AlertCircle size={36} className="mx-auto text-forest mb-3" />
        <h2 className="font-serif text-xl font-medium text-charcoal mb-2">Order Not Found</h2>
        <p className="text-xs text-charcoal/60 mb-6">
          The requested order could not be loaded or you do not have permission to view it.
        </p>
        <Link to="/account/orders" className="btn-primary text-xs">
          Return to Orders
        </Link>
      </div>
    )
  }

  const isDelivered = order.status === 'DELIVERED'
  const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED'

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-4xl space-y-8">
        {/* Navigation */}
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Orders</span>
        </Link>

        {/* Order Header Card */}
        <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige">
            <div>
              <span className="text-[11px] text-charcoal/50 uppercase tracking-widest block mb-1">
                Order Reference
              </span>
              <h1 className="font-mono text-xl font-bold text-charcoal">{order.orderRef}</h1>
              <p className="text-xs text-charcoal/60 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="badge bg-forest text-cream text-xs px-3 py-1 font-medium">
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-charcoal/60">
                Payment: {order.payment?.status || 'PENDING'}
              </span>
            </div>
          </div>

          {/* Shipment Information */}
          {order.shipment && (
            <div className="p-4 rounded-2xl bg-cream/60 border border-beige space-y-2">
              <div className="flex items-center gap-2 font-serif text-xs font-semibold text-charcoal">
                <Truck size={15} className="text-forest" />
                <span>Shipment & Delivery Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-charcoal/80">
                <div>
                  <span className="text-charcoal/50 block text-[10px]">Courier</span>
                  <span>{order.shipment.courierName || 'Pending Courier Assignment'}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[10px]">Tracking Number</span>
                  <span className="font-mono">{order.shipment.trackingNumber || 'Awaiting Dispatch'}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[10px]">Estimated Window</span>
                  <span>{order.shipment.estimatedDelivery || 'Calculated post-dispatch'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Card */}
        <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-medium text-charcoal">Formulations Ordered</h2>

          <div className="divide-y divide-beige">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-medium text-charcoal">
                    {item.productName || item.product?.name}
                  </h3>
                  <p className="text-xs text-charcoal/50">
                    Size: {item.productSize || item.product?.size} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-sm font-semibold text-charcoal">
                    ₹{Number(item.totalPrice || item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-charcoal/50">
                    ₹{Number(item.unitPrice || item.price).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="pt-4 border-t border-beige space-y-2 text-xs text-charcoal/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                {Number(order.deliveryCharge) === 0
                  ? 'Free Delivery'
                  : `₹${Number(order.deliveryCharge).toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-beige text-sm font-semibold text-forest font-serif">
              <span>Grand Total</span>
              <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Address & Delivery */}
        {order.address && (
          <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-3">
            <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
              <MapPin size={18} className="text-forest" />
              <span>Delivery Address</span>
            </h2>
            <div className="text-xs text-charcoal/80 leading-relaxed font-light">
              <p className="font-semibold text-charcoal">
                {order.address.fullName || order.address.name}
              </p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
              <p className="text-charcoal/60 mt-1">Phone: {order.address.phone}</p>
            </div>
          </div>
        )}

        {/* ─── Actions & Policy Workflows ───────────────────────────── */}
        <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-medium text-charcoal">
            Order Assistance & Requests
          </h2>

          {requestSuccess && (
            <div className="p-4 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{requestSuccess}</span>
            </div>
          )}

          {requestError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{requestError}</span>
            </div>
          )}

          {/* Cancellation Option (Pending / Confirmed) */}
          {isCancellable && (
            <div className="p-5 rounded-2xl bg-cream border border-beige space-y-3">
              <h3 className="font-serif text-sm font-medium text-charcoal">
                Need to Cancel This Order?
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                Orders can be cancelled before fulfillment and parcel dispatch begin.
              </p>
              <button
                onClick={() => cancelOrderMutation.mutate()}
                disabled={cancelOrderMutation.isPending}
                className="btn-secondary text-xs py-2 px-4 text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
              >
                {cancelOrderMutation.isPending ? 'Submitting…' : 'Request Order Cancellation'}
              </button>
            </div>
          )}

          {/* Post-Delivery Workflows (Returns / Refunds / Replacements) */}
          {isDelivered && (
            <form onSubmit={handlePostDeliveryRequest} className="p-6 rounded-2xl bg-cream border border-beige space-y-4">
              <div className="flex items-center gap-2 font-serif text-sm font-medium text-charcoal">
                <RotateCcw size={16} className="text-forest" />
                <span>Return, Refund, or Replacement Request</span>
              </div>

              {/* Proposed Policy Notice */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed space-y-1">
                <strong>Proposed Return Policy Reference:</strong>
                <p>
                  Our proposed policy accommodates review of unopened and unused products
                  within seven (7) calendar days after confirmed delivery. All requests are
                  subject to review and authorization by our customer support team prior to
                  return shipment acceptance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Request Type</label>
                  <select
                    value={returnType}
                    onChange={(e: any) => setReturnType(e.target.value)}
                    className="input text-xs bg-white"
                  >
                    <option value="return">Return Request</option>
                    <option value="refund">Refund Request</option>
                    <option value="replacement">Replacement Request</option>
                  </select>
                </div>

                <div>
                  <label className="label">Reason for Request *</label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    required
                    placeholder="e.g., Unopened product, damaged in transit"
                    className="input text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingRequest}
                className="btn-primary text-xs py-2.5 px-6"
              >
                {isSubmittingRequest ? 'Submitting…' : 'Submit Request for Review'}
              </button>
            </form>
          )}

          {/* Already requested status tags */}
          {order.returnRequests && order.returnRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-beige/50 border border-beige text-xs space-y-1">
              <span className="font-semibold text-charcoal">Return Request Status:</span>
              <p className="text-charcoal/70">
                Status: {order.returnRequests[0].status} • Reason: {order.returnRequests[0].reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage

