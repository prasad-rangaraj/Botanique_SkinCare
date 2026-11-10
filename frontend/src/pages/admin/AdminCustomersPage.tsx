import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  Package,
  Calendar,
  X,
  MapPin,
} from 'lucide-react'
import api from '../../lib/api'

const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ customers: any[]; pagination: any }>({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      const params: Record<string, any> = { limit: 50 }
      if (search) params.search = search
      const res = await api.get('/admin/customers', { params })
      return res.data
    },
  })

  // Customer details query
  const { data: customerDetailData, isLoading: detailLoading } = useQuery<{
    customer: any
  }>({
    queryKey: ['admin-customer-detail', selectedCustomerId],
    queryFn: async () => {
      const res = await api.get(`/admin/customers/${selectedCustomerId}`)
      return res.data
    },
    enabled: !!selectedCustomerId,
  })

  const customers = data?.customers || []
  const selectedCustomer = customerDetailData?.customer

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
          <Link to="/admin" className="hover:text-forest transition-colors">Overview</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Customers</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-charcoal">
              Customer Accounts
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Registered customers, addresses, and individual transaction histories.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-xs py-2 bg-white"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm">
          {isLoading ? (
            <div className="h-64 bg-cream/70 rounded-2xl animate-pulse" />
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-beige text-charcoal/50 font-medium">
                    <th className="pb-3">Customer Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Total Orders</th>
                    <th className="pb-3">Joined On</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige/60">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 font-semibold text-charcoal">
                        {cust.firstName} {cust.lastName}
                      </td>
                      <td className="py-3 text-charcoal/70">{cust.email}</td>
                      <td className="py-3 text-charcoal/60">{cust.phone || '—'}</td>
                      <td className="py-3">
                        <span className="badge bg-forest/10 text-forest text-[11px] font-medium">
                          {cust._count?.orders || 0} orders
                        </span>
                      </td>
                      <td className="py-3 text-charcoal/50 whitespace-nowrap">
                        {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className="btn-secondary text-[11px] py-1 px-3"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-charcoal/60 py-8 text-center">
              No registered customers found.
            </p>
          )}
        </div>

        {/* ─── Customer Details Modal ─────────────────────────────── */}
        {selectedCustomerId && (
          <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-cream w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-beige shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-beige">
                <h2 className="font-serif text-xl font-medium text-charcoal">
                  Customer Profile
                </h2>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-1 rounded-full hover:bg-beige"
                >
                  <X size={18} />
                </button>
              </div>

              {detailLoading || !selectedCustomer ? (
                <div className="h-48 bg-white rounded-2xl animate-pulse" />
              ) : (
                <div className="space-y-6 text-xs">
                  {/* Basic Info */}
                  <div className="p-4 rounded-2xl bg-white border border-beige grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-charcoal/50 block text-[10px]">Name</span>
                      <span className="font-semibold text-charcoal">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block text-[10px]">Email</span>
                      <span className="text-charcoal">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block text-[10px]">Phone</span>
                      <span className="text-charcoal">{selectedCustomer.phone || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block text-[10px]">Role</span>
                      <span className="font-medium text-forest uppercase">
                        {selectedCustomer.role}
                      </span>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-sm font-medium text-charcoal">
                      Saved Delivery Addresses
                    </h3>
                    {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCustomer.addresses.map((a: any) => (
                          <div key={a.id} className="p-3 rounded-xl bg-white border border-beige text-charcoal/80">
                            <span className="font-semibold block">{a.fullName}</span>
                            <p>{a.line1}</p>
                            <p>{a.city}, {a.state} — {a.pincode}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal/50">No saved addresses.</p>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="space-y-2">
                    <h3 className="font-serif text-sm font-medium text-charcoal">
                      Recent Orders
                    </h3>
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      <div className="divide-y divide-beige bg-white rounded-2xl border border-beige p-4">
                        {selectedCustomer.orders.map((o: any) => (
                          <div key={o.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <span className="font-mono font-medium text-charcoal">{o.orderRef}</span>
                              <span className="text-[10px] text-charcoal/50 block">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-serif font-semibold text-charcoal">
                                ₹{Number(o.total).toLocaleString('en-IN')}
                              </span>
                              <span className="badge bg-stone-100 text-stone-800 text-[10px] block mt-0.5">
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal/50">No orders placed by this customer yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCustomersPage

