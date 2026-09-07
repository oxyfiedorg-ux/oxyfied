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

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-stone-950 overflow-hidden">
      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0f0d0b] text-stone-300 border-r border-stone-900 transition-transform duration-300 transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-900 bg-[#0f0d0b]">
          <Link to="/" className="flex items-center gap-2">
           
            <span className="font-display font-extrabold text-lg text-white tracking-tight">
              Oxyfied LMS
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
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
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow'
                    : 'hover:bg-stone-900 hover:text-white'
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
        <div className="p-4 border-t border-stone-900 bg-[#0f0d0b]/40">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg text-stone-400 hover:text-white hover:bg-stone-900 transition-colors mb-2"
          >
            <Home className="w-4 h-4" />
            Back to Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dashboard Top Header */}
        <header className="bg-stone-900/80 border-b border-stone-800/80 px-6 py-4 flex items-center justify-between shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white font-display">{dashboardHeading}</h1>
              <p className="text-xs text-stone-400 mt-0.5">Welcome back, {user?.name || 'Learner'}</p>
            </div>
          </div>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-2.5 border-l border-stone-800 pl-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-stone-800"
              />
              <div className="hidden md:block">
                <span className="text-xs font-bold text-stone-200 block leading-tight">{user?.name}</span>
                <span className="text-[10px] text-stone-400 block leading-none">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Viewer */}
        <main className="flex-1 overflow-y-auto p-6 bg-stone-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
