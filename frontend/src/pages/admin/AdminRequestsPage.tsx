import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'
import api from '../../lib/api'

const AdminRequestsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'returns' | 'refunds' | 'replacements'>('returns')
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})
  const [actionSuccess, setActionSuccess] = useState('')

  const { data, isLoading } = useQuery<{
    returns: any[]
    refunds: any[]
    replacements: any[]
  }>({
    queryKey: ['admin-post-order-requests'],
    queryFn: async () => {
      const res = await api.get('/admin/requests')
      return res.data
    },
  })

  // Mutation for updating request status
  const updateRequestMutation = useMutation({
    mutationFn: async ({
      type,
      id,
      status,
      note,
    }: {
      type: 'return' | 'refund' | 'replacement'
      id: string
      status: 'APPROVED' | 'REJECTED'
      note?: string
    }) => {
      const res = await api.patch(`/admin/requests/${type}/${id}`, {
        status,
        adminNote: note,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-post-order-requests'] })
      setActionSuccess('Request updated successfully.')
      setTimeout(() => setActionSuccess(''), 2500)
    },
  })

  const returns = data?.returns || []
  const refunds = data?.refunds || []
  const replacements = data?.replacements || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl space-y-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-forest transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div>
          <h1 className="font-serif text-3xl font-medium text-charcoal">
            Customer Claims & Returns Desk
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Review and adjudicate return, refund, and replacement requests according to
            Botanique policy.
          </p>
        </div>

        {/* Policy notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Proposed Return Policy Reference:</strong> Currently, review is limited
            to unopened and unused products within 7 calendar days of delivery. Never
            automatically approve refunds or cancellations without verifying batch and return
            receipts.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-beige gap-4">
          <button
            onClick={() => setActiveTab('returns')}
            className={`pb-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'returns'
                ? 'border-forest text-forest font-semibold'
                : 'border-transparent text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Return Requests ({returns.length})
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`pb-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'refunds'
                ? 'border-forest text-forest font-semibold'
                : 'border-transparent text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Refund Requests ({refunds.length})
          </button>
          <button
            onClick={() => setActiveTab('replacements')}
            className={`pb-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'replacements'
                ? 'border-forest text-forest font-semibold'
                : 'border-transparent text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Replacement Requests ({replacements.length})
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-4">
          {isLoading ? (
            <div className="h-48 bg-cream/70 rounded-2xl animate-pulse" />
          ) : (
            <>
              {activeTab === 'returns' && (
                <div className="space-y-4">
                  {returns.length > 0 ? (
                    returns.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border border-beige bg-cream/30 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-charcoal">
                            Order: {req.order?.orderRef}
                          </span>
                          <span className="badge bg-stone-100 text-stone-800">{req.status}</span>
                        </div>
                        <p className="text-charcoal/80">
                          <strong>Customer:</strong> {req.order?.user?.firstName}{' '}
                          {req.order?.user?.lastName} ({req.order?.user?.email})
                        </p>
                        <p className="text-charcoal/80">
                          <strong>Reason stated:</strong> {req.reason}
                        </p>
                        {req.status === 'PENDING' && (
                          <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Internal admin evaluation note…"
                              value={adminNote[req.id] || ''}
                              onChange={(e) =>
                                setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              className="input text-xs py-1.5 flex-1 bg-white"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'return',
                                    id: req.id,
                                    status: 'APPROVED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-primary text-[11px] py-1.5 px-3 bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'return',
                                    id: req.id,
                                    status: 'REJECTED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-secondary text-[11px] py-1.5 px-3 text-red-700 border-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-xs text-charcoal/50">
                      No return requests logged.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'refunds' && (
                <div className="space-y-4">
                  {refunds.length > 0 ? (
                    refunds.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border border-beige bg-cream/30 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-charcoal">
                            Order: {req.order?.orderRef}
                          </span>
                          <span className="badge bg-stone-100 text-stone-800">{req.status}</span>
                        </div>
                        <p className="text-charcoal/80">
                          <strong>Customer:</strong> {req.order?.user?.firstName}{' '}
                          {req.order?.user?.lastName} ({req.order?.user?.email})
                        </p>
                        <p className="text-charcoal/80">
                          <strong>Claimed Amount:</strong> ₹{Number(req.amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-charcoal/80">
                          <strong>Reason:</strong> {req.reason}
                        </p>
                        {req.status === 'PENDING' && (
                          <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Admin approval reference…"
                              value={adminNote[req.id] || ''}
                              onChange={(e) =>
                                setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              className="input text-xs py-1.5 flex-1 bg-white"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'refund',
                                    id: req.id,
                                    status: 'APPROVED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-primary text-[11px] py-1.5 px-3 bg-green-700"
                              >
                                Authorize Refund
                              </button>
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'refund',
                                    id: req.id,
                                    status: 'REJECTED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-secondary text-[11px] py-1.5 px-3 text-red-700 border-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-xs text-charcoal/50">
                      No refund requests logged.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'replacements' && (
                <div className="space-y-4">
                  {replacements.length > 0 ? (
                    replacements.map((req) => (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl border border-beige bg-cream/30 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-charcoal">
                            Order: {req.order?.orderRef}
                          </span>
                          <span className="badge bg-stone-100 text-stone-800">{req.status}</span>
                        </div>
                        <p className="text-charcoal/80">
                          <strong>Customer:</strong> {req.order?.user?.firstName}{' '}
                          {req.order?.user?.lastName} ({req.order?.user?.email})
                        </p>
                        <p className="text-charcoal/80">
                          <strong>Reason for replacement:</strong> {req.reason}
                        </p>
                        {req.status === 'PENDING' && (
                          <div className="pt-2 flex flex-col sm:flex-row gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Replacement dispatch note…"
                              value={adminNote[req.id] || ''}
                              onChange={(e) =>
                                setAdminNote((prev) => ({ ...prev, [req.id]: e.target.value }))
                              }
                              className="input text-xs py-1.5 flex-1 bg-white"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'replacement',
                                    id: req.id,
                                    status: 'APPROVED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-primary text-[11px] py-1.5 px-3 bg-green-700"
                              >
                                Approve Replacement
                              </button>
                              <button
                                onClick={() =>
                                  updateRequestMutation.mutate({
                                    type: 'replacement',
                                    id: req.id,
                                    status: 'REJECTED',
                                    note: adminNote[req.id],
                                  })
                                }
                                className="btn-secondary text-[11px] py-1.5 px-3 text-red-700 border-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-xs text-charcoal/50">
                      No replacement requests logged.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminRequestsPage

