import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
      })
      navigate('/account')
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-cream min-h-[85vh] flex items-center justify-center py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-beige shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-4">
            <Leaf size={22} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mb-2">
            Create an Account
          </h1>
          <p className="text-xs text-charcoal/60">
            Join Botanique for simple checkout, order tracking, and ritual discovery.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First"
                  className="input pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Last"
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Phone (Optional)</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Password (Min 8 characters) *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm Password *</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input pl-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center text-xs py-3.5"
            >
              <span>{isLoading ? 'Creating Account…' : 'Register Account'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-beige text-center">
          <p className="text-xs text-charcoal/70">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-forest hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

