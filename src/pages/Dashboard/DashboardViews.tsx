import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Award, CheckCircle2, Play, Download, User as UserIcon, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types';

// 1. My Courses View Page
export const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Loading Registered Programs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-stone-850 pb-3">
        <h2 className="text-xl font-display font-extrabold text-white">My Registered Programs</h2>
        <p className="text-xs text-stone-400">Access video modules, files, and sandbox guides.</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="bg-stone-900 border border-stone-850 p-12 rounded-2xl text-center space-y-4 shadow-xl max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-stone-500 mx-auto" />
          <h3 className="font-display font-bold text-white text-sm">No courses enrolled</h3>
          <p className="text-xs text-stone-400">Enroll in Cybersecurity or Data Science to get started.</p>
          <Link to="/courses" className="btn-primary px-5 py-2 text-xs font-semibold rounded-lg shadow">
            View Programs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            const progressPercentage = Math.round((completedList.length / course.lessons) * 100);
            const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';

            return (
              <div key={course.id} className="bg-stone-900 border border-stone-850 p-5 rounded-2xl shadow-xl hover:border-amber-500/20 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold bg-amber-500/10 text-amber-450 border border-amber-500/25 px-1.5 py-0.5 rounded">
                    {course.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-white leading-snug">{course.title}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">{course.description}</p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1.5 pt-1 border-t border-stone-850">
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold">
                    <span>Syllabus Progress</span>
                    <span className="font-mono">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-stone-950 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <span className="text-[10px] text-stone-500 block font-medium">
                    {completedList.length} of {course.lessons} lessons watched
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                  className="btn-primary w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  Enter Classroom
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 2. Progress Tracking View Page
export const ProgressTracking: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Loading Progress Tracking...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-stone-850 pb-3">
        <h2 className="text-xl font-display font-extrabold text-white">Learning Progress</h2>
        <p className="text-xs text-stone-400">Track which modules have been completed.</p>
      </div>

      {enrolled.length === 0 ? (
        <p className="text-xs text-stone-500 text-center py-8">Enroll in a course to trace progress.</p>
      ) : (
        <div className="space-y-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            
            return (
              <div key={course.id} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="border-b border-stone-850 pb-3">
                  <h3 className="font-display font-bold text-sm text-white">{course.title}</h3>
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">{completedList.length} of {course.lessons} completed</span>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-3">
                  {(course.modules || []).map((mod) => {
                    const completedInMod = mod.lessons.filter((l) => completedList.includes(l.id)).length;
                    const isModFinished = completedInMod === mod.lessons.length;

                    return (
                      <div key={mod.id} className="flex items-center justify-between p-3.5 bg-stone-950 border border-stone-850 rounded-xl">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">{mod.title}</span>
                          <span className="text-[10px] text-stone-400 block font-medium">
                            {completedInMod} of {mod.lessons.length} lessons completed
                          </span>
                        </div>
                        {isModFinished ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-950/20 text-emerald-450 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-900/30 uppercase">
                            Finished
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-stone-900 text-stone-400 text-[10px] font-bold px-2 py-0.5 rounded border border-stone-800 uppercase">
                            In Progress
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 3. Certificates View Page
export const Certificates: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrolled = courses.filter((c) => (user?.enrolledCourses || []).includes(c.id));

  // Determine completed courses
  const completedCourses = enrolled.filter((course) => {
    const completedList = user?.progress[course.id] || [];
    return completedList.length === course.lessons;
  });

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Checking Certificate Credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-stone-850 pb-3">
        <h2 className="text-xl font-display font-extrabold text-white">My Certificates</h2>
        <p className="text-xs text-stone-400">Download shareable verifications of your credentials.</p>
      </div>

      {completedCourses.length === 0 ? (
        <div className="bg-stone-900 border border-stone-850 p-8 rounded-2xl text-center space-y-3 shadow-xl max-w-md mx-auto">
          <Award className="w-12 h-12 text-stone-500 mx-auto" />
          <h3 className="font-display font-bold text-white text-sm">No certificates earned yet</h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
            Certificates will be unlocked here once you mark all lessons in a course syllabus as complete.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCourses.map((course) => (
            <div key={course.id} className="bg-stone-900 border border-stone-850 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-550/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Verifiable Credential</span>
                  <h3 className="font-display font-bold text-sm text-white">{course.title}</h3>
                  <span className="text-[10px] text-stone-500 block font-mono">ID: CERT-Oxyfied-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              <button 
                onClick={() => alert('Downloading PDF Certificate Mock...')}
                className="btn-primary px-5 py-2.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. Settings View Page
interface ProfileInputs {
  name: string;
  phone: string;
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInputs>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (data: ProfileInputs) => {
    // Save to auth local state
    const savedUser = localStorage.getItem('Oxyfied_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const updated = { ...parsed, name: data.name, phone: data.phone };
      localStorage.setItem('Oxyfied_user', JSON.stringify(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl">
      <div className="border-b border-stone-850 pb-3">
        <h2 className="text-xl font-display font-extrabold text-white">Workspace Settings</h2>
        <p className="text-xs text-stone-400">Modify your student profile configurations.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-450 flex-shrink-0" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#141210] border border-stone-850 p-6 rounded-2xl shadow-2xl space-y-4">
        {/* Input: Name */}
        <div className="space-y-1">
          <label htmlFor="settings-name" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
            Student Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="settings-name"
              {...register('name', { required: 'Name is required' })}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 placeholder-stone-600 transition-all"
            />
            <UserIcon className="w-4 h-4 text-stone-550 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.name && <span className="text-[10px] text-red-400 block font-medium">{errors.name.message}</span>}
        </div>

        {/* Input: Phone */}
        <div className="space-y-1">
          <label htmlFor="settings-phone" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="settings-phone"
              {...register('phone')}
              className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 placeholder-stone-600 transition-all"
            />
            <Phone className="w-4 h-4 text-stone-550 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Locked Input: Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
            Email Address (Locked)
          </label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 bg-stone-955 border border-stone-850 rounded-lg text-xs text-stone-600 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          className="btn-primary px-5 py-2.5 text-xs font-bold rounded-lg shadow"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};
