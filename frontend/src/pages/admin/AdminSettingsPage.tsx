import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings,
  Truck,
  HelpCircle,
  Shield,
  Save,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

const AdminSettingsPage: React.FC = () => {
  const { isAdmin } = useAuthStore()
  const queryClient = useQueryClient()
  const [successMsg, setSuccessMsg] = useState('')

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'BOTANIQUE',
    announcement_text: 'Free delivery on orders above ₹999 within Bengaluru',
    announcement_active: 'true',
    support_email: 'care@botanique.in',
    support_phone: '+91 80 1234 5678',
    returns_policy_active: 'false',
  })

  // Shipping zone form
  const [newZone, setNewZone] = useState({
    name: '',
    deliveryCharge: '80',
    estimatedDays: '4–8 business days',
    pincodesText: '',
  })
  const [showAddZone, setShowAddZone] = useState(false)

  // Fetch site settings
  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings')
      if (res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }))
      }
      return res.data
    },
  })

  // Fetch shipping zones
  const { data: zonesData } = useQuery<{ zones: any[] }>({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const res = await api.get('/admin/shipping-zones')
      return res.data
    },
  })

  // Fetch audit logs
  const { data: auditData } = useQuery<{ logs: any[] }>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs')
      return res.data
    },
  })

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/admin/settings', settings)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setSuccessMsg('Site settings updated successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  // Add shipping zone mutation
  const addZoneMutation = useMutation({
    mutationFn: async () => {
      const pincodes = newZone.pincodesText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
      const res = await api.post('/admin/shipping-zones', {
        name: newZone.name,
        deliveryCharge: parseFloat(newZone.deliveryCharge),
        estimatedDays: newZone.estimatedDays,
        pincodes,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
      setShowAddZone(false)
      setNewZone({
        name: '',
        deliveryCharge: '80',
        estimatedDays: '4–8 business days',
        pincodesText: '',
      })
      setSuccessMsg('Shipping zone added.')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  // Delete shipping zone
  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/shipping-zones/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
    },
  })

  const zones = zonesData?.zones || []
  const auditLogs = auditData?.logs || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="page-container max-w-7xl space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50">
          <Link to="/admin" className="hover:text-forest transition-colors">Overview</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">Settings & Zones</span>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-medium text-charcoal">
            Store Settings & Operations
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Configure site-wide banners, contact channels, delivery zones, and audit security logs.
          </p>
        </div>

        {!isAdmin && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <Shield size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">Read-Only View for Staff</p>
              <p className="text-amber-700 mt-0.5">
                You are logged in as Customer Care & Operations Staff. Site settings, return policies, and shipping zones can only be modified by the Founder & Owner (Admin).
              </p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ─── Site Settings Form ───────────────────────────────── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-beige">
              <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
                <Settings size={18} className="text-forest" />
                <span>General Site Settings</span>
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Announcement Bar Text</label>
                <input
                  type="text"
                  value={settings.announcement_text || ''}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, announcement_text: e.target.value }))
                  }
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcement_active === 'true'}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        announcement_active: e.target.checked ? 'true' : 'false',
                      }))
                    }
                    className="rounded border-beige text-forest"
                  />
                  <span>Display announcement banner on top of website</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="label">Customer Care Email</label>
                  <input
                    type="email"
                    value={settings.support_email || ''}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, support_email: e.target.value }))
                    }
                    placeholder="care@botanique.in"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Customer Care Phone</label>
                  <input
                    type="text"
                    value={settings.support_phone || ''}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, support_phone: e.target.value }))
                    }
                    placeholder="+91 80 1234 5678"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-beige">
                <label className="flex items-start gap-2 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.returns_policy_active === 'true'}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        returns_policy_active: e.target.checked ? 'true' : 'false',
                      }))
                    }
                    className="rounded border-beige text-forest mt-0.5"
                  />
                  <span>
                    <strong>Approve Proposed Return Policy for Public Display:</strong> Formally
                    publishes the 7-day unopened return review rule across customer touchpoints.
                  </span>
                </label>
              </div>

              <button
                onClick={() => saveSettingsMutation.mutate()}
                disabled={saveSettingsMutation.isPending || !isAdmin}
                title={!isAdmin ? 'Restricted to Founder & Admin' : undefined}
                className={`btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 mt-2 ${
                  !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save size={14} />
                <span>
                  {saveSettingsMutation.isPending
                    ? 'Saving…'
                    : !isAdmin
                    ? 'Admin Access Required to Save'
                    : 'Save General Settings'}
                </span>
              </button>
            </div>
          </div>

          {/* ─── Shipping Zones ───────────────────────────────────── */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-beige">
              <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
                <Truck size={18} className="text-forest" />
                <span>Shipping Zones & Delivery Fees</span>
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowAddZone(!showAddZone)}
                  className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add Zone</span>
                </button>
              )}
            </div>

            {/* Add Zone Form */}
            {showAddZone && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addZoneMutation.mutate()
                }}
                className="p-4 rounded-2xl bg-cream border border-beige space-y-3 text-xs"
              >
                <div>
                  <label className="label">Zone Name *</label>
                  <input
                    type="text"
                    value={newZone.name}
                    onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., South India Express"
                    required
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Delivery Fee (INR)</label>
                    <input
                      type="number"
                      value={newZone.deliveryCharge}
                      onChange={(e) =>
                        setNewZone((p) => ({ ...p, deliveryCharge: e.target.value }))
                      }
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Estimated Window</label>
                    <input
                      type="text"
                      value={newZone.estimatedDays}
                      onChange={(e) =>
                        setNewZone((p) => ({ ...p, estimatedDays: e.target.value }))
                      }
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Comma-Separated PIN Codes (Optional)</label>
                  <input
                    type="text"
                    value={newZone.pincodesText}
                    onChange={(e) =>
                      setNewZone((p) => ({ ...p, pincodesText: e.target.value }))
                    }
                    placeholder="560001, 560002, 560038"
                    className="input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddZone(false)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Create Zone
                  </button>
                </div>
              </form>
            )}

            {/* Zones List */}
            <div className="space-y-3">
              {zones.map((z: any) => (
                <div
                  key={z.id}
                  className="p-4 rounded-2xl border border-beige bg-cream/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-semibold text-charcoal">{z.name}</h3>
                    <p className="text-charcoal/60">
                      Fee: {Number(z.deliveryCharge) === 0 ? 'Free' : `₹${z.deliveryCharge}`} • Window: {z.estimatedDays}
                    </p>
                    <p className="text-[10px] text-charcoal/50">
                      {z.pincodes?.length ? `${z.pincodes.length} dedicated PIN codes` : 'All general PIN codes'}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deleteZoneMutation.mutate(z.id)}
                      className="text-charcoal/40 hover:text-red-700 p-1"
                      title="Delete Zone"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Audit Logs ─────────────────────────────────────────── */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-beige">
            <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
              <FileText size={18} className="text-forest" />
              <span>Administrative Audit Trails</span>
            </h2>
            <span className="text-xs text-charcoal/50">
              Immutable log of product & status updates
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-beige/60 text-xs">
            {auditLogs.length > 0 ? (
              auditLogs.map((log: any) => (
                <div key={log.id} className="py-2.5 flex justify-between items-center text-charcoal/80">
                  <div>
                    <span className="font-semibold text-charcoal">{log.action}</span> on{' '}
                    <span className="text-forest font-medium">{log.entity}</span>
                    {log.user && (
                      <span className="text-charcoal/50 block text-[10px]">
                        By {log.user.firstName} ({log.user.email})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-charcoal/40">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal/50 py-4 text-center">
                No recent administrative events recorded.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage

