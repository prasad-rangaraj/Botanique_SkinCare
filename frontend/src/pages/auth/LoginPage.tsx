import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/account'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      const user = useAuthStore.getState().user
      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        navigate('/admin')
      } else {
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-beige shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-4">
            <Leaf size={22} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mb-2">
            Welcome to Botanique
          </h1>
          <p className="text-xs text-charcoal/60">
            Sign in to access your orders, saved addresses, and ritual wishlist.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="input pl-10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input pl-10 text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center text-xs py-3.5"
            >
              <span>{isLoading ? 'Signing In…' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-beige text-center space-y-3">
          <p className="text-xs text-charcoal/70">
            Do not have an account yet?{' '}
            <Link to="/register" className="font-medium text-forest hover:underline">
              Create an Account
            </Link>
          </p>
          <div className="text-[11px] text-charcoal/50">
            Default Admin credentials for development:{' '}
            <span className="font-mono text-charcoal/70">admin@botanique.in</span> /{' '}
            <span className="font-mono text-charcoal/70">Admin@Botanique2024</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

