import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, 
  Award, ShieldAlert, Loader2, ArrowUpRight, Activity 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface KPIObject {
  totalUsers: number;
  newUsers: number;
  totalMentors: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  enrollmentsThisMonth: number;
  mostPopularCourse: string;
}

interface RegistrationPoint {
  date: string;
  registrations: number;
}

interface CourseEnrollmentPoint {
  name: string;
  students: number;
}

interface CoursePerfItem {
  id: string;
  name: string;
  mentor: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

interface MentorPerfItem {
  id: string;
  name: string;
  coursesCount: number;
  totalEnrollments: number;
  mostPopularCourse: string;
}

interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export const AdminOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State from Analytics Endpoint
  const [kpis, setKpis] = useState<KPIObject | null>(null);
  const [registrationTimeline, setRegistrationTimeline] = useState<RegistrationPoint[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollmentPoint[]>([]);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerfItem[]>([]);
  const [mentorPerformance, setMentorPerformance] = useState<MentorPerfItem[]>([]);
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);

  // Range filters
  const [timelineRange, setTimelineRange] = useState<'today' | '7days' | '30days' | '3months' | 'thisyear'>('30days');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; val: number } | null>(null);

  const fetchAnalytics = async (range: typeof timelineRange) => {
    try {
      setLoading(true);
      const data = await courseService.getAdminAnalytics(range);
      setKpis(data.kpis);
      setRegistrationTimeline(data.userRegistrationTimeline);
      setCourseEnrollments(data.courseEnrollmentStats);
      setCoursePerformance(data.coursePerformance);
      setMentorPerformance(data.mentorPerformance);
      setActivities(data.recentActivity);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load platform analytics details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timelineRange);
  }, [timelineRange]);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Compiling Analytics...</span>
      </div>
    );
  }

  // Draw Line Chart helpers
  const renderLineChart = () => {
    if (registrationTimeline.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-stone-500">
          No registration data in this period.
        </div>
      );
    }

    const width = 600;
    const height = 180;
    const padding = 25;

    const maxVal = Math.max(...registrationTimeline.map(d => d.registrations), 5);
    const pointsCount = registrationTimeline.length;

    // Calculate coordinates
    const coords = registrationTimeline.map((item, idx) => {
      const x = padding + (idx / (pointsCount - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (item.registrations / maxVal) * (height - padding * 2);
      return { x, y, label: item.date, val: item.registrations };
    });

    let pathD = '';
    let areaD = `M ${coords[0].x} ${height - padding}`;
    
    coords.forEach((c, idx) => {
      if (idx === 0) {
        pathD += `M ${c.x} ${c.y}`;
        areaD += ` L ${c.x} ${c.y}`;
      } else {
        pathD += ` L ${c.x} ${c.y}`;
        areaD += ` L ${c.x} ${c.y}`;
      }
    });
    areaD += ` L ${coords[coords.length - 1].x} ${height - padding} Z`;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * (height - padding * 2);
            const valLabel = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#2e2a24" strokeDasharray="3 3" />
                <text x={padding - 5} y={y + 4} fill="#78716c" fontSize="9" textAnchor="end">{valLabel}</text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaD} fill="url(#areaGrad)" />
          
          {/* Main stroke line */}
          <path d={pathD} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive dots */}
          {coords.map((c, idx) => (
            <circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r={hoveredPoint?.label === c.label ? 6 : 3.5}
              fill={hoveredPoint?.label === c.label ? '#f59e0b' : '#0c0a09'}
              stroke="#d97706"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(c)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-10 px-2 py-1 bg-stone-900 border border-stone-800 text-[10px] text-stone-200 rounded-lg shadow-md whitespace-nowrap pointer-events-none"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="font-bold text-amber-500 block">{hoveredPoint.val} Registrations</span>
            <span className="text-stone-400 text-[9px]">{hoveredPoint.label}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Platform Dashboard</h2>
          <p className="text-xs text-stone-400 mt-1">Platform analytics and administrative operation logs.</p>
        </div>

        {/* Time filters */}
        <div className="flex bg-[#141210] border border-stone-850 p-1 rounded-xl self-start">
          {(['7days', '30days', '3months', 'thisyear'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimelineRange(range)}
              className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all ${
                timelineRange === range 
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/25' 
                  : 'text-stone-450 hover:text-white'
              }`}
            >
              {range === '7days' && '7 Days'}
              {range === '30days' && '30 Days'}
              {range === 'thisyear' && 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Users */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Total Users</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalUsers || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">
              <span className="text-amber-500">+{kpis?.newUsers || 0}</span> in 30d
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Mentors */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Total Mentors</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalMentors || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">Active learning guides</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Courses */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Total Courses</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalCourses || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">
              <span className="text-amber-500">{kpis?.activeCourses || 0}</span> active tracks
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Enrollments</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalEnrollments || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">
              <span className="text-amber-500">+{kpis?.enrollmentsThisMonth || 0}</span> this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Popular course bar */}
      <div className="p-4 bg-gradient-to-r from-amber-600/10 to-amber-600/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-550/20 flex items-center justify-center text-amber-450 flex-shrink-0 animate-pulse">
            <Award className="w-4.5 h-4.5" />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-[9px] uppercase font-extrabold text-amber-500 tracking-wider">Top Performing Track</span>
            <h4 className="text-xs font-bold text-white block mt-0.5">Most Popular Program: {kpis?.mostPopularCourse || 'N/A'}</h4>
          </div>
        </div>
        <div className="text-[10px] font-bold text-amber-500 bg-amber-955/20 border border-amber-900/30 px-3 py-1 rounded-md">
          Highest Registrations
        </div>
      </div>

      {/* Graphs columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Line Chart (8 cols) */}
        <div className="lg:col-span-8 bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-850 pb-3">
            <h3 className="font-display font-bold text-sm text-white">User Registration Analytics</h3>
            <span className="text-[9px] text-stone-500 font-mono font-bold">Real-time DB Sync</span>
          </div>
          {renderLineChart()}
        </div>

        {/* Enrollment Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4 text-left">
          <div className="border-b border-stone-850 pb-3">
            <h3 className="font-display font-bold text-sm text-white">Course Enrollments</h3>
          </div>
          
          <div className="space-y-4 pt-1">
            {courseEnrollments.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">No courses loaded yet.</p>
            ) : (
              courseEnrollments.map((c, idx) => {
                const total = kpis?.totalEnrollments || 1;
                const percent = Math.round((c.students / total) * 100);
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-300">
                      <span className="truncate pr-4">{c.name}</span>
                      <span className="font-mono text-amber-400 font-bold">{c.students} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-stone-950 rounded-full h-1.5 overflow-hidden border border-stone-900">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lists grids: Courses vs Mentors */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Course Performance */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-display font-bold text-sm text-white border-b border-stone-850 pb-3">
            Course Performance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-850 text-stone-500 font-bold">
                  <th className="py-2.5">Course Name</th>
                  <th className="py-2.5">Mentor</th>
                  <th className="py-2.5 text-right">Students</th>
                  <th className="py-2.5 text-right">Completion</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {coursePerformance.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-950/45 transition-colors">
                    <td className="py-3 font-semibold text-white truncate max-w-[150px]">{c.name}</td>
                    <td className="py-3">{c.mentor}</td>
                    <td className="py-3 text-right font-mono font-bold">{c.totalEnrolled}</td>
                    <td className="py-3 text-right font-mono text-amber-400 font-bold">{c.completionRate}%</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'available' ? 'bg-green-950/30 text-green-400 border border-green-900/30' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mentor Performance */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-display font-bold text-sm text-white border-b border-stone-850 pb-3">
            Mentor Performance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-850 text-stone-500 font-bold">
                  <th className="py-2.5">Mentor Name</th>
                  <th className="py-2.5 text-center">Courses</th>
                  <th className="py-2.5 text-right">Total Enrollments</th>
                  <th className="py-2.5 text-right">Most Popular Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {mentorPerformance.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-950/45 transition-colors">
                    <td className="py-3 font-semibold text-white flex items-center gap-2">{m.name}</td>
                    <td className="py-3 text-center font-mono font-bold">{m.coursesCount}</td>
                    <td className="py-3 text-right font-mono text-amber-450 font-bold">{m.totalEnrollments}</td>
                    <td className="py-3 text-right truncate max-w-[150px]">{m.mostPopularCourse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4 text-left">
        <div className="border-b border-stone-850 pb-3 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            Recent Activity Feed
          </h3>
          <span className="text-[9px] uppercase font-extrabold text-amber-500 bg-amber-955/20 border border-amber-900/30 px-2 py-0.5 rounded">
            Live Stream
          </span>
        </div>

        <div className="space-y-4 pt-1 max-h-72 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-6">No records registered yet.</p>
          ) : (
            activities.map((log) => (
              <div key={log.id} className="flex gap-4 border-b border-stone-850/40 pb-3 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-stone-950 border border-stone-850 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-200 block">{log.details}</span>
                  <span className="text-[10px] text-stone-550 block font-mono">
                    {new Date(log.createdAt).toLocaleString()} • Action: {log.action}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
