import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  ShieldCheck,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminPath = location.pathname.startsWith('/admin');
  const isMentorPath = location.pathname.startsWith('/mentor');

  let navItems: Array<{ to: string; label: string; icon: any }> = [];
  let dashboardHeading = 'Student Workspace';

  if (isAdminPath) {
    dashboardHeading = 'Admin Workspace';
    navItems = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/dashboard/users', label: 'Users', icon: Users },
      { to: '/admin/dashboard/mentors', label: 'Mentors', icon: ShieldCheck },
      { to: '/admin/dashboard/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/dashboard/enrollments', label: 'Enrollments', icon: Trophy },
      { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings }
    ];
  } else if (isMentorPath) {
    dashboardHeading = 'Mentor Workspace';
    navItems = [
      { to: '/mentor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/mentor/dashboard/courses', label: 'My Courses', icon: BookOpen },
      { to: '/mentor/dashboard/add-course', label: 'Add Course', icon: ShieldCheck },
      { to: '/mentor/dashboard/students', label: 'Students', icon: Users },
      { to: '/mentor/dashboard/submissions', label: 'Project Submissions', icon: FileText },
      { to: '/mentor/dashboard/analytics', label: 'Analytics', icon: Trophy },
      { to: '/mentor/dashboard/profile', label: 'Profile', icon: Settings }
    ];
  } else {
    dashboardHeading = 'Student Workspace';
    navItems = [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
      { to: '/dashboard/progress', label: 'Progress Tracking', icon: Trophy },
      { to: '/dashboard/certificates', label: 'Certificates', icon: Award },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings }
    ];
  }

  return (
    <div className="flex h-screen bg-warm-ivory overflow-hidden">
      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-deep-navy/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-deep-navy text-warm-ivory border-r border-deep-navy/20 transition-transform duration-300 transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-deep-navy">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-burnt-orange text-white flex items-center justify-center font-display font-black text-base shadow-sm">
              O
            </span>
            <span className="font-display font-extrabold text-lg text-white tracking-tight">
              Oxyfied LMS
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-warm-gray hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin/dashboard' || item.to === '/mentor/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-burnt-orange text-white shadow-md font-bold'
                    : 'text-warm-ivory/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User controls */}
        <div className="p-4 border-t border-white/10 bg-deep-navy/80">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-warm-ivory/80 hover:text-white hover:bg-white/10 transition-colors mb-2"
          >
            <Home className="w-4 h-4" />
            Back to Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-warm-ivory">
        {/* Dashboard Top Header */}
        <header className="bg-warm-white border-b border-light-taupe px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-deep-navy hover:bg-warm-ivory lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-deep-navy font-display">{dashboardHeading}</h1>
              <p className="text-xs text-warm-gray mt-0.5">Welcome back, {user?.name || 'Learner'}</p>
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className={`p-2 rounded-full transition-all relative ${
                  isNotificationsOpen 
                    ? 'bg-burnt-orange/15 text-burnt-orange border border-burnt-orange/30' 
                    : 'text-warm-gray hover:text-deep-navy hover:bg-warm-ivory'
                }`}
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-burnt-orange text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
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

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-2.5 border-l border-light-taupe pl-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-light-taupe"
              />
              <div className="hidden md:block">
                <span className="text-xs font-bold text-deep-navy block leading-tight">{user?.name}</span>
                <span className="text-[10px] text-warm-gray block leading-none">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Viewer */}
        <main className="flex-1 overflow-y-auto p-6 bg-warm-ivory">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
