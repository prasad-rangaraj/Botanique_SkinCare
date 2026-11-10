import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Leaf,
  Shield,
  Headphones,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  RotateCcw,
  Settings,
  ExternalLink,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const AdminNavbar: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { user, isAdmin, logout } = useAuthStore()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUserDropdownOpen(false)
    setMobileMenuOpen(false)
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', to: '/admin/orders', icon: Package },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Returns', to: '/admin/requests', icon: RotateCcw },
    ...(isAdmin ? [{ label: 'Settings', to: '/admin/settings', icon: Settings }] : []),
  ]

  const userInitials =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'AD'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-beige/90 shadow-xs">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* ─── Left: Brand Logo & Role Pill ────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Leaf size={18} />
              </div>
              <div className="flex flex-col shrink-0">
                <span className="font-serif tracking-wider text-base font-semibold leading-none text-charcoal whitespace-nowrap">
                  BOTANIQUE
                </span>
                <span className="text-[9px] tracking-widest uppercase text-charcoal/50 font-medium mt-0.5 whitespace-nowrap">
                  Management
                </span>
              </div>
            </Link>

            {/* Clean Role Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-cream/70 border-beige whitespace-nowrap shrink-0">
              {isAdmin ? (
                <>
                  <Shield size={12} className="text-amber-600 shrink-0" />
                  <span className="text-amber-900 font-semibold leading-none">Founder & Owner</span>
                </>
              ) : (
                <>
                  <Headphones size={12} className="text-blue-600 shrink-0" />
                  <span className="text-blue-900 font-semibold leading-none">Operations Staff</span>
                </>
              )}
            </div>
          </div>

          {/* ─── Center: Desktop Navigation Tabs ─────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1 bg-cream/70 p-1 rounded-full border border-beige/80 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-xs font-semibold'
                        : 'text-charcoal/70 hover:text-charcoal hover:bg-white/80'
                    }`
                  }
                >
                  <Icon size={14} className="opacity-90 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* ─── Right: View Storefront + User Profile Dropdown ───────── */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Storefront Pill */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal/70 hover:text-forest hover:bg-forest/5 border border-beige hover:border-forest/20 transition-all whitespace-nowrap shrink-0"
              title="Open customer storefront in a new tab"
            >
              <span className="whitespace-nowrap">View Store</span>
              <ExternalLink size={12} className="shrink-0" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-cream/60 hover:bg-cream border border-beige transition-all focus:outline-none focus:ring-2 focus:ring-forest/20 whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-full bg-forest text-cream flex items-center justify-center font-semibold text-xs shadow-xs shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="text-xs font-semibold text-charcoal leading-tight whitespace-nowrap">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[10px] text-charcoal/50 leading-tight whitespace-nowrap">
                    {isAdmin ? 'Admin' : 'Staff'}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-charcoal/50 transition-transform shrink-0 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Card */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-charcoal shadow-xl border border-beige p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Account Header */}
                  <div className="px-3 py-2.5 bg-cream/50 rounded-xl border border-beige/60 mb-1">
                    <p className="text-xs font-semibold text-charcoal truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-charcoal/60 truncate mt-0.5">{user?.email}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                        isAdmin
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {isAdmin ? 'Founder & Owner (Admin)' : 'Customer Care & Operations Staff'}
                    </span>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1 text-xs space-y-0.5">
                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cream/70 text-charcoal/80 hover:text-charcoal transition-colors font-medium whitespace-nowrap"
                    >
                      <User size={14} className="text-forest shrink-0" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cream/70 text-charcoal/80 hover:text-charcoal transition-colors font-medium whitespace-nowrap"
                    >
                      <ExternalLink size={14} className="text-forest shrink-0" />
                      <span>Customer Storefront</span>
                    </Link>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-1 mt-1 border-t border-beige/80">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-700 hover:bg-red-50 font-medium transition-colors text-left whitespace-nowrap"
                    >
                      <LogOut size={14} className="shrink-0" />
                      <span>Sign Out from Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal/70 hover:text-charcoal hover:bg-cream lg:hidden focus:outline-none shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Navigation Drawer ────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-beige space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-forest text-white font-semibold'
                        : 'text-charcoal/70 hover:text-charcoal hover:bg-cream'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}

            <div className="pt-2 border-t border-beige flex items-center justify-between px-3 text-xs">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-forest hover:underline inline-flex items-center gap-1 py-1 font-medium whitespace-nowrap"
              >
                <span>View Storefront</span>
                <ExternalLink size={12} className="shrink-0" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-red-700 hover:text-red-800 font-medium inline-flex items-center gap-1 py-1 whitespace-nowrap"
              >
                <LogOut size={12} className="shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminNavbar
