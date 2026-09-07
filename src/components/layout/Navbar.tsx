import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, LogOut, User, BookOpen, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardRoute =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'mentor'
        ? '/mentor/dashboard'
        : '/dashboard';

  // Automatically close any open mobile drawer or notification dropdown on route change / back navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname, location.search]);

  // Scroll event detector to compress navbar height and inject shadows
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Curriculum' },
    // { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/resources', label: 'Resources' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-stone-950/90 backdrop-blur-md py-3 shadow-2xl border-b border-stone-850'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* =========================================================
                LEFT: OXYFIED BRANDING
                OX logo + "yfied" text
            ========================================================== */}
            <Link
              to="/"
              className="flex items-center group"
              aria-label="Oxyfied Home"
            >
              {/* OX Logo */}
              <img
                src="/oxyfied.png"
                alt="OX"
                className="h-5 sm:h-6 md:h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />

              {/* yfied Text */}
              <span
                className="ml-0 font-display font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight text-white group-hover:text-stone-200 transition-colors duration-300"
              >
                fied
              </span>
            </Link>

            {/* =========================================================
                DESKTOP NAVIGATION
            ========================================================== */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-all hover:text-amber-400 ${
                      isActive
                        ? 'text-amber-400 font-semibold'
                        : 'text-stone-300'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* =========================================================
                RIGHT: SEARCH + AUTH
            ========================================================== */}
            <div className="hidden lg:flex items-center gap-4">

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 bg-stone-900/60 border border-stone-800 rounded-full py-1.5 pl-4 pr-10 text-xs focus:w-60 focus:bg-stone-900 focus:border-amber-500 focus:outline-none transition-all duration-300 text-white placeholder-stone-500"
                />

                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Login / Dashboard */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 border-l border-stone-800 pl-4">

                  {/* Notification Bell Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(prev => !prev)}
                      className={`p-2 rounded-full transition-all relative ${
                        isNotificationsOpen 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                      }`}
                      aria-label="View notifications"
                      title="Notifications"
                    >
                      <Bell className="w-4.5 h-4.5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-stone-950 text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    <NotificationDropdown
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                      onUnreadChange={(count) => setUnreadCount(count)}
                    />
                  </div>

                  <Link
                    to={dashboardRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition-colors shadow"
                  >
                    <BookOpen className="w-4 h-4" />

                    {user?.role === 'admin'
                      ? 'Admin Panel'
                      : user?.role === 'mentor'
                        ? 'Mentor Hub'
                        : 'LMS Dashboard'}
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-stone-400 hover:text-red-450 transition-colors rounded-lg hover:bg-stone-900/40"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">

                  <Link
                    to="/login"
                    className="text-xs font-medium text-stone-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition-colors shadow"
                  >
                    Get Started
                  </Link>

                </div>
              )}
            </div>

            {/* =========================================================
                MOBILE CONTROLS
            ========================================================== */}
            <div className="lg:hidden flex items-center gap-3">

              {isAuthenticated && (
                <Link
                  to={dashboardRoute}
                  className="p-2 text-slate-300 hover:text-royal-blue-400 transition-colors"
                  title="My Dashboard"
                  aria-label="My Dashboard"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              <button
                onClick={() =>
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                }
                className="p-1.5 text-slate-300 hover:text-white transition-colors focus:outline-none"
                aria-label={
                  isMobileMenuOpen
                    ? 'Close menu'
                    : 'Open menu'
                }
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 animate-pulse" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* ===============================================================
          MOBILE MENU DRAWER
      ================================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-stone-950 flex flex-col pt-24 px-6 lg:hidden">

          {/* Mobile Logo + yfied */}
          <div className="flex items-center justify-center mb-8">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center group"
              aria-label="Oxyfied Home"
            >
              <img
                src="/oxyfied.png"
                alt="OX"
                className="h-12 w-auto object-contain"
              />

              <span className="ml-0 font-display font-extrabold text-2xl tracking-tight text-white">
                yfied
              </span>
            </Link>
          </div>

          {/* Mobile Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative mb-6"
          >
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900/90 border border-stone-850 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-amber-500 focus:outline-none text-white"
            />

            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-5 mb-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base font-semibold tracking-wide ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-stone-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Auth */}
          <div className="border-t border-stone-850 pt-6 mt-auto pb-10 flex flex-col gap-4">

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardRoute}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-center font-bold text-sm shadow"
                >
                  Go to Dashboard
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-stone-900 border border-stone-800 text-stone-300 rounded-xl text-center font-semibold text-sm hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 border border-stone-850 text-stone-300 hover:text-white rounded-xl text-center font-medium text-sm"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-center font-bold text-sm shadow"
                >
                  Get Started
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
};
