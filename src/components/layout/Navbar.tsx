import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogOut, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const dashboardRoute = user?.role === 'admin' 
    ? '/admin/dashboard' 
    : user?.role === 'mentor' 
      ? '/mentor/dashboard' 
      : '/dashboard';

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
    { to: '/contact', label: 'Contact' }
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
            {/* Left: Branding Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-display font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
                O
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
                Oxyfied
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-all hover:text-amber-400 ${
                      isActive ? 'text-amber-400 font-semibold' : 'text-stone-300'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right: Actions, Search, Auth */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Search Bar Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
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
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Login / Dashboard Profile triggers */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 border-l border-stone-800 pl-4">
                  <Link
                    to={dashboardRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition-colors shadow"
                  >
                    <BookOpen className="w-4 h-4" />
                    {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'mentor' ? 'Mentor Hub' : 'LMS Dashboard'}
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-stone-400 hover:text-red-450 transition-colors rounded-lg hover:bg-stone-900/40"
                    title="Log Out"
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

            {/* Mobile Hamburger toggle */}
            <div className="lg:hidden flex items-center gap-3">
              {isAuthenticated && (
                <Link
                  to={dashboardRoute}
                  className="p-2 text-slate-300 hover:text-royal-blue-400 transition-colors"
                  title="My Dashboard"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-300 hover:text-white transition-colors focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 animate-pulse" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-stone-950 flex flex-col pt-24 px-6 lg:hidden">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
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
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Nav links stack */}
          <div className="flex flex-col gap-5 mb-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base font-semibold tracking-wide ${
                    isActive ? 'text-amber-400' : 'text-stone-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth stack */}
          <div className="border-t border-stone-850 pt-6 mt-auto pb-10 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
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
