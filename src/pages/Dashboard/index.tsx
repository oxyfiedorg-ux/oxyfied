import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Award, Play, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch courses from Neon on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses for dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Filter courses user has purchased/enrolled
  const enrolledCourses = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));
  const recommendedCourses = courses.filter((c) => c.status === 'available' && !(user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Dashboard...</span>
      </div>
    );
  }

  // Calculate metrics
  const totalEnrolled = enrolledCourses.length;
  let totalCompletedLessons = 0;
  if (user?.progress) {
    Object.values(user.progress).forEach((lessonList) => {
      totalCompletedLessons += lessonList.length;
    });
  }

  // Helper: Get progress percentage for a course
  const getCourseProgress = (courseId: string, totalLessons: number) => {
    if (!user?.progress || !user.progress[courseId]) return 0;
    const completed = user.progress[courseId].length;
    return Math.min(100, Math.round((completed / totalLessons) * 100));
  };

  return (
    <div className="space-y-8 text-left">
      {/* 23. Welcome banner / User profile card */}
      <div className="bg-gradient-to-r from-[#0f0d0b] to-[#1e1305] text-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-stone-900 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="space-y-2.5 text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-amber-955/20 border border-amber-900/25 text-amber-450 text-xs font-semibold rounded-md uppercase tracking-wider">
            LMS Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Welcome back, {user?.name || 'Learner'}!
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            Resume building technologies. We track your progress as you compile scripts and complete practical security or analytic audits.
          </p>
        </div>
        
        {/* Simple continue action */}
        {enrolledCourses.length > 0 && (
          <button
            onClick={() => {
              const active = enrolledCourses[0];
              const firstLessonId = active.modules?.[0]?.lessons?.[0]?.id || '';
              navigate(`/dashboard/learn/${active.id}/${firstLessonId}`);
            }}
            className="btn-primary px-5 py-3 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md animate-pulse"
          >
            Continue Learning
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric: Enrolled */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center gap-4 hover:border-amber-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Enrolled Courses</span>
            <span className="text-xl font-display font-extrabold text-white block mt-0.5">{totalEnrolled}</span>
          </div>
        </div>

        {/* Metric: Progress */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center gap-4 hover:border-amber-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
            <Trophy className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Lessons Completed</span>
            <span className="text-xl font-display font-extrabold text-white block mt-0.5">{totalCompletedLessons}</span>
          </div>
        </div>

        {/* Metric: Certs */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl flex items-center gap-4 hover:border-amber-500/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-455">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Certificates Earned</span>
            <span className="text-xl font-display font-extrabold text-white block mt-0.5">
              {enrolledCourses.filter(c => getCourseProgress(c.id, c.lessons) === 100).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard columns: Current Courses (8) vs Suggestions (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Enrolled Courses (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <h3 className="font-display font-bold text-base text-white border-b border-stone-850 pb-2">
            My Enrolled Tracks
          </h3>

          {enrolledCourses.length === 0 ? (
            <div className="bg-stone-900 border border-stone-850 p-12 rounded-2xl text-center space-y-4 shadow-xl">
              <BookOpen className="w-12 h-12 text-stone-500 mx-auto" />
              <h4 className="font-display font-bold text-white text-sm">No courses enrolled yet</h4>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                Select between our Cybersecurity or Data Science core programs to unlock sandbox tools and labs.
              </p>
              <Link to="/courses" className="btn-primary px-5 py-2 text-xs font-semibold rounded-lg shadow inline-block mt-2">
                Explore Core Tracks
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const progressPercentage = getCourseProgress(course.id, course.lessons);
                const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';
                
                return (
                  <div
                    key={course.id}
                    className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl hover:border-amber-500/20 transition-all flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex gap-4 items-center flex-1 w-full">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-16 h-12 rounded object-cover border border-stone-850 hidden sm:block flex-shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                          {course.category}
                        </span>
                        <h4 className="font-display font-bold text-sm text-white block leading-tight">
                          {course.title}
                        </h4>
                        
                        {/* Progress Bar container */}
                        <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
                          <div className="flex-grow bg-stone-950 rounded-full h-1.5 max-w-xs">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 font-bold font-mono">{progressPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                      className="btn-secondary px-5 py-2.5 text-xs font-bold rounded-lg whitespace-nowrap"
                    >
                      Enter Classroom
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended Tracks (4 cols) */}
        <aside className="lg:col-span-4 bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl space-y-4 text-left">
          <h3 className="font-display font-bold text-sm text-white border-b border-stone-850 pb-2">
            Recommended Programs
          </h3>

          {recommendedCourses.length === 0 ? (
            <p className="text-xs text-stone-500 text-center py-4 font-semibold">You have enrolled in all core active tracks!</p>
          ) : (
            <div className="space-y-4">
              {recommendedCourses.map((c) => (
                <div key={c.id} className="space-y-3.5 border-b border-stone-850 last:border-0 pb-4 last:pb-0">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-450 border border-amber-500/25 px-1.5 py-0.5 rounded">
                      {c.category}
                    </span>
                    <span className="font-display font-semibold text-xs text-white block leading-snug">
                      {c.title}
                    </span>
                    <span className="text-[10px] text-stone-450 font-medium">{c.duration} lifetime access</span>
                  </div>
                  <Link
                    to={`/courses/${c.slug}`}
                    className="btn-primary w-full py-2 text-[10px] font-bold rounded-lg text-center shadow-sm block"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
