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
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-bold uppercase tracking-widest">Loading Registered Programs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      <div className="border-b border-light-taupe pb-3">
        <h2 className="text-2xl font-display font-extrabold text-deep-navy">My Registered Programs</h2>
        <p className="text-xs sm:text-sm text-warm-gray">Access video modules, files, and sandbox guides.</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="bg-warm-white border border-light-taupe p-12 rounded-2xl text-center space-y-4 shadow-sm max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-warm-ivory border border-light-taupe flex items-center justify-center mx-auto text-warm-gray">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-deep-navy text-base">No courses enrolled</h3>
          <p className="text-xs text-warm-gray leading-relaxed">Enroll in Cybersecurity or Data Science to get started.</p>
          <div className="pt-2">
            <Link to="/courses" className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl shadow inline-block">
              View Programs
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            const progressPercentage = Math.round((completedList.length / course.lessons) * 100);
            const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id || '';

            return (
              <div key={course.id} className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm hover:border-burnt-orange/30 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20 px-2 py-0.5 rounded-md">
                    {course.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-deep-navy leading-snug">{course.title}</h3>
                  <p className="text-warm-gray text-xs leading-relaxed line-clamp-2">{course.description}</p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-2 border-t border-light-taupe">
                  <div className="flex justify-between text-xs text-warm-gray font-bold">
                    <span>Syllabus Progress</span>
                    <span className="font-mono text-deep-navy">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-soft-beige rounded-full h-2">
                    <div className="bg-burnt-orange h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                  </div>
                  <span className="text-[11px] text-warm-gray block font-medium">
                    {completedList.length} of {course.lessons} lessons completed
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/dashboard/learn/${course.id}/${firstLessonId}`)}
                  className="btn-primary w-full py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow"
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
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-bold uppercase tracking-widest">Loading Progress Tracking...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      <div className="border-b border-light-taupe pb-3">
        <h2 className="text-2xl font-display font-extrabold text-deep-navy">Learning Progress</h2>
        <p className="text-xs sm:text-sm text-warm-gray">Track which modules have been completed across your syllabus.</p>
      </div>

      {enrolled.length === 0 ? (
        <p className="text-xs sm:text-sm text-warm-gray text-center py-12">Enroll in a course to trace progress.</p>
      ) : (
        <div className="space-y-6">
          {enrolled.map((course) => {
            const completedList = user?.progress[course.id] || [];
            
            return (
              <div key={course.id} className="bg-warm-white border border-light-taupe p-6 sm:p-8 rounded-2xl shadow-sm space-y-5">
                <div className="border-b border-light-taupe pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-deep-navy">{course.title}</h3>
                    <span className="text-xs text-warm-gray font-medium">{completedList.length} of {course.lessons} lessons completed</span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-burnt-orange/10 text-burnt-orange border border-burnt-orange/20">
                    {Math.round((completedList.length / course.lessons) * 100)}%
                  </span>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-3">
                  {(course.modules || []).map((mod) => {
                    const completedInMod = mod.lessons.filter((l) => completedList.includes(l.id)).length;
                    const isModFinished = completedInMod === mod.lessons.length && mod.lessons.length > 0;

                    return (
                      <div key={mod.id} className="flex items-center justify-between p-4 bg-warm-ivory border border-light-taupe rounded-xl">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-deep-navy block">{mod.title}</span>
                          <span className="text-[10px] text-warm-gray block font-medium">
                            {completedInMod} of {mod.lessons.length} lessons completed
                          </span>
                        </div>
                        {isModFinished ? (
                          <span className="inline-flex items-center gap-1 bg-sage-green/15 text-sage-green text-[10px] font-bold px-2.5 py-1 rounded-md border border-sage-green/30 uppercase tracking-wider">
                            Finished
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-warm-white text-warm-gray text-[10px] font-bold px-2.5 py-1 rounded-md border border-light-taupe uppercase tracking-wider">
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
    return completedList.length === course.lessons && course.lessons > 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
        <span className="text-xs text-warm-gray font-bold uppercase tracking-widest">Checking Certificate Credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      <div className="border-b border-light-taupe pb-3">
        <h2 className="text-2xl font-display font-extrabold text-deep-navy">My Certificates</h2>
        <p className="text-xs sm:text-sm text-warm-gray">Download shareable verifications of your technical credentials.</p>
      </div>

      {completedCourses.length === 0 ? (
        <div className="bg-warm-white border border-light-taupe p-10 rounded-2xl text-center space-y-3 shadow-sm max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-warm-ivory border border-light-taupe flex items-center justify-center mx-auto text-warm-gray">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-deep-navy text-base">No certificates earned yet</h3>
          <p className="text-xs text-warm-gray max-w-xs mx-auto leading-relaxed">
            Certificates will be unlocked here automatically once you mark all lessons in a course syllabus as complete.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedCourses.map((course) => (
            <div key={course.id} className="bg-warm-white border border-light-taupe p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-sage-green/15 border border-sage-green/30 flex items-center justify-center text-sage-green flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-burnt-orange tracking-wider">Verifiable Credential</span>
                  <h3 className="font-display font-bold text-base text-deep-navy">{course.title}</h3>
                  <span className="text-[10px] text-warm-gray block font-mono">ID: CERT-OXYFIED-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              <button 
                onClick={() => alert('Downloading PDF Certificate Mock...')}
                className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow"
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
      <div className="border-b border-light-taupe pb-3">
        <h2 className="text-2xl font-display font-extrabold text-deep-navy">Workspace Settings</h2>
        <p className="text-xs sm:text-sm text-warm-gray">Modify your student profile configurations.</p>
      </div>

      {success && (
        <div className="p-4 bg-sage-green/15 border border-sage-green/30 text-deep-navy text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-sage-green flex-shrink-0" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-warm-white border border-light-taupe p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
        {/* Input: Name */}
        <div className="space-y-1.5">
          <label htmlFor="settings-name" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
            Student Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="settings-name"
              {...register('name', { required: 'Name is required' })}
              className="w-full pl-9 pr-3 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-warm-white focus:border-burnt-orange placeholder-warm-gray/60 transition-all"
            />
            <UserIcon className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.name && <span className="text-[10px] text-red-600 block font-medium">{errors.name.message}</span>}
        </div>

        {/* Input: Phone */}
        <div className="space-y-1.5">
          <label htmlFor="settings-phone" className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="settings-phone"
              {...register('phone')}
              className="w-full pl-9 pr-3 py-2.5 bg-warm-ivory border border-light-taupe rounded-xl text-xs text-deep-navy focus:outline-none focus:bg-warm-white focus:border-burnt-orange placeholder-warm-gray/60 transition-all"
            />
            <Phone className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Locked Input: Email */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-deep-navy uppercase tracking-widest block">
            Email Address (Locked)
          </label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="w-full px-3.5 py-2.5 bg-soft-beige/50 border border-light-taupe rounded-xl text-xs text-warm-gray cursor-not-allowed"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl shadow"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
