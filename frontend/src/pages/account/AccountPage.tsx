import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { Address } from '../../types'

const AccountPage: React.FC = () => {
  const { user, logout, isAdmin } = useAuthStore()
  const queryClient = useQueryClient()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
  })
  const [profileSuccess, setProfileSuccess] = useState('')

  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    isDefault: true,
  })
  const [addressError, setAddressError] = useState('')

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading } = useQuery<{
    addresses: Address[]
  }>({
    queryKey: ['user-addresses'],
    queryFn: async () => {
      const res = await api.get('/users/addresses')
      return res.data
    },
  })

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await api.put('/users/profile', data)
      return res.data
    },
    onSuccess: (data) => {
      setProfileSuccess('Profile updated successfully.')
      setIsEditingProfile(false)
      setTimeout(() => setProfileSuccess(''), 3000)
    },
  })

  // Address create mutation
  const addressMutation = useMutation({
    mutationFn: async (data: typeof addressForm) => {
      const res = await api.post('/users/addresses', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      setIsAddingAddress(false)
      setAddressForm({
        fullName: '',
        phone: '',
        line1: '',
        line2: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        isDefault: false,
      })
      setAddressError('')
    },
    onError: (err: any) => {
      setAddressError(err.response?.data?.message || 'Could not save address.')
    },
  })

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/users/addresses/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
    },
  })

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-5xl">
        {/* Welcome Banner */}
        <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="badge bg-forest/10 text-forest text-xs mb-2">
              Botanique Customer
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              Welcome, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="btn-secondary text-xs py-2 px-4">
                <Shield size={14} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <Link to="/account/orders" className="btn-primary text-xs py-2.5 px-5">
              <Package size={14} />
              <span>View Orders</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-xs font-medium text-charcoal/70 hover:text-red-700 transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ─── Profile Column ───────────────────────────────────── */}
          <div className="bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
                <User size={18} className="text-forest" />
                <span>Personal Profile</span>
              </h2>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-forest hover:underline"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  profileMutation.mutate(profileForm)
                }}
                className="space-y-4"
              >
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Mobile number"
                    className="input text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="btn-primary w-full justify-center text-xs py-2.5"
                >
                  {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs text-charcoal/80">
                <div>
                  <span className="text-charcoal/50 block text-[11px]">Name</span>
                  <span className="font-medium text-charcoal">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px]">Email</span>
                  <span className="font-medium text-charcoal">{user?.email}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px]">Account Type</span>
                  <span className="font-medium text-charcoal capitalize">
                    {user?.role?.toLowerCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ─── Addresses Column ─────────────────────────────────── */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-beige shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-charcoal flex items-center gap-2">
                <MapPin size={18} className="text-forest" />
                <span>Delivery Addresses</span>
              </h2>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="btn-secondary text-xs py-1.5 px-3.5 inline-flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addressMutation.mutate(addressForm)
                }}
                className="p-5 rounded-2xl bg-cream border border-beige space-y-4"
              >
                <h3 className="font-serif text-sm font-medium text-charcoal">
                  Add Delivery Address
                </h3>

                {addressError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {addressError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Contact Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      required
                      placeholder="Receiver's name"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">Contact Phone *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      required
                      placeholder="10-digit phone"
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                    required
                    placeholder="House/Flat, Building, Street"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                    placeholder="Apartment, Landmark"
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      required
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                      required
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label">PIN Code *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm((p) => ({ ...p, pincode: e.target.value }))
                      }
                      required
                      placeholder="560001"
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))
                    }
                    className="rounded border-beige text-forest focus:ring-forest"
                  />
                  <label htmlFor="isDefault" className="text-xs text-charcoal cursor-pointer">
                    Set as default delivery address
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addressMutation.isPending}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {addressMutation.isPending ? 'Saving…' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addressesLoading ? (
              <div className="h-32 bg-cream/70 rounded-xl animate-pulse" />
            ) : addressesData?.addresses && addressesData.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addressesData.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-xl border border-beige bg-cream/30 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-medium text-charcoal">
                        {addr.name || (addr as any).fullName}
                      </span>
                      {addr.isDefault && (
                        <span className="badge bg-forest text-cream text-[10px]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal/70 leading-relaxed font-light">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                      <br />
                      {addr.city}, {addr.state} — {addr.pincode}
                      <br />
                      Phone: {addr.phone}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => deleteAddressMutation.mutate(addr.id)}
                        className="text-xs text-charcoal/50 hover:text-red-700 transition-colors p-1"
                        title="Delete Address"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-charcoal/60">
                No saved addresses yet. Click "Add New Address" to save your shipping details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage

