import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Leaf,
  ChevronDown,
  LogOut,
  Package,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Skincare Guide', to: '/skincare-guide' },
  { label: 'Contact', to: '/contact' },
]

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const { itemCount, openCart, fetchCart } = useCartStore()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-cream/95 backdrop-blur-md shadow-sm'
          : 'bg-cream'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="BOTANIQUE Home"
          >
            <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf size={16} className="text-cream" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-forest">
              BOTANIQUE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-forest bg-sage/20'
                      : 'text-charcoal hover:text-forest hover:bg-sage/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-charcoal hover:text-forest hover:bg-sage/10 rounded-full transition-all"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Account */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-charcoal hover:text-forest hover:bg-sage/10 rounded-full transition-all flex items-center gap-1"
                aria-label="Account"
              >
                <User size={20} />
                {isAuthenticated && (
                  <ChevronDown size={12} className="hidden md:block" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-beige py-2 animate-fade-in">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-beige">
                        <p className="text-xs text-sage font-medium">Signed in as</p>
                        <p className="text-sm font-medium text-charcoal truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                      >
                        <User size={15} />
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                      >
                        <Package size={15} />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                        >
                          <Settings size={15} />
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-beige mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-charcoal hover:bg-cream transition-colors"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-charcoal hover:text-forest hover:bg-sage/10 rounded-full transition-all"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-forest text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-charcoal hover:text-forest hover:bg-sage/10 rounded-full transition-all"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sage pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, ingredients…"
                className="input pl-11"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-xs"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-beige animate-slide-up">
            <div className="pt-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'text-forest bg-sage/20'
                        : 'text-charcoal hover:text-forest hover:bg-sage/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-beige mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-charcoal hover:bg-sage/10 rounded-xl"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-charcoal hover:bg-sage/10 rounded-xl"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-charcoal hover:bg-sage/10 rounded-xl"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-charcoal hover:bg-sage/10 rounded-xl"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
