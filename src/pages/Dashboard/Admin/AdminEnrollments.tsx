import React, { useState, useEffect } from 'react';
import { 
  Trash2, ShieldAlert, Loader2, X, Check, Search, 
  UserPlus, CheckCircle, Clock
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface EnrollmentObject {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed';
  progress: number;
  createdAt: string;
  completionDate?: string | null;
  user: {
    name: string;
    email: string;
  };
  course: {
    title: string;
  };
}

interface CourseOption {
  id: string;
  title: string;
}

export const AdminEnrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentObject[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manual enrollment form modal states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState(0);
  const [editingStatus, setEditingStatus] = useState<'active' | 'completed'>('active');

  // Search filter
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollData, courseData] = await Promise.all([
        courseService.getAdminEnrollments(),
        courseService.getAdminCourses()
      ]);
      setEnrollments(enrollData);
      setCourses(courseData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch enrollments database index.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEnrollModal = () => {
    setEnrollEmail('');
    setEnrollCourseId(courses[0]?.id || '');
    setIsEnrollModalOpen(true);
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail || !enrollCourseId) {
      setError('Please fill in user email and select a target course.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        email: enrollEmail.trim(),
        courseId: enrollCourseId
      };
      await courseService.createEnrollment(payload);
      setSuccess(`Student "${enrollEmail}" successfully registered and enrolled.`);
      setIsEnrollModalOpen(false);
      setError(null);
      // Reload timeline
      await fetchData();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll student. Verify email exists in users registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (enrollment: EnrollmentObject) => {
    setEditingId(enrollment.id);
    setEditingProgress(enrollment.progress);
    setEditingStatus(enrollment.status);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setLoading(true);
      const payload = {
        status: editingStatus,
        progress: editingProgress
      };
      const updated = await courseService.updateEnrollment(id, payload);
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      setEditingId(null);
      setSuccess('Enrollment tracking profile successfully updated.');
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to update student enrollment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnrollment = async (enroll: EnrollmentObject) => {
    const confirmMsg = `Remove enrollment record of "${enroll.user.name}" from course "${enroll.course.title}"? The student will lose tracking access to this syllabus.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await courseService.deleteEnrollment(enroll.id);
      setEnrollments(prev => prev.filter(e => e.id !== enroll.id));
      setSuccess('Enrollment record removed.');
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to delete enrollment.');
    } finally {
      setLoading(false);
    }
  };

  // Local filter for search
  const filteredEnrollments = enrollments.filter(e => 
    e.user.name.toLowerCase().includes(search.toLowerCase()) ||
    e.user.email.toLowerCase().includes(search.toLowerCase()) ||
    e.course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Enrollment Hub</h2>
          <p className="text-xs text-stone-400 mt-1">Review student progress tracking profiles or override active registries.</p>
        </div>
        <button 
          onClick={openEnrollModal}
          className="btn-primary flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold rounded-xl self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          Enroll Student Manually
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-950/20 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input bar */}
      <div className="relative max-w-md bg-stone-900 border border-stone-850 p-1.5 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Filter by name, email, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-850 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-all"
        />
        <Search className="w-4 h-4 text-stone-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Enrollments directory Table */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden">
        {loading && enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Syncing enrollments...</span>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-stone-550 text-xs font-semibold">
            No registrations found in the current dashboard view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950/60 border-b border-stone-850 text-stone-400 font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Program Track</th>
                  <th className="px-6 py-4">Enrolled Date</th>
                  <th className="px-6 py-4 text-center">Track Progress</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {filteredEnrollments.map(e => {
                  const isEditing = editingId === e.id;
                  
                  return (
                    <tr key={e.id} className="hover:bg-stone-950/30 transition-colors">
                      {/* User metadata */}
                      <td className="px-6 py-3.5 font-semibold text-white">
                        <div className="flex flex-col">
                          <span>{e.user.name}</span>
                          <span className="text-[10px] text-stone-500 font-mono font-semibold">{e.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-medium">{e.course.title}</td>
                      <td className="px-6 py-3.5 font-mono">{new Date(e.createdAt).toLocaleDateString()}</td>
                      
                      {/* Track progress */}
                      <td className="px-6 py-3.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingProgress}
                              onChange={(el) => setEditingProgress(parseInt(el.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 bg-stone-950 border border-stone-800 text-white rounded text-center text-xs focus:outline-none"
                            />
                            <span className="text-[10px] text-stone-400 font-bold">%</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono text-amber-500 font-bold">{e.progress}%</span>
                            <div className="w-20 bg-stone-950 h-1 rounded-full border border-stone-850 overflow-hidden">
                              <div className="bg-amber-500 h-1" style={{ width: `${e.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5 text-center">
                        {isEditing ? (
                          <select
                            value={editingStatus}
                            onChange={(el) => setEditingStatus(el.target.value as any)}
                            className="bg-stone-950 border border-stone-800 text-[10px] text-white px-2 py-0.5 rounded focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            e.status === 'completed' 
                              ? 'bg-green-950/30 text-green-400 border border-green-900/30' 
                              : 'bg-amber-955/20 text-amber-400 border border-amber-900/30'
                          }`}>
                            {e.status === 'completed' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-amber-400" />}
                            {e.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={() => handleSaveEdit(e.id)}
                              className="px-2.5 py-1 bg-green-800 text-white hover:bg-green-700 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-colors"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 bg-stone-950 border border-stone-850 hover:bg-stone-900 text-[10px] font-bold uppercase tracking-wide rounded-lg text-stone-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleStartEdit(e)}
                              className="px-2.5 py-1 bg-stone-950 border border-stone-850 hover:bg-stone-900 text-[10px] font-bold uppercase tracking-wide rounded-lg text-stone-400 hover:text-white transition-colors"
                            >
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => handleDeleteEnrollment(e)}
                              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-955/20 rounded-lg transition-all inline-block"
                              title="Delete Enrollment Override"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Enrollment Form Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <form 
            onSubmit={handleManualEnroll}
            className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl space-y-4.5"
          >
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <h3 className="font-display font-extrabold text-sm text-white">Manual Enroll Bypass</h3>
              <button 
                type="button" onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-stone-500 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-xs text-stone-300">
              <label className="font-bold text-stone-400 uppercase tracking-widest block">Student Registered Email</label>
              <input
                type="email"
                required
                value={enrollEmail}
                onChange={(e) => setEnrollEmail(e.target.value)}
                placeholder="e.g. aswin@email.com"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Course select */}
            <div className="space-y-1.5 text-xs text-stone-300">
              <label className="font-bold text-stone-400 uppercase tracking-widest block">Select Target Course</label>
              <select
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div className="text-right space-x-2.5 pt-2 border-t border-stone-850/60">
              <button 
                type="button" onClick={() => setIsEnrollModalOpen(false)}
                className="btn-secondary px-4 py-1.5 text-[11px] font-bold rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="btn-primary px-4 py-1.5 text-[11px] font-bold rounded-lg"
              >
                Enroll student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
