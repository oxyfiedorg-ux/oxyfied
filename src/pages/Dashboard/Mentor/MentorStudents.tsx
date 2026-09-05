import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Clock, CheckCircle2, ShieldAlert, Loader2 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface CourseOption {
  id: string;
  title: string;
  category: string;
}

interface StudentEnrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  status: 'active' | 'completed';
  progress: number;
}

export const MentorStudents: React.FC = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector & Search filters
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [search, setSearch] = useState('');

  // 1. Fetch mentor's courses first
  useEffect(() => {
    const fetchMentorCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentorCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch assigned program tracks.');
      } finally {
        setLoading(false);
      }
    };
    fetchMentorCourses();
  }, []);

  // 2. Fetch student roster when course selector changes
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchClassroom = async () => {
      try {
        setLoadingStudents(true);
        const roster = await courseService.getMentorCourseStudents(selectedCourseId);
        setStudents(roster);
        setError(null);
      } catch (err) {
        setError('Failed to load student roster for selected course.');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchClassroom();
  }, [selectedCourseId]);

  // Local filter for searches
  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Classroom Rosters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Student Roster</h2>
        <p className="text-xs text-stone-400 mt-1">Review learning progress across classrooms and coordinate support.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-900 border border-stone-850 p-4 rounded-2xl shadow-xl">
        {/* Course dropdown */}
        <div className="relative">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-955 border border-stone-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
          >
            {courses.length === 0 ? (
              <option value="">No Active Courses</option>
            ) : (
              courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
            )}
          </select>
          <BookOpen className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Search by name/email */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!selectedCourseId}
            className="w-full pl-9 pr-3 py-2 bg-stone-955 border border-stone-850 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 disabled:opacity-40"
          />
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden">
        {loadingStudents ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Syncing classroom...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-semibold">
            {selectedCourseId ? 'No students enrolled in this course yet.' : 'Please create or select an active course track.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-950/60 border-b border-stone-850 text-stone-400 font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Enrollment Date</th>
                  <th className="px-6 py-4 text-center">Track Progress</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-stone-950/30 transition-colors">
                    {/* Student profile */}
                    <td className="px-6 py-3.5 font-semibold text-white">
                      <div className="flex flex-col">
                        <span>{student.studentName}</span>
                        <span className="text-[10px] text-stone-550 font-mono font-semibold">{student.studentEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                    
                    {/* Classroom progress */}
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-amber-550 font-bold">{student.progress}%</span>
                        <div className="w-24 bg-stone-950 h-1.5 rounded-full border border-stone-850 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'completed' 
                          ? 'bg-green-950/30 text-green-400 border border-green-900/30' 
                          : 'bg-amber-955/20 text-amber-400 border border-amber-900/30'
                      }`}>
                        {student.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-amber-400" />}
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
