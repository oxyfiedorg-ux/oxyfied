import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Award, TrendingUp, ShieldAlert, 
  Loader2, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseService } from '../../../services/courseService';

interface KPIMetrics {
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  avgProgress: number;
}

interface MentorCoursePerf {
  id: string;
  name: string;
  totalEnrolled: number;
  activeStudents: number;
  completionRate: number;
  avgProgress: number;
  status: string;
}

export const MentorOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard states
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [performances, setPerformances] = useState<MentorCoursePerf[]>([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const data = await courseService.getMentorAnalytics();
        setKpis(data.kpis);
        setPerformances(data.coursesPerformance);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch your mentor profile analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading && !kpis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Mentor Command</h2>
        <p className="text-xs text-stone-400 mt-1">Review metrics across your syllabus programs and student tracking.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Courses Assigned */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">My Courses</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalCourses || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">Active syllabus tracks</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Total Enrollments */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Total Registrations</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.totalEnrollments || 0}</span>
            <span className="text-[9px] text-stone-400 block">Across all active classrooms</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Active Classroom */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Active Rosters</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.activeStudents || 0}</span>
            <span className="text-[9px] text-stone-450 block font-semibold">Currently training</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Average progress */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Avg Student Progress</span>
            <span className="text-2xl font-display font-extrabold text-white block">{kpis?.avgProgress || 0}%</span>
            <span className="text-[9px] text-stone-400 block">Syllabus completion rate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Classroom Checklist Banner */}
      <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-amber-500" />
            Classroom Checklist Guide
          </h3>
          <p className="text-xs text-stone-450">Maintain active modules, assign syllabus lesson timelines, and inspect progress logs weekly.</p>
        </div>
        <Link 
          to="/mentor/dashboard/courses"
          className="btn-primary flex items-center gap-1.5 text-[11px] uppercase font-bold py-2 px-4 rounded-xl"
        >
          My Syllabus Courses <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Course Performance Lists */}
      <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="font-display font-extrabold text-base text-white border-b border-stone-850 pb-3">
          Your Courses Registry Stats
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-850 text-stone-500 font-bold">
                <th className="py-2.5">Course Program</th>
                <th className="py-2.5 text-center">Classroom Size</th>
                <th className="py-2.5 text-center">Active Learners</th>
                <th className="py-2.5 text-center">Classroom Progress</th>
                <th className="py-2.5 text-center">Completion Rate</th>
                <th className="py-2.5 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850/40 text-stone-300">
              {performances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-550 italic font-semibold">
                    You have not registered any syllabus courses on the platform yet.
                  </td>
                </tr>
              ) : (
                performances.map(c => (
                  <tr key={c.id} className="hover:bg-stone-950/35 transition-colors">
                    <td className="py-3.5 font-semibold text-white truncate max-w-[200px]">{c.name}</td>
                    <td className="py-3.5 text-center font-mono font-bold text-amber-500">{c.totalEnrolled}</td>
                    <td className="py-3.5 text-center font-mono">{c.activeStudents}</td>
                    
                    {/* Progress bar */}
                    <td className="py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">{c.avgProgress}%</span>
                        <div className="w-20 bg-stone-950 h-1 rounded-full border border-stone-850 overflow-hidden">
                          <div className="bg-amber-500 h-1" style={{ width: `${c.avgProgress}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-center font-mono font-bold text-amber-500">{c.completionRate}%</td>
                    
                    <td className="py-3.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'available' ? 'bg-green-950/30 text-green-400 border border-green-900/35' : 'bg-stone-800 text-stone-450'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
