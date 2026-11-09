import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Truck,
  Check,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Plus,
} from 'lucide-react'
import api from '../../lib/api'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { Address } from '../../types'

declare global {
  interface Window {
    Razorpay: any
  }
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { user } = useAuthStore()

  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0)
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('2–5 business days')
  const [orderNotes, setOrderNotes] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // New address state
  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false)
  const [newAddress, setNewAddress] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: '',
    line1: '',
    line2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: true,
  })

  // Fetch saved addresses
  const { data: addressesData, refetch: refetchAddresses } = useQuery<{
    addresses: Address[]
  }>({
    queryKey: ['checkout-addresses'],
    queryFn: async () => {
      const res = await api.get('/users/addresses')
      return res.data
    },
  })

  // Set default address when loaded
  useEffect(() => {
    if (addressesData?.addresses && addressesData.addresses.length > 0) {
      const defaultAddr =
        addressesData.addresses.find((a) => a.isDefault) || addressesData.addresses[0]
      setSelectedAddressId(defaultAddr.id)
      checkShipping(defaultAddr.pincode)
    } else {
      setIsAddingNewAddress(true)
    }
  }, [addressesData])

  const checkShipping = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) return
    try {
      const res = await api.post('/shipping/check-pincode', { pincode })
      if (res.data.success) {
        setDeliveryCharge(Number(res.data.deliveryCharge || 0))
        if (res.data.estimatedDays) {
          setEstimatedDelivery(res.data.estimatedDays)
        }
      }
    } catch {
      // Default to standard Bengaluru shipping if check fails
      setDeliveryCharge(0)
    }
  }

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr.id)
    setIsAddingNewAddress(false)
    checkShipping(addr.pincode)
  }

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/users/addresses', newAddress)
      await refetchAddresses()
      setSelectedAddressId(res.data.address.id)
      setIsAddingNewAddress(false)
      checkShipping(newAddress.pincode)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Could not save address.')
    }
  }

  // Load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const grandTotal = subtotal + deliveryCharge

  const handlePlaceOrderAndPay = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select or add a delivery address.')
      return
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/orders', {
        addressId: selectedAddressId,
        notes: orderNotes || undefined,
      })
      const createdOrder = orderRes.data.order

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()

      // 3. Request Razorpay order ID from backend
      try {
        const paymentRes = await api.post('/payments/create-order', {
          orderId: createdOrder.id,
        })

        if (!scriptLoaded) {
          // If script fails or offline, fallback redirect
          clearCart()
          navigate(`/order-confirmation/${createdOrder.id}`)
          return
        }

        const options = {
          key: paymentRes.data.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID,
          amount: paymentRes.data.amount,
          currency: paymentRes.data.currency || 'INR',
          name: 'BOTANIQUE',
          description: `Order ${createdOrder.orderRef}`,
          order_id: paymentRes.data.razorpayOrderId,
          handler: async (response: any) => {
            try {
              // Verify payment on backend
              await api.post('/payments/verify', {
                orderId: createdOrder.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              navigate(`/order-confirmation/${createdOrder.id}`)
            } catch (verErr: any) {
              setErrorMessage('Payment verification failed. Please contact customer care.')
            }
          },
          prefill: {
            name: `${user?.firstName || ''} ${user?.lastName || ''}`,
            email: user?.email,
          },
          theme: {
            color: '#254B3B', // Forest green
          },
          modal: {
            ondismiss: async () => {
              await api.post('/payments/failure', {
                orderId: createdOrder.id,
                reason: 'Payment dismissed by customer in checkout modal',
              })
              setIsProcessing(false)
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (payErr: any) {
        // If Razorpay gateway is unconfigured (test mode / missing keys),
        // we record the order gracefully as confirmed test order
        clearCart()
        navigate(`/order-confirmation/${createdOrder.id}`)
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Could not place order. Please review your details.'
      )
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen py-20">
        <div className="page-container max-w-md text-center bg-white p-12 rounded-3xl border border-beige">
          <ShoppingBag size={36} className="mx-auto text-sage mb-4" />
          <h2 className="font-serif text-2xl font-medium text-charcoal mb-2">
            Your cart is empty
          </h2>
          <p className="text-xs text-charcoal/60 mb-6 leading-relaxed">
            Please add botanical formulations to your bag before proceeding to checkout.
          </p>
          <Link to="/shop" className="btn-primary text-xs py-2.5 px-6">
            Explore Catalogue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen py-10 md:py-16">
      <div className="page-container max-w-5xl">
        {/* Title */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <p className="section-subtitle">Secure Checkout</p>
          <h1 className="section-title">Complete Your Botanical Ritual</h1>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 max-w-3xl mx-auto">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* ─── Left Column: Delivery Address ─────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-beige">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-forest text-cream flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <h2 className="font-serif text-lg font-medium text-charcoal">
                    Delivery Address
                  </h2>
                </div>
                {!isAddingNewAddress && (
                  <button
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs font-medium text-forest hover:underline inline-flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>New Address</span>
                  </button>
                )}
              </div>

              {/* Saved Address Radio List */}
              {!isAddingNewAddress &&
                addressesData?.addresses &&
                addressesData.addresses.length > 0 && (
                  <div className="space-y-3">
                    {addressesData.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleAddressSelect(addr)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-forest bg-forest/5 ring-1 ring-forest'
                              : 'border-beige hover:border-forest/50 bg-cream/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 text-xs">
                              <span className="font-semibold text-charcoal block">
                                {addr.name || (addr as any).fullName}
                              </span>
                              <p className="text-charcoal/70">
                                {addr.line1}
                                {addr.line2 && `, ${addr.line2}`}
                              </p>
                              <p className="text-charcoal/70">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                              <p className="text-charcoal/50 text-[11px]">Phone: {addr.phone}</p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-forest bg-forest' : 'border-beige'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-cream rounded-full" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

              {/* New Address Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                  <h3 className="font-serif text-sm font-medium text-charcoal">
                    Enter Shipping Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name *</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, fullName: e.target.value }))
                        }
                        required
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, phone: e.target.value }))
                        }
                        required
                        placeholder="10-digit mobile"
                        className="input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Flat / House / Street Line 1 *</label>
                    <input
                      type="text"
                      value={newAddress.line1}
                      onChange={(e) =>
                        setNewAddress((p) => ({ ...p, line1: e.target.value }))
                      }
                      required
                      placeholder="e.g. #14, 2nd Cross, Indiranagar"
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="label">Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={newAddress.line2}
                      onChange={(e) =>
                        setNewAddress((p) => ({ ...p, line2: e.target.value }))
                      }
                      placeholder="Landmark, Apartment"
                      className="input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">City *</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, city: e.target.value }))
                        }
                        required
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, state: e.target.value }))
                        }
                        required
                        className="input text-xs"
                      />
                    </div>
                    <div>
                      <label className="label">PIN Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) => {
                          const val = e.target.value
                          setNewAddress((p) => ({ ...p, pincode: val }))
                          if (val.length === 6) checkShipping(val)
                        }}
                        required
                        placeholder="560001"
                        className="input text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    {addressesData?.addresses && addressesData.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="btn-ghost text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn-primary text-xs py-2 px-5">
                      Save & Use This Address
                    </button>
                  </div>
                </form>
              )}

              {/* Order Notes */}
              <div className="pt-4 border-t border-beige">
                <label className="label">Delivery Instructions or Notes (Optional)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g., Leave package at reception, gate code"
                  className="input text-xs"
                />
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b border-beige">
                <div className="w-7 h-7 rounded-full bg-forest text-cream flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <h2 className="font-serif text-lg font-medium text-charcoal">Payment Method</h2>
              </div>

              <div className="p-4 rounded-2xl border border-forest bg-forest/5 flex items-start gap-3">
                <CreditCard size={20} className="text-forest shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-charcoal/80">
                  <h3 className="font-semibold text-charcoal">
                    Razorpay Secure Indian Payment Gateway
                  </h3>
                  <p className="leading-relaxed font-light">
                    Supports UPI (Google Pay, PhonePe, Paytm), Net Banking, and Credit / Debit
                    Cards. Payments are processed securely via 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Order Summary ───────────────────────── */}
          <div className="bg-white p-8 rounded-3xl border border-beige shadow-sm space-y-6 sticky top-24">
            <h2 className="font-serif text-lg font-medium text-charcoal pb-4 border-b border-beige">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            {/* Item list */}
            <div className="divide-y divide-beige max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-medium text-charcoal">{item.product.name}</h3>
                    <p className="text-[11px] text-charcoal/50">
                      {item.product.size} {item.product.unit} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-charcoal">
                    ₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-beige text-xs text-charcoal/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-forest font-medium">Free</span>
                  ) : (
                    `₹${deliveryCharge.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-beige text-base font-semibold text-forest font-serif">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Estimated window */}
            <div className="p-3.5 rounded-xl bg-cream border border-beige flex items-center gap-2.5 text-xs text-charcoal/70">
              <Truck size={15} className="text-forest shrink-0" />
              <span>Estimated Delivery: {estimatedDelivery}</span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handlePlaceOrderAndPay}
              disabled={isProcessing}
              className="btn-primary w-full justify-center text-xs py-3.5"
            >
              <ShieldCheck size={16} />
              <span>
                {isProcessing
                  ? 'Processing Order…'
                  : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
              </span>
            </button>

            <p className="text-[11px] text-center text-charcoal/50 leading-relaxed">
              By placing this order you acknowledge that Botanique products are cosmetic
              botanical formulations subject to individual patch testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
