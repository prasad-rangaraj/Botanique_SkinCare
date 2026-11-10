import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  RotateCcw,
  Sliders,
  Settings,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isStaff } = useAuthStore()
  const { data, isLoading, error } = useQuery<{
    stats: {
      totalOrders: number
      totalCustomers: number
      pendingOrders: number
      totalRevenue: number
      pendingReturns: number
      pendingRefunds: number
    }
    recentOrders: any[]
    topProducts: any[]
  }>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard')
      return res.data
    },
  })

  const stats = data?.stats
  const recentOrders = data?.recentOrders || []
  const topProducts = data?.topProducts || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-beige">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              {isAdmin ? 'Store Executive Overview' : 'Operations & Fulfillment Desk'}
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Welcome back, <strong>{user?.firstName} {user?.lastName}</strong>. Real-time metrics and order fulfillment status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {stats?.pendingOrders ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <Clock size={13} className="text-amber-600" />
                <span>{stats.pendingOrders} Orders Pending Fulfillment</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>All Orders Dispatched</span>
              </span>
            )}
            <Link
              to="/admin/orders"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
            >
              <Package size={14} />
              <span>Process Orders</span>
            </Link>
          </div>
        </div>

        {/* ─── Metric Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-xs font-medium">Total Revenue</span>
              <div className="p-2 rounded-xl bg-forest/10 text-forest">
                <span className="font-serif font-bold text-xs">₹</span>
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal">
              ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-sage font-medium block">
              Confirmed Paid Orders
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-xs font-medium">Total Orders</span>
              <div className="p-2 rounded-xl bg-forest/10 text-forest">
                <Package size={16} />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal">
              {stats?.totalOrders || 0}
            </p>
            <span className="text-[11px] text-charcoal/50 block">All recorded transactions</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-xs font-medium">Pending Orders</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Clock size={16} />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal">
              {stats?.pendingOrders || 0}
            </p>
            <span className="text-[11px] text-amber-700 font-medium block">
              Requires fulfillment action
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-2">
            <div className="flex items-center justify-between text-charcoal/60">
              <span className="text-xs font-medium">Registered Customers</span>
              <div className="p-2 rounded-xl bg-forest/10 text-forest">
                <Users size={16} />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-charcoal">
              {stats?.totalCustomers || 0}
            </p>
            <span className="text-[11px] text-charcoal/50 block">Customer accounts</span>
          </div>
        </div>

        {/* ─── Grid: Recent Orders & Top Products ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-charcoal">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-forest hover:underline">
                View All Orders →
              </Link>
            </div>

            {isLoading ? (
              <div className="h-48 bg-cream/70 rounded-xl animate-pulse" />
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-beige text-charcoal/50 font-medium">
                      <th className="pb-3">Reference</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige/60">
                    {recentOrders.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 font-mono font-medium text-charcoal">
                          <Link to={`/admin/orders`} className="hover:underline text-forest">
                            {ord.orderRef}
                          </Link>
                        </td>
                        <td className="py-3 text-charcoal/80">
                          {ord.user?.firstName} {ord.user?.lastName}
                          <span className="block text-[10px] text-charcoal/50">
                            {ord.user?.email}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="badge bg-stone-100 text-stone-800 text-[10px]">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-serif font-semibold text-charcoal">
                          ₹{Number(ord.total).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-charcoal/60 py-6 text-center">
                No orders recorded yet.
              </p>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-charcoal">Top Formulations</h2>
              <Link to="/admin/products" className="text-xs text-forest hover:underline">
                Manage →
              </Link>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((tp: any, index: number) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-cream/50 border border-beige flex items-center justify-between text-xs"
                  >
                    <div>
                      <h3 className="font-medium text-charcoal">
                        {tp.product?.name || 'Botanical Product'}
                      </h3>
                      <p className="text-[10px] text-charcoal/50">
                        {tp.product?.size} {tp.product?.unit}
                      </p>
                    </div>
                    <span className="badge bg-forest/10 text-forest font-semibold text-xs">
                      {tp.totalSold || 0} sold
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-charcoal/60 py-8 text-center">
                Sales statistics will appear as orders are fulfilled.
              </p>
            )}

            {/* Quick Links */}
            <div className="pt-4 border-t border-beige space-y-2 text-xs">
              <Link
                to="/admin/settings"
                className="p-3 rounded-xl border border-beige flex items-center justify-between text-charcoal hover:bg-cream/60 transition-colors"
              >
                <span>Shipping Zones & Charges</span>
                <ChevronRight size={14} className="text-sage" />
              </Link>
              <Link
                to="/admin/requests"
                className="p-3 rounded-xl border border-beige flex items-center justify-between text-charcoal hover:bg-cream/60 transition-colors"
              >
                <span>Pending Return & Refund Requests</span>
                <ChevronRight size={14} className="text-sage" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

