import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Leaf,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Shield,
  Headphones,
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname

  // Dynamically identify role based on email input for subtle, helpful feedback
  const detectedRole = React.useMemo(() => {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) return null
    if (cleanEmail === 'admin@botanique.in' || cleanEmail.startsWith('admin@')) {
      return {
        label: 'Founder & Admin Account',
        icon: Shield,
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      }
    }
    if (cleanEmail === 'staff@botanique.in' || cleanEmail.startsWith('staff@') || cleanEmail.includes('care@')) {
      return {
        label: 'Operations & Staff Account',
        icon: Headphones,
        color: 'text-blue-800 bg-blue-50 border-blue-200',
      }
    }
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      return {
        label: 'Customer Account',
        icon: UserIcon,
        color: 'text-forest bg-forest/5 border-forest/20',
      }
    }
    return null
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // The authentication service identifies the role from the credentials/database
      const loggedInUser = await login(email, password)

      // Automatic role-based redirection
      if (loggedInUser.role === 'ADMIN' || loggedInUser.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true })
      } else if (loggedInUser.role === 'STAFF') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from || '/account', { replace: true })
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-cream min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-beige shadow-sm w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-3">
            <Leaf size={22} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mb-1.5">
            Welcome Back
          </h1>
          <p className="text-xs text-charcoal/60">
            Sign in with your email to continue your skincare ritual.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-charcoal">Email Address</label>
              {detectedRole && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${detectedRole.color}`}
                >
                  <detectedRole.icon size={11} />
                  <span>{detectedRole.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="input pl-10 text-xs"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-charcoal">Password</label>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input pl-10 text-xs"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center text-xs py-3.5 shadow-sm"
            >
              <span>{isLoading ? 'Signing In…' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-beige text-center space-y-2">
          <p className="text-xs text-charcoal/70">
            Need a new account?{' '}
            <Link to="/register" className="font-medium text-forest hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
