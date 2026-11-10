import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  Truck,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  X,
} from 'lucide-react'
import api from '../../lib/api'

const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [activeShipmentModal, setActiveShipmentModal] = useState<any>(null)
  const [shipmentForm, setShipmentForm] = useState({
    courierName: 'Delhivery',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '2–5 business days',
  })
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch admin orders
  const { data, isLoading } = useQuery<{ orders: any[]; pagination: any }>({
    queryKey: ['admin-orders-list', selectedStatus],
    queryFn: async () => {
      const params: Record<string, any> = { limit: 50 }
      if (selectedStatus) params.status = selectedStatus
      const res = await api.get('/orders/admin/all', { params })
      return res.data
    },
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await api.patch(`/orders/admin/${orderId}/status`, { status })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] })
      setSuccessMsg('Order status updated.')
      setTimeout(() => setSuccessMsg(''), 2500)
    },
  })

  // Update shipment mutation
  const shipmentMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(
        `/orders/admin/${activeShipmentModal.id}/shipment`,
        shipmentForm
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] })
      setActiveShipmentModal(null)
      setSuccessMsg('Shipment details attached. Order marked as SHIPPED.')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  const openShipmentModal = (order: any) => {
    setActiveShipmentModal(order)
    setShipmentForm({
      courierName: order.shipment?.courierName || 'Delhivery',
      trackingNumber: order.shipment?.trackingNumber || '',
      trackingUrl: order.shipment?.trackingUrl || '',
      estimatedDelivery: order.shipment?.estimatedDelivery || '2–5 business days',
    })
  }

  const orders = data?.orders || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
          <Link to="/admin" className="hover:text-forest transition-colors">Overview</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Orders</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-charcoal">
              Order Fulfillment & Tracking
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Process customer orders, assign courier dispatches, and manage lifecycle states.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal/60">Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input text-xs py-2 px-3 bg-white border-beige rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Orders Table Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm">
          {isLoading ? (
            <div className="h-64 bg-cream/70 rounded-2xl animate-pulse" />
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige text-charcoal/50 font-medium">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Customer & Destination</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Shipment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 font-mono font-medium text-charcoal">
                        {order.orderRef}
                      </td>
                      <td className="py-3 text-charcoal/60 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 text-charcoal/80">
                        <span className="font-semibold block">
                          {order.user?.firstName} {order.user?.lastName}
                        </span>
                        <span className="text-[10px] text-charcoal/50 block">
                          {order.address?.city || 'Bengaluru'}, {order.address?.pincode}
                        </span>
                      </td>
                      <td className="py-3 text-charcoal/70">
                        {order.items?.length || 0}{' '}
                        {order.items?.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3 font-serif font-semibold text-charcoal">
                        ₹{Number(order.total).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: e.target.value,
                            })
                          }
                          className="text-[11px] font-medium p-1.5 rounded-lg border border-beige bg-cream/60 focus:ring-1 focus:ring-forest cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openShipmentModal(order)}
                          className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1"
                        >
                          <Truck size={12} />
                          <span>{order.shipment ? 'Edit Courier' : 'Dispatch'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-charcoal/60 py-8 text-center">
              No orders found matching the selected criteria.
            </p>
          )}
        </div>

        {/* ─── Shipment Information Modal ──────────────────────────── */}
        {activeShipmentModal && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cream w-full max-w-md rounded-3xl p-6 sm:p-8 border border-beige shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-beige">
                <div>
                  <h2 className="font-serif text-lg font-medium text-charcoal">
                    Dispatch Shipment
                  </h2>
                  <p className="text-[11px] font-mono text-charcoal/60">
                    Order: {activeShipmentModal.orderRef}
                  </p>
                </div>
                <button
                  onClick={() => setActiveShipmentModal(null)}
                  className="p-1 rounded-full hover:bg-beige"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  shipmentMutation.mutate()
                }}
                className="space-y-4"
              >
                <div>
                  <label className="label">Courier Service</label>
                  <input
                    type="text"
                    value={shipmentForm.courierName}
                    onChange={(e) =>
                      setShipmentForm((p) => ({ ...p, courierName: e.target.value }))
                    }
                    placeholder="e.g., Delhivery, Blue Dart, DTDC"
                    required
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Tracking Number / AWB</label>
                  <input
                    type="text"
                    value={shipmentForm.trackingNumber}
                    onChange={(e) =>
                      setShipmentForm((p) => ({ ...p, trackingNumber: e.target.value }))
                    }
                    placeholder="e.g., DEL123456789"
                    required
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Tracking URL (Optional)</label>
                  <input
                    type="url"
                    value={shipmentForm.trackingUrl}
                    onChange={(e) =>
                      setShipmentForm((p) => ({ ...p, trackingUrl: e.target.value }))
                    }
                    placeholder="https://track.courier.com/..."
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Estimated Delivery Window</label>
                  <input
                    type="text"
                    value={shipmentForm.estimatedDelivery}
                    onChange={(e) =>
                      setShipmentForm((p) => ({ ...p, estimatedDelivery: e.target.value }))
                    }
                    placeholder="e.g., 2–5 business days"
                    className="input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-beige">
                  <button
                    type="button"
                    onClick={() => setActiveShipmentModal(null)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={shipmentMutation.isPending}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {shipmentMutation.isPending ? 'Saving…' : 'Save & Mark Shipped'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage

