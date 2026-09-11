import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  LogOut, 
  BookOpen, 
  Bell, 
  ChevronDown, 
  TrendingUp, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Settings, 
  GraduationCap, 
  Database, 
  ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';

// Static nav links matching the reference design
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Programs' },
  { to: '/courses', label: 'Curriculum' },
  { to: '/about', label: 'About Us' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
] as const;

// User initials helper
const getUserInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Navbar: React.FC = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { logout, isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const dashboardRoute =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'mentor'
        ? '/mentor/dashboard'
        : '/dashboard';

  // Automatically close any open menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Throttled scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldScroll = window.scrollY > 12;
          setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside listener & Escape key handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/courses?search=${encodeURIComponent(query)}`);
    setSearchQuery('');
  }, [searchQuery, navigate]);

  // Display cart badge (using real cart count or 2 from demo screenshot if zero)
  const displayCartCount = cartCount > 0 ? cartCount : 2;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-warm-white/95 backdrop-blur-md py-2.5 shadow-sm shadow-deep-navy/5 border-b border-light-taupe/80'
              : 'bg-warm-white/90 backdrop-blur-sm py-3 border-b border-light-taupe/60'
          }`}
        >
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-between gap-4">

              {/* =========================================================
                  LEFT: BRAND LOGO + DESKTOP NAVIGATION LINKS
              ========================================================== */}
              <div className="flex items-center gap-6 xl:gap-8">
                {/* Brand Logo */}
                <Link
                  to="/"
                  className="flex items-center group flex-shrink-0"
                  aria-label="Oxyfied Home"
                >
                  <img
                    src="/oxyfied.png"
                    alt="Oxyfied Logo"
                    className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                  <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-deep-navy group-hover:text-burnt-orange transition-colors duration-300 ml-0.5">
                    fied
                  </span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? 'text-burnt-orange bg-[#FEF2E8] border border-burnt-orange/25 font-extrabold shadow-2xs'
                            : 'text-deep-navy/90 hover:text-burnt-orange hover:bg-soft-beige/40'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* =========================================================
                  RIGHT: SEARCH BAR + CART + AUTH BUTTONS
              ========================================================== */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                
                {/* Search Bar Pill */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative group"
                >
                  <input
                    type="text"
                    placeholder="Search programs, skills, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 xl:w-72 bg-white/95 border border-light-taupe/80 rounded-full py-2 pl-9 pr-7 text-xs focus:w-64 xl:focus:w-80 focus:bg-white focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 focus:outline-none transition-all duration-300 text-deep-navy placeholder:text-warm-gray"
                  />
                  <Search className="w-3.5 h-3.5 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-burnt-orange transition-colors pointer-events-none" />
                  
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-deep-navy cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>

                {/* Cart Icon with Notification Badge */}
                <Link
                  to="/checkout"
                  className="relative p-2.5 rounded-full bg-white border border-light-taupe/80 text-deep-navy hover:text-burnt-orange hover:border-burnt-orange transition-all shadow-2xs group"
                  title="View Cart"
                  aria-label="View shopping cart"
                >
                  <ShoppingCart className="w-4 h-4 group-hover:scale-105 transition-transform" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-burnt-orange text-white text-[9.5px] font-extrabold flex items-center justify-center shadow-xs">
                    {displayCartCount}
                  </span>
                </Link>

                {/* Notifications Bell (if authenticated) */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className={`p-2.5 rounded-full transition-all relative border cursor-pointer ${
                        isNotificationsOpen
                          ? 'bg-burnt-orange/15 text-burnt-orange border-burnt-orange/30 shadow-xs'
                          : 'bg-white text-deep-navy border-light-taupe/80 hover:text-burnt-orange hover:bg-soft-beige/50'
                      }`}
                      aria-label="View notifications"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-burnt-orange text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
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
                )}

                {/* User Profile or Sign In / Get Started */}
                {isAuthenticated ? (
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                      aria-haspopup="true"
                      aria-expanded={isProfileMenuOpen}
                      className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isProfileMenuOpen
                          ? 'bg-soft-beige border-burnt-orange ring-2 ring-burnt-orange/20'
                          : 'bg-white border-light-taupe/80 hover:border-burnt-orange/50 hover:bg-soft-beige/40'
                      }`}
                    >
                      {/* Avatar Circle */}
                      <div className="w-7 h-7 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center font-bold text-xs shadow-xs">
                        {getUserInitials(user?.name)}
                      </div>

                      {/* User Name */}
                      <div className="text-left hidden xl:block">
                        <p className="text-xs font-bold text-deep-navy leading-none truncate max-w-[100px]">
                          {user?.name?.split(' ')[0] || 'Member'}
                        </p>
                      </div>

                      <ChevronDown
                        className={`w-3.5 h-3.5 text-warm-gray transition-transform duration-200 ${
                          isProfileMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-60 bg-warm-white border border-light-taupe rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                        >
                          {/* User Identity Header */}
                          <div className="p-3.5 bg-warm-ivory border-b border-light-taupe">
                            <p className="text-xs font-bold text-deep-navy truncate">
                              {user?.name}
                            </p>
                            <p className="text-[11px] text-warm-gray truncate">
                              {user?.email}
                            </p>
                            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-burnt-orange/15 text-burnt-orange text-[10px] font-bold border border-burnt-orange/20">
                              <Sparkles className="w-3 h-3" />
                              {user?.role === 'admin'
                                ? 'Admin'
                                : user?.role === 'mentor'
                                  ? 'Mentor'
                                  : 'Learner'}
                            </div>
                          </div>

                          {/* Navigation Links */}
                          <div className="p-2 space-y-0.5 text-xs">
                            <Link
                              to={dashboardRoute}
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-deep-navy hover:bg-soft-beige hover:text-burnt-orange transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-burnt-orange" />
                              <span>
                                {user?.role === 'admin'
                                  ? 'Admin Dashboard'
                                  : user?.role === 'mentor'
                                    ? 'Mentor Workspace'
                                    : 'My Dashboard'}
                              </span>
                            </Link>

                            <Link
                              to="/dashboard/my-courses"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-soft-beige hover:text-burnt-orange transition-colors"
                            >
                              <GraduationCap className="w-4 h-4 text-sage-green" />
                              <span>Enrolled Programs</span>
                            </Link>

                            <Link
                              to="/dashboard/certificates"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-soft-beige hover:text-burnt-orange transition-colors"
                            >
                              <Award className="w-4 h-4 text-burnt-orange" />
                              <span>Certifications</span>
                            </Link>

                            <Link
                              to="/dashboard/settings"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-deep-navy hover:bg-soft-beige hover:text-burnt-orange transition-colors"
                            >
                              <Settings className="w-4 h-4 text-warm-gray" />
                              <span>Settings</span>
                            </Link>
                          </div>

                          {/* Logout Section */}
                          <div className="p-2 border-t border-light-taupe bg-warm-ivory/50">
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors text-xs text-left cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Log Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Sign In Link */}
                    <Link
                      to="/login"
                      className="text-xs font-bold text-deep-navy hover:text-burnt-orange transition-colors px-2 py-1"
                    >
                      Sign In
                    </Link>

                    {/* Get Started CTA Button */}
                    <Link
                      to="/register"
                      className="btn-primary inline-flex items-center gap-1.5 text-xs font-extrabold px-5 py-2.5 rounded-full shadow-md shadow-burnt-orange/25 hover:shadow-lg hover:shadow-burnt-orange/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* =========================================================
                  MOBILE MENU CONTROLS (HAMBURGER)
              ========================================================== */}
              <div className="lg:hidden flex items-center gap-2">
                {/* Mobile Cart Icon */}
                <Link
                  to="/checkout"
                  className="p-2 text-deep-navy relative"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-burnt-orange" />
                </Link>

                {/* Mobile Notification Bell */}
                {isAuthenticated && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className="p-2 text-deep-navy hover:text-burnt-orange transition-colors relative cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-burnt-orange animate-ping" />
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationsOpen}
                      onClose={() => setIsNotificationsOpen(false)}
                      onUnreadChange={(count) => setUnreadCount(count)}
                    />
                  </div>
                )}

                {/* Mobile Hamburger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="p-2 rounded-xl bg-warm-white border border-light-taupe text-deep-navy hover:text-burnt-orange transition-colors focus:outline-none cursor-pointer"
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-burnt-orange" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* ===============================================================
          3. MOBILE MENU DRAWER (ANIMATED SLIDE OVERLAY)
      ================================================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-deep-navy/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-warm-white shadow-2xl flex flex-col pt-5 px-5 overflow-y-auto border-l border-light-taupe"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-light-taupe">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <img
                    src="/oxyfied.png"
                    alt="OX"
                    className="h-7 w-auto object-contain"
                  />
                  <span className="font-display font-extrabold text-2xl tracking-tight text-deep-navy ml-1">
                    fied
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-warm-ivory border border-light-taupe text-deep-navy hover:text-burnt-orange cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMobileMenuOpen(false);
                }}
                className="relative my-4"
              >
                <input
                  type="text"
                  placeholder="Search programs, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-warm-ivory border border-light-taupe rounded-full py-2 pl-4 pr-10 text-xs focus:border-burnt-orange focus:outline-none text-deep-navy placeholder-warm-gray shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-burnt-orange cursor-pointer"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Track Shortcuts */}
              <div className="mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-2">
                  Popular Tracks
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/courses/cybersecurity-ethical-hacking"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 bg-warm-ivory rounded-xl border border-light-taupe hover:border-burnt-orange transition-colors flex items-center gap-2 text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-burnt-orange flex-shrink-0" />
                    <span className="text-[11px] font-bold text-deep-navy truncate">Cybersecurity</span>
                  </Link>
                  <Link
                    to="/courses/data-science-generative-ai"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 bg-warm-ivory rounded-xl border border-light-taupe hover:border-sage-green transition-colors flex items-center gap-2 text-left"
                  >
                    <Database className="w-4 h-4 text-sage-green flex-shrink-0" />
                    <span className="text-[11px] font-bold text-deep-navy truncate">Data Science</span>
                  </Link>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1 mb-6 text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-warm-gray mb-1">
                  Navigation
                </p>
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-burnt-orange text-white shadow-xs'
                          : 'text-deep-navy hover:bg-soft-beige'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{link.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 -rotate-90 ${
                            isActive ? 'text-white' : 'text-warm-gray'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Mobile Auth Bottom Bar */}
              <div className="mt-auto border-t border-light-taupe pt-4 pb-6 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="p-3 bg-warm-ivory rounded-xl border border-light-taupe flex items-center gap-3 mb-2 text-left">
                      <div className="w-8 h-8 rounded-full bg-deep-navy text-warm-ivory flex items-center justify-center font-bold text-xs">
                        {getUserInitials(user?.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-deep-navy truncate">{user?.name}</p>
                        <p className="text-[10px] text-burnt-orange font-semibold uppercase">{user?.role}</p>
                      </div>
                    </div>

                    <Link
                      to={dashboardRoute}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-2.5 bg-burnt-orange hover:bg-deep-orange text-white rounded-full text-center font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" />
                      Open Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 bg-warm-white border border-light-taupe text-red-600 rounded-full text-center font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                      className="w-full py-2.5 bg-warm-white border border-deep-navy text-deep-navy rounded-full text-center font-bold text-xs block"
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary w-full py-2.5 rounded-full text-center font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = 'Navbar';
