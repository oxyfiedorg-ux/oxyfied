import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  ShieldAlert, Loader2, Eye, ToggleLeft, ToggleRight, X, BookOpen, CheckCircle
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface EnrolledCourseInfo {
  id: string;
  courseId: string;
  courseTitle: string;
  status: string;
  progress: number;
  createdAt: string;
}

interface UserObject {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'admin' | 'mentor';
  status: 'active' | 'inactive';
  createdAt: string;
  enrollmentsCount: number;
  enrollments: EnrolledCourseInfo[];
  progress: Record<string, string[]>;
  activeSession?: {
    id: string;
    createdAt: string;
    lastActivityAt: string;
    userAgent?: string;
  } | null;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserObject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Selection states for detail Modal
  const [selectedUser, setSelectedUser] = useState<UserObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit
      };
      const data = await courseService.getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, sortBy, sortOrder, page]);

  // Toggle user status handler
  const handleToggleStatus = async (user: UserObject) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = `Are you sure you want to set status of ${user.name} to ${nextStatus.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await courseService.updateUser(user.id, { status: nextStatus, role: user.role });
      // Update local state instantly
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err) {
      setError('Failed to update account status.');
    } finally {
      setLoading(false);
    }
  };

  // Change user role handler
  const handleChangeRole = async (user: UserObject, nextRole: 'student' | 'admin' | 'mentor') => {
    if (!window.confirm(`Promote/Change role of ${user.name} to ${nextRole.toUpperCase()}?`)) return;

    try {
      setLoading(true);
      await courseService.updateUser(user.id, { role: nextRole, status: user.status });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? { ...prev, role: nextRole } : null);
      }
    } catch (err) {
      setError('Failed to change user role.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Users Directory</h2>
        <p className="text-xs text-stone-400 mt-1">Manage registered student, mentor, and administrator profiles.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-900 border border-stone-850 p-4 rounded-2xl shadow-xl">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
          />
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-all appearance-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Administrator</option>
          </select>
          <Filter className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-all appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
          </select>
          <Filter className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Reset button */}
        <button 
          onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
          className="btn-secondary py-2 text-xs font-bold rounded-xl"
        >
          Clear Filters
        </button>
      </div>

      {/* Users table */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Syncing users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-semibold">
            No registered users match the search queries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950/60 border-b border-stone-850 text-stone-400 font-bold">
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                    User Name <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('createdAt')}>
                    Joined <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5" />
                  </th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-center">Tracks Enrolled</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-stone-950/30 transition-colors">
                    {/* User profile info */}
                    <td className="px-6 py-3.5 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-stone-800"
                        />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono">{u.email}</td>
                    <td className="px-6 py-3.5">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3.5 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value as any)}
                        className="bg-stone-950 border border-stone-850 text-stone-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-500"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-amber-500">{u.enrollmentsCount}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.status === 'active' 
                          ? 'bg-green-950/30 text-green-400 border border-green-900/35' 
                          : 'bg-red-950/30 text-red-400 border border-red-900/35'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button 
                        onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                        className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-950 rounded-lg transition-all"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-all ${
                          u.status === 'active' 
                            ? 'text-green-500 hover:bg-green-950/20' 
                            : 'text-red-500 hover:bg-red-950/20'
                        }`}
                        title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-stone-950/35 border-t border-stone-850 flex items-center justify-between">
            <span className="text-xs text-stone-550 font-medium">
              Showing page <span className="text-stone-300 font-bold">{page}</span> of <span className="text-stone-300 font-bold">{totalPages}</span> ({total} users)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-1.5 bg-stone-900 border border-stone-850 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-stone-300 transition-colors"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-stone-900 border border-stone-850 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-stone-300 transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left shadow-2xl">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-stone-850 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-white">Detailed User Profile</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-500 hover:text-white rounded-lg hover:bg-stone-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Profile Details card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-stone-900/40 p-4 rounded-xl border border-stone-850/50">
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-stone-800 shadow"
                />
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="font-display font-bold text-white text-lg">{selectedUser.name}</h4>
                  <span className="text-xs text-stone-400 font-mono block">{selectedUser.email}</span>
                  {selectedUser.phone && <span className="text-xs text-stone-500 block">Phone: {selectedUser.phone}</span>}
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                    <span className="px-2 py-0.5 bg-amber-600/25 border border-amber-500/30 text-amber-400 text-[10px] uppercase font-bold rounded">
                      Role: {selectedUser.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      selectedUser.status === 'active' 
                        ? 'bg-green-950/30 text-green-400 border border-green-900/35' 
                        : 'bg-red-950/30 text-red-400 border border-red-900/35'
                    }`}>
                      Status: {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Session details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest block border-b border-stone-850 pb-1.5">
                  Session Protection
                </h4>
                
                {selectedUser.activeSession ? (
                  <div className="p-4 bg-stone-900 border border-stone-850 rounded-xl space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-1">
                        <p className="text-xs text-stone-300 font-semibold">Active Session Detected</p>
                        <p className="text-[10px] text-stone-550 font-mono">
                          Started: {new Date(selectedUser.activeSession.createdAt).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-stone-550 font-mono">
                          Last Active: {new Date(selectedUser.activeSession.lastActivityAt).toLocaleString()}
                        </p>
                        {selectedUser.activeSession.userAgent && (
                          <p className="text-[10px] text-stone-550 font-mono truncate max-w-[280px] sm:max-w-md" title={selectedUser.activeSession.userAgent}>
                            Device: {selectedUser.activeSession.userAgent}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to revoke the active session for ${selectedUser.name}? The user will be forced to log in again.`)) {
                            try {
                              setLoading(true);
                              await courseService.revokeUserSession(selectedUser.id);
                              // Update selectedUser local state
                              setSelectedUser(prev => prev ? { ...prev, activeSession: null } : null);
                              // Update users list local state
                              setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, activeSession: null } : u));
                            } catch (err) {
                              setError('Failed to revoke session.');
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="px-3 py-1.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900 hover:text-white text-red-300 text-[10px] font-bold rounded-xl transition-all self-start sm:self-center"
                      >
                        Revoke Active Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-550 italic py-2">No active session found for this user.</p>
                )}
              </div>

              {/* Enrollment tracks history */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest block border-b border-stone-850 pb-1.5">
                  Course Enrollment Timeline
                </h4>
                
                {selectedUser.enrollments.length === 0 ? (
                  <p className="text-xs text-stone-550 italic py-4">No active course enrollments registered for this user.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedUser.enrollments.map(e => {
                      const lessonsCompletedCount = selectedUser.progress[e.courseId]?.length || 0;
                      
                      return (
                        <div key={e.id} className="p-4 bg-stone-900 border border-stone-850 rounded-xl space-y-3 shadow-sm hover:border-amber-500/10 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              <span className="text-xs font-bold text-white leading-tight">{e.courseTitle}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono">Enrolled: {new Date(e.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Progress */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[10px] text-stone-450 font-bold">
                                <span>Track Progress</span>
                                <span className="font-mono">{e.progress}% ({lessonsCompletedCount} lessons)</span>
                              </div>
                              <div className="w-full bg-stone-950 rounded-full h-1.5 border border-stone-900 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${e.progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                e.status === 'completed' 
                                  ? 'bg-green-950/20 text-green-400 border border-green-900/30' 
                                  : 'bg-amber-955/20 text-amber-400 border border-amber-900/30'
                              }`}>
                                {e.status}
                              </span>
                              {e.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-stone-850 bg-stone-950/40 text-right">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary px-5 py-2 text-xs font-bold rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
