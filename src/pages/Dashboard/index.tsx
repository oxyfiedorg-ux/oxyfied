import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Award, Play, Loader2, Sparkles } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-bold uppercase tracking-widest">Loading Dashboard...</span>
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
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      {/* Welcome banner / User profile card */}
      <div className="bg-deep-navy text-warm-white p-6 sm:p-8 rounded-2xl shadow-sm border border-light-taupe flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,107,33,0.15),transparent_50%)] pointer-events-none" />
        <div className="space-y-2.5 text-center md:text-left relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-burnt-orange/20 border border-burnt-orange/30 text-burnt-orange text-xs font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            LMS Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-warm-white">
            Welcome back, {user?.name || 'Learner'}!
          </h2>
          <p className="text-warm-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
            Resume building technologies. We track your progress as you complete practical cybersecurity and data science modules.
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
            className="btn-primary px-6 py-3 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg relative z-10 flex-shrink-0"
          >
            Continue Learning
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric: Enrolled */}
        <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-burnt-orange/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-warm-gray uppercase tracking-widest block">Enrolled Courses</span>
            <span className="text-2xl font-display font-extrabold text-deep-navy block mt-0.5">{totalEnrolled}</span>
          </div>
        </div>

        {/* Metric: Progress */}
        <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-burnt-orange/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-sage-green/15 border border-sage-green/30 flex items-center justify-center text-sage-green">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-warm-gray uppercase tracking-widest block">Lessons Completed</span>
            <span className="text-2xl font-display font-extrabold text-deep-navy block mt-0.5">{totalCompletedLessons}</span>
          </div>
        </div>

        {/* Metric: Certs */}
        <div className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:border-burnt-orange/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-deep-navy/10 border border-deep-navy/20 flex items-center justify-center text-deep-navy">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-warm-gray uppercase tracking-widest block">Certificates Earned</span>
            <span className="text-2xl font-display font-extrabold text-deep-navy block mt-0.5">
              {enrolledCourses.filter(c => getCourseProgress(c.id, c.lessons) === 100).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard columns: Current Courses (8) vs Suggestions (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Enrolled Courses (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          <h3 className="font-display font-bold text-base text-deep-navy border-b border-light-taupe pb-2">
            My Enrolled Tracks
          </h3>

          {enrolledCourses.length === 0 ? (
            <div className="bg-warm-white border border-light-taupe p-12 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-warm-ivory border border-light-taupe flex items-center justify-center mx-auto text-warm-gray">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-deep-navy text-base">No courses enrolled yet</h4>
              <p className="text-xs sm:text-sm text-warm-gray leading-relaxed max-w-sm mx-auto">
                Select between our Cybersecurity or Data Science core programs to unlock sandbox tools and labs.
              </p>
              <div className="pt-2">
                <Link to="/courses" className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl shadow inline-block">
                  Explore Core Tracks
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const progressPercentage = getCourseProgress(course.id, course.lessons);
                const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';
                
                return (
                  <div
                    key={course.id}
                    className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm hover:border-burnt-orange/30 transition-all flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex gap-4 items-center flex-1 w-full">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-20 h-14 rounded-xl object-cover border border-light-taupe hidden sm:block flex-shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <span className="text-[10px] uppercase font-bold text-burnt-orange tracking-wider">
                          {course.category}
                        </span>
                        <h4 className="font-display font-bold text-base text-deep-navy block leading-tight">
                          {course.title}
                        </h4>
                        
                        {/* Progress Bar container */}
                        <div className="flex items-center gap-3 pt-1 justify-center sm:justify-start">
                          <div className="flex-grow bg-soft-beige rounded-full h-2 max-w-xs">
                            <div
                              className="bg-burnt-orange h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-warm-gray font-bold font-mono">{progressPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                      className="btn-secondary px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap"
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
        <aside className="lg:col-span-4 bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm space-y-4 text-left">
          <h3 className="font-display font-bold text-base text-deep-navy border-b border-light-taupe pb-2">
            Recommended Programs
          </h3>

          {recommendedCourses.length === 0 ? (
            <p className="text-xs text-warm-gray text-center py-4 font-semibold">You have enrolled in all core active tracks!</p>
          ) : (
            <div className="space-y-4">
              {recommendedCourses.map((c) => (
                <div key={c.id} className="space-y-3 border-b border-light-taupe last:border-0 pb-4 last:pb-0">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20 px-2 py-0.5 rounded-md">
                      {c.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-deep-navy block leading-snug">
                      {c.title}
                    </h4>
                    <span className="text-[10px] text-warm-gray font-medium">{c.duration} lifetime access</span>
                  </div>
                  <Link
                    to={`/courses/${c.slug}`}
                    className="btn-primary w-full py-2 text-xs font-bold rounded-xl text-center shadow-sm block"
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
