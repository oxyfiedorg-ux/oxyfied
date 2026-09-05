import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, BookOpen, GraduationCap, 
  ShieldAlert, Loader2 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface KPIMetrics {
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  avgProgress: number;
}

interface CourseStatPoint {
  name: string;
  students: number;
}

interface CoursePerfRecord {
  id: string;
  name: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

export const MentorAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStatPoint[]>([]);
  const [performances, setPerformances] = useState<CoursePerfRecord[]>([]);

  // Hovered item for tooltip
  const [hoveredBar, setHoveredBar] = useState<{ idx: number; name: string; val: number } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentorAnalytics();
        setKpis(data.kpis);
        setCourseStats(data.courseEnrollmentStats);
        setPerformances(data.coursesPerformance);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to query classroom analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Generating Custom Visualizers...</span>
      </div>
    );
  }

  // Draw Responsive SVG Bar Chart
  const renderBarChart = () => {
    if (courseStats.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-stone-500">
          Create program tracks to populate analytics charts.
        </div>
      );
    }

    const width = 600;
    const height = 200;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 30;

    const maxVal = Math.max(...courseStats.map(c => c.students), 5);
    const barsCount = courseStats.length;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const barSpacing = chartWidth / barsCount;
    const barWidth = Math.max(10, barSpacing * 0.55);

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 sm:h-64">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const valLabel = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#2e2a24" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3.5} fill="#78716c" fontSize="9" textAnchor="end">{valLabel}</text>
              </g>
            );
          })}

          {/* Bar elements */}
          {courseStats.map((item, idx) => {
            const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
            const barHeight = (item.students / maxVal) * chartHeight;
            const y = height - paddingBottom - barHeight;

            const isHovered = hoveredBar?.idx === idx;

            return (
              <g key={idx} className="group">
                {/* Visual bar with gradient */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? '#f59e0b' : '#d97706'}
                  fillOpacity={isHovered ? 0.95 : 0.75}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredBar({ idx, name: item.name, val: item.students })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                
                {/* Short truncated label underneath */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingBottom + 14}
                  fill="#a8a29e"
                  fontSize="8"
                  textAnchor="middle"
                  className="pointer-events-none font-semibold truncate max-w-[50px]"
                >
                  {item.name.length > 8 ? `${item.name.slice(0, 7)}…` : item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredBar && (
          <div 
            className="absolute z-10 px-3 py-1.5 bg-stone-900 border border-stone-800 text-[10px] text-stone-200 rounded-xl shadow-lg pointer-events-none"
            style={{
              left: `${((paddingLeft + hoveredBar.idx * (chartWidth / barsCount) + (chartWidth / barsCount) / 2) / width) * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)'
            }}
          >
            <span className="font-bold text-amber-500 block leading-tight">{hoveredBar.name}</span>
            <span className="text-stone-400 mt-1 block font-mono font-bold">{hoveredBar.val} enrolled students</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Classroom Performance Analytics</h2>
        <p className="text-xs text-stone-400 mt-1">Visually inspect registration distributions and track curriculum completion rates.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Courses */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Programs</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalCourses || 0}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Total Registrations</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalEnrollments || 0}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI: Active Classroom */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Active Rosters</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.activeStudents || 0}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* KPI: Average progress */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Avg Progress</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.avgProgress || 0}%</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Grid columns: Chart + Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Custom Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-display font-bold text-sm text-white border-b border-stone-850 pb-3">
            Registration Size by Course Track
          </h3>
          {renderBarChart()}
        </div>

        {/* Table summary (5 cols) */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="font-display font-bold text-sm text-white border-b border-stone-850 pb-3">
            Syllabus Stats Breakdown
          </h3>

          <div className="space-y-4 pt-1 max-h-72 overflow-y-auto">
            {performances.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-6">No tracks loaded yet.</p>
            ) : (
              performances.map((perf, idx) => (
                <div key={idx} className="bg-stone-950 p-3.5 rounded-xl border border-stone-850/50 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-white truncate">{perf.name}</span>
                    <span className="font-mono text-amber-400 font-bold">{perf.totalEnrolled} students</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-550 font-bold">
                    <span>Average syllabus progress: {perf.avgProgress}%</span>
                    <span>Completion rate: {perf.completionRate}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
