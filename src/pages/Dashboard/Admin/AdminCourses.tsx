import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ShieldAlert, Loader2, X, Check, 
  Folder, GraduationCap, Video, Layers, Upload, CheckCircle2, AlertCircle
} from 'lucide-react';
import { courseService } from '../../../services/courseService';

interface CategoryObject {
  id: string;
  name: string;
}

interface MentorObject {
  id: string;
  name: string;
}

interface CourseObject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  price: number;
  discountPrice?: number | null;
  duration: string;
  level: string;
  status: 'draft' | 'available';
  isActive: boolean;
  categoryId: string;
  mentorId: string;
  category?: { name: string };
  mentor?: { name: string };
  skills: string[];
  requirements: string[];
  whoIsItFor: string[];
}

interface LessonObject {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoType: 'bunny' | 'youtube' | 'vimeo' | 'custom';
  videoUrl?: string;
  youtubeVideoId?: string;
  duration: string;
  sortOrder: number;
  isPreview: boolean;
  isActive: boolean;
}

interface ModuleObject {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: LessonObject[];
}

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseObject[]>([]);
  const [categories, setCategories] = useState<CategoryObject[]>([]);
  const [mentors, setMentors] = useState<MentorObject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Main Modals: Add/Edit Course, Curriculum Editor
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseModalType, setCourseModalType] = useState<'add' | 'edit'>('add');
  const [selectedCourse, setSelectedCourse] = useState<CourseObject | null>(null);

  // Curriculum Editor States
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [syllabusCourse, setSyllabusCourse] = useState<CourseObject | null>(null);
  const [modules, setModules] = useState<ModuleObject[]>([]);
  
  // Syllabus Modals: Module form, Lesson form
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleModalType, setModuleModalType] = useState<'add' | 'edit'>('add');
  const [selectedModule, setSelectedModule] = useState<ModuleObject | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleSort, setModuleSort] = useState('0');

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonModalType, setLessonModalType] = useState<'add' | 'edit'>('add');
  const [selectedLesson, setSelectedLesson] = useState<LessonObject | null>(null);
  const [lessonParentModuleId, setLessonParentModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonVideoType, setLessonVideoType] = useState<'bunny' | 'youtube' | 'vimeo' | 'custom'>('bunny');
  const [lessonVideoId, setLessonVideoId] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonSort, setLessonSort] = useState('0');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);

  // Bunny Stream Video Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);

  // Helper to format video duration
  const formatSecondsToMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVideoFileSelect = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'];
    if (!ext || !allowed.includes(ext)) {
      setVideoUploadError('Supported video formats: MP4, MOV, MKV, WebM, AVI.');
      return;
    }

    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    // Auto-detect duration from file
    try {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        if (videoEl.duration && (!lessonDuration || lessonDuration === '10:00')) {
          setLessonDuration(formatSecondsToMinutes(videoEl.duration));
        }
      };
      videoEl.src = URL.createObjectURL(file);
    } catch (e) {
      console.warn('Could not read video metadata:', e);
    }

    // Auto-populate lesson title if empty
    if (!lessonTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setLessonTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }

    try {
      const result = await courseService.uploadBunnyVideo(file, lessonTitle || file.name, (percent) => {
        setVideoUploadProgress(percent);
      });

      setLessonVideoId(result.videoId);
      setLessonVideoUrl(result.hlsUrl || result.directUrl || result.videoId);
      setVideoUploadSuccess(`Video uploaded to Bunny Stream! GUID: ${result.videoId}`);
    } catch (err: any) {
      setVideoUploadError(err.response?.data?.error || 'Failed to upload video to Bunny Stream. Please ensure BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY are configured in .env.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Course Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('8 Weeks');
  const [level, setLevel] = useState('Beginner');
  const [status, setStatus] = useState<'draft' | 'available'>('draft');
  const [skillsInput, setSkillsInput] = useState('');
  const [reqsInput, setReqsInput] = useState('');
  const [whoInput, setWhoInput] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, catData, mentorData] = await Promise.all([
        courseService.getAdminCourses(),
        courseService.getAdminCategories(),
        courseService.getAdminMentors()
      ]);
      setCourses(courseData);
      setCategories(catData);
      setMentors(mentorData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform courses registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Slug automatically from Title on draft creation
  useEffect(() => {
    if (courseModalType === 'add') {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title]);

  const openAddCourse = () => {
    setCourseModalType('add');
    setSelectedCourse(null);
    setTitle('');
    setSlug('');
    setShortDesc('');
    setDescription('');
    setThumbnail('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600');
    setCategoryId(categories[0]?.id || '');
    setMentorId(mentors[0]?.id || '');
    setPrice('');
    setDiscountPrice('');
    setDuration('8 Weeks');
    setLevel('Beginner');
    setStatus('draft');
    setSkillsInput('');
    setReqsInput('');
    setWhoInput('');
    setIsCourseModalOpen(true);
  };

  const openEditCourse = (course: CourseObject) => {
    setCourseModalType('edit');
    setSelectedCourse(course);
    setTitle(course.title);
    setSlug(course.slug);
    setShortDesc(course.shortDescription);
    setDescription(course.description);
    setThumbnail(course.thumbnail);
    setCategoryId(course.categoryId);
    setMentorId(course.mentorId);
    setPrice(course.price.toString());
    setDiscountPrice(course.discountPrice?.toString() || '');
    setDuration(course.duration);
    setLevel(course.level);
    setStatus(course.status);
    setSkillsInput(course.skills.join(', '));
    setReqsInput(course.requirements.join(', '));
    setWhoInput(course.whoIsItFor.join(', '));
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId || !mentorId || !price) {
      setError('Please fill in title, slug, category, mentor, and price values.');
      return;
    }

    const payload = {
      title,
      slug,
      shortDescription: shortDesc,
      description,
      thumbnail,
      categoryId,
      instructorId: mentorId, // Adapts to backend expectations
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      duration,
      level,
      status,
      isActive: status === 'available',
      skills: skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      requirements: reqsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      whoIsItFor: whoInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };

    try {
      setLoading(true);
      if (courseModalType === 'add') {
        const created = await courseService.createCourse(payload);
        // Find Category & Mentor name maps locally
        const cat = categories.find(c => c.id === categoryId);
        const men = mentors.find(m => m.id === mentorId);
        setCourses(prev => [...prev, { ...created, category: cat, mentor: men }]);
        setSuccess(`Course "${title}" created successfully.`);
      } else {
        if (!selectedCourse) return;
        const updated = await courseService.updateCourse(selectedCourse.id, payload);
        const cat = categories.find(c => c.id === categoryId);
        const men = mentors.find(m => m.id === mentorId);
        setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, ...updated, category: cat, mentor: men } : c));
        setSuccess(`Course "${title}" updated successfully.`);
      }
      setIsCourseModalOpen(false);
      setError(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError('Failed to save course. Check for duplicate URL slug.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (course: CourseObject) => {
    if (!window.confirm(`Are you sure you want to completely delete course "${course.title}"? This cannot be undone!`)) return;
    try {
      setLoading(true);
      await courseService.deleteCourse(course.id);
      setCourses(prev => prev.filter(c => c.id !== course.id));
      setSuccess(`Course "${course.title}" deleted.`);
      setTimeout(() => setSuccess(null), 4000);
      setError(null);
    } catch (err) {
      setError('Failed to delete course.');
    } finally {
      setLoading(false);
    }
  };

  // --- Curriculum Actions ---
  const openCurriculum = async (course: CourseObject) => {
    setSyllabusCourse(course);
    setIsSyllabusOpen(true);
    try {
      setLoading(true);
      const data = await courseService.getMentorCourseSyllabus(course.id);
      setModules(data);
    } catch (err) {
      setError('Failed to load course curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModule = () => {
    setModuleModalType('add');
    setSelectedModule(null);
    setModuleTitle('');
    setModuleDesc('');
    setModuleSort('0');
    setIsModuleModalOpen(true);
  };

  const openEditModule = (mod: ModuleObject) => {
    setModuleModalType('edit');
    setSelectedModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || '');
    setModuleSort(mod.sortOrder.toString());
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusCourse || !moduleTitle) return;

    const payload = {
      title: moduleTitle,
      description: moduleDesc,
      sortOrder: parseInt(moduleSort) || 0
    };

    try {
      setLoading(true);
      if (moduleModalType === 'add') {
        const created = await courseService.createModule({ courseId: syllabusCourse.id, ...payload });
        setModules(prev => [...prev, { ...created, lessons: [] }].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        if (!selectedModule) return;
        const updated = await courseService.updateModule(selectedModule.id, payload);
        setModules(prev => prev.map(m => m.id === selectedModule.id ? { ...m, ...updated } : m).sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setIsModuleModalOpen(false);
    } catch (err) {
      setError('Failed to save module.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!window.confirm('Delete this module? All lessons nested inside will also be removed.')) return;
    try {
      setLoading(true);
      await courseService.deleteModule(modId);
      setModules(prev => prev.filter(m => m.id !== modId));
    } catch (err) {
      setError('Failed to delete module.');
    } finally {
      setLoading(false);
    }
  };

  const openAddLesson = (moduleId: string) => {
    setLessonModalType('add');
    setSelectedLesson(null);
    setLessonParentModuleId(moduleId);
    setLessonTitle('');
    setLessonDesc('');
    setLessonVideoType('bunny');
    setLessonVideoId('');
    setLessonVideoUrl('');
    setLessonDuration('10:00');
    setLessonSort('0');
    setLessonIsPreview(false);
    setVideoUploadProgress(0);
    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setIsLessonModalOpen(true);
  };

  const openEditLesson = (lesson: LessonObject) => {
    setLessonModalType('edit');
    setSelectedLesson(lesson);
    setLessonParentModuleId(lesson.moduleId);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || '');
    setLessonVideoType(lesson.videoType || 'bunny');
    setLessonVideoId(lesson.youtubeVideoId || '');
    setLessonVideoUrl(lesson.videoUrl || '');
    setLessonDuration(lesson.duration);
    setLessonSort(lesson.sortOrder.toString());
    setLessonIsPreview(lesson.isPreview);
    setVideoUploadProgress(0);
    setVideoUploadError(null);
    setVideoUploadSuccess(null);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusCourse || !lessonTitle || !lessonDuration) return;

    const payload = {
      courseId: syllabusCourse.id,
      moduleId: lessonParentModuleId,
      title: lessonTitle,
      description: lessonDesc,
      videoType: lessonVideoType,
      youtubeVideoId: lessonVideoId,
      videoUrl: lessonVideoUrl,
      duration: lessonDuration,
      sortOrder: parseInt(lessonSort) || 0,
      isPreview: lessonIsPreview,
      isActive: true
    };

    try {
      setLoading(true);
      if (lessonModalType === 'add') {
        const created = await courseService.createLesson(payload);
        setModules(prev => prev.map(m => {
          if (m.id === lessonParentModuleId) {
            return { ...m, lessons: [...m.lessons, created].sort((a, b) => a.sortOrder - b.sortOrder) };
          }
          return m;
        }));
      } else {
        if (!selectedLesson) return;
        const updated = await courseService.updateLesson(selectedLesson.id, payload);
        setModules(prev => prev.map(m => {
          if (m.id === lessonParentModuleId) {
            return {
              ...m,
              lessons: m.lessons.map(l => l.id === selectedLesson.id ? updated : l).sort((a, b) => a.sortOrder - b.sortOrder)
            };
          }
          return m;
        }));
      }
      setIsLessonModalOpen(false);
    } catch (err) {
      setError('Failed to save lesson details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Delete this lesson permanently?')) return;
    try {
      setLoading(true);
      await courseService.deleteLesson(lessonId);
      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
    } catch (err) {
      setError('Failed to delete lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Course Manager</h2>
          <p className="text-xs text-stone-400 mt-1">Design curricula, assign pricing tags, and allocate mentors.</p>
        </div>
        <button 
          onClick={openAddCourse}
          className="btn-primary flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-bold rounded-xl self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Create New Course
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

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && courses.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Syncing courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <p className="col-span-full p-12 text-center text-stone-550 text-xs font-bold">No courses generated on Neon DB yet.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden flex flex-col shadow-xl group">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-stone-950">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                <span className={`absolute top-3 left-3 text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded border ${
                  course.status === 'available' 
                    ? 'bg-green-950/60 text-green-450 border-green-900/40' 
                    : 'bg-stone-900/60 text-stone-400 border-stone-800'
                }`}>
                  {course.status}
                </span>
              </div>

              {/* Info body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase">
                    <span className="flex items-center gap-1"><Folder className="w-3.5 h-3.5" />{course.category?.name || 'Category'}</span>
                    <span>{course.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug truncate">{course.title}</h3>
                  <p className="text-xs text-stone-450 line-clamp-2">{course.shortDescription}</p>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-stone-850/60">
                  <div className="flex items-center justify-between">
                    {/* Mentor allocation */}
                    <span className="text-[10px] font-semibold text-stone-400 flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                      {course.mentor?.name || 'Assigned Mentor'}
                    </span>
                    {/* Pricing */}
                    <span className="text-sm font-bold text-white font-mono">
                      ${course.price}
                    </span>
                  </div>

                  {/* Settings Actions row */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openCurriculum(course)}
                      className="flex-1 btn-secondary text-[10px] py-1.5 font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Syllabus
                    </button>
                    <button 
                      onClick={() => openEditCourse(course)}
                      className="p-2 text-stone-400 hover:text-white hover:bg-stone-950 border border-stone-850 rounded-lg transition-all"
                      title="Edit Course Meta Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-955/20 border border-stone-850 rounded-lg transition-all"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <form 
            onSubmit={handleSaveCourse}
            className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col text-left shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-stone-850 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-white">
                {courseModalType === 'add' ? 'Create Technical Course' : 'Edit Course Information'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-stone-500 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-300 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Course Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Windows Internals"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">URL Slug</label>
                <input
                  type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. advanced-windows-internals"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Technical Category</label>
                <select
                  value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Mentor */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Assigned Mentor</label>
                <select
                  value={mentorId} onChange={(e) => setMentorId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                >
                  {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Duration</label>
                <input
                  type="text" required value={duration} onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 10 Weeks"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Price ($ USD)</label>
                <input
                  type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 149"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Discount price */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Discount Price (Optional)</label>
                <input
                  type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="e.g. 99"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Difficulty Level</label>
                <select
                  value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Visibility Status</label>
                <select
                  value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="available">Available (Public)</option>
                </select>
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Thumbnail Image URL</label>
                <input
                  type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Unsplash, cloud, or absolute path..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Short description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Short Summary (Headline)</label>
                <input
                  type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Summarize course in one line..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Course Description</label>
                <textarea
                  rows={4} required value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full markdown/text details..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              {/* Skills tags */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Skills Gained (Comma Separated)</label>
                <input
                  type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Kernel debugging, GDB, WinDbg"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Reqs tags */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Prerequisites (Comma Separated)</label>
                <input
                  type="text" value={reqsInput} onChange={(e) => setReqsInput(e.target.value)}
                  placeholder="Basic Assembly, C/C++ familiarity"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Who is it for tags */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-stone-400 uppercase tracking-widest">Target Audience (Comma Separated)</label>
                <input
                  type="text" value={whoInput} onChange={(e) => setWhoInput(e.target.value)}
                  placeholder="Exploit developers, Security engineers"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-850 bg-stone-950/40 text-right space-x-3">
              <button 
                type="button" onClick={() => setIsCourseModalOpen(false)}
                className="btn-secondary px-5 py-2 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading}
                className="btn-primary px-6 py-2 font-bold rounded-xl"
              >
                Save Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Detailed Syllabus / Curriculum Hierarchical Editor Modal --- */}
      {isSyllabusOpen && syllabusCourse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-sm">
          <div className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col text-left shadow-2xl">
            {/* Syllabus Header */}
            <div className="px-6 py-4 border-b border-stone-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Curriculum Editor</span>
                <h3 className="font-display font-extrabold text-sm text-white truncate max-w-lg mt-0.5">{syllabusCourse.title}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={openAddModule}
                  className="btn-primary flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Module
                </button>
                <button 
                  onClick={() => setIsSyllabusOpen(false)}
                  className="p-1 text-stone-550 hover:text-white rounded-lg hover:bg-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Syllabus modules list body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {modules.length === 0 ? (
                <div className="p-12 text-center text-stone-550 text-xs font-semibold italic border border-dashed border-stone-800 rounded-2xl">
                  No syllabus modules designed yet for this course. Click "Add Module" to start.
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((mod, modIdx) => (
                    <div key={mod.id} className="bg-stone-900 border border-stone-850 rounded-xl overflow-hidden shadow-md">
                      {/* Module title row */}
                      <div className="px-5 py-3.5 bg-stone-950/40 border-b border-stone-850 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <div>
                            <h4 className="text-xs font-bold text-white">Module {modIdx + 1}: {mod.title}</h4>
                            {mod.description && <p className="text-[10px] text-stone-500 mt-0.5">{mod.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openAddLesson(mod.id)}
                            className="text-[9px] uppercase font-extrabold text-amber-450 hover:text-white px-2 py-1 rounded bg-amber-955/20 border border-amber-900/35"
                          >
                            + Lesson
                          </button>
                          <button 
                            onClick={() => openEditModule(mod)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1 text-stone-450 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons inside Module */}
                      <div className="p-4 space-y-2">
                        {mod.lessons.length === 0 ? (
                          <p className="text-[10px] text-stone-550 italic px-2 py-1">No lessons populated under this module.</p>
                        ) : (
                          mod.lessons.map((lesson, lesIdx) => (
                            <div key={lesson.id} className="flex items-center justify-between gap-4 bg-stone-950/30 p-2.5 rounded-lg border border-stone-850/50 hover:border-amber-500/10 transition-colors">
                              <div className="flex items-center gap-2.5">
                                <Video className="w-3.5 h-3.5 text-stone-500" />
                                <div>
                                  <span className="text-[11px] font-semibold text-stone-200">
                                    {lesIdx + 1}. {lesson.title}
                                  </span>
                                  <span className="text-[9px] text-stone-550 block font-mono">
                                    Duration: {lesson.duration} {lesson.isPreview && '• [Preview Allowed]'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => openEditLesson(lesson)}
                                  className="p-1 text-stone-400 hover:text-white"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                  className="p-1 text-stone-450 hover:text-red-555"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Syllabus Footer */}
            <div className="px-6 py-4 border-t border-stone-850 bg-stone-950/40 text-right">
              <button 
                onClick={() => setIsSyllabusOpen(false)}
                className="btn-secondary px-5 py-2 text-xs font-bold rounded-xl"
              >
                Close Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Add/Edit Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80">
          <form 
            onSubmit={handleSaveModule}
            className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl space-y-4"
          >
            <h3 className="font-display font-extrabold text-sm text-white">
              {moduleModalType === 'add' ? 'Add Syllabus Module' : 'Edit Module Details'}
            </h3>
            
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-400 uppercase tracking-widest block">Module Title</label>
              <input
                type="text" required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g. Memory Management Essentials"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-400 uppercase tracking-widest block">Summary Description</label>
              <input
                type="text" value={moduleDesc} onChange={(e) => setModuleDesc(e.target.value)}
                placeholder="e.g. Introduction to kernel pool page structures"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-stone-400 uppercase tracking-widest block">Sort Order Index</label>
              <input
                type="number" required value={moduleSort} onChange={(e) => setModuleSort(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="text-right space-x-2.5 pt-2">
              <button 
                type="button" onClick={() => setIsModuleModalOpen(false)}
                className="btn-secondary px-4 py-1.5 text-[11px] font-bold rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-1.5 text-[11px] font-bold rounded-lg disabled:opacity-50"
              >
                Save Module
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lesson Add/Edit Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80">
          <form 
            onSubmit={handleSaveLesson}
            className="bg-[#12100e] border border-stone-850 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4"
          >
            <h3 className="font-display font-extrabold text-sm text-white">
              {lessonModalType === 'add' ? 'Populate Module Lesson' : 'Edit Lesson Details'}
            </h3>

            <div className="space-y-3 text-xs text-stone-300 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest block">Lesson Title</label>
                <input
                  type="text" required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Inspecting Pool Allocations via WinDbg"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest block">Description Details</label>
                <textarea
                  rows={2} value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Summary of video contents..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-400 uppercase tracking-widest block">Video Duration</label>
                  <input
                    type="text" required value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g. 15:30"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-400 uppercase tracking-widest block">Sort Order</label>
                  <input
                    type="number" required value={lessonSort} onChange={(e) => setLessonSort(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-400 uppercase tracking-widest block">Video Stream Host</label>
                <select
                  value={lessonVideoType} onChange={(e) => setLessonVideoType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none"
                >
                  <option value="bunny">Bunny Stream (Recommended)</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="custom">Custom HLS / MP4 Stream</option>
                </select>
              </div>

              {lessonVideoType === 'bunny' ? (
                <div className="space-y-3 p-3 bg-stone-950/60 border border-amber-500/20 rounded-xl">
                  {/* File Upload Dropzone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-amber-400">
                      <span>Upload Video File (Auto-Sync to Bunny)</span>
                      {isUploadingVideo && (
                        <span className="text-amber-400 font-mono font-normal">
                          {videoUploadProgress}% Uploaded
                        </span>
                      )}
                    </div>

                    <label className={`flex flex-col items-center justify-center p-4 bg-stone-900 border border-dashed rounded-xl cursor-pointer transition-all duration-200 group ${
                      isUploadingVideo 
                        ? 'border-amber-500/50 bg-stone-900/80 cursor-wait' 
                        : 'border-stone-800 hover:border-amber-500/50 hover:bg-stone-850/50'
                    }`}>
                      <div className="flex flex-col items-center justify-center space-y-1 text-center">
                        {isUploadingVideo ? (
                          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6 text-amber-500/80 group-hover:text-amber-400" />
                        )}
                        <span className="text-[11px] font-semibold text-stone-200">
                          {isUploadingVideo ? 'Streaming binary to Bunny CDN...' : 'Click or Drop Video (.mp4, .mov, .mkv, .webm)'}
                        </span>
                        <span className="text-[9px] text-stone-500">
                          Auto-transcoded by Bunny into adaptive 1080p, 720p, 480p, 360p
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/*,.mp4,.mov,.mkv,.webm,.avi"
                        disabled={isUploadingVideo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoFileSelect(file);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Progress bar */}
                    {isUploadingVideo && (
                      <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full transition-all duration-300 rounded-full" 
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                    )}

                    {videoUploadSuccess && (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{videoUploadSuccess}</span>
                      </div>
                    )}

                    {videoUploadError && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-medium bg-red-950/20 border border-red-900/40 p-2 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{videoUploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual ID / URL fallback */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-850">
                    <label className="font-bold text-stone-400 uppercase tracking-widest text-[10px] block">
                      Bunny Video GUID or Direct URL (Auto-filled on upload)
                    </label>
                    <input
                      type="text" 
                      required 
                      value={lessonVideoUrl || lessonVideoId} 
                      onChange={(e) => {
                        setLessonVideoUrl(e.target.value);
                        setLessonVideoId(e.target.value);
                      }}
                      placeholder="e.g. 3a1f8c12-9b23-4d33-912a-89a74b4b21c2"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all font-mono text-[11px]"
                    />
                    <p className="text-[9px] text-stone-500">
                      You can also manually paste an existing Bunny Video GUID, iframe embed URL, or .m3u8 link.
                    </p>
                  </div>
                </div>
              ) : lessonVideoType === 'youtube' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-400 uppercase tracking-widest block">YouTube Video ID (Private Key)</label>
                  <input
                    type="text" required value={lessonVideoId} onChange={(e) => setLessonVideoId(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-400 uppercase tracking-widest block">Direct Video Stream URL</label>
                  <input
                    type="text" required value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="e.g. https://domain.com/video.mp4"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-850 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              )}

              {/* Preview Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox" id="isPreview" checked={lessonIsPreview} onChange={(e) => setLessonIsPreview(e.target.checked)}
                  className="w-4.5 h-4.5 accent-amber-500 bg-stone-950 border-stone-800 rounded"
                />
                <label htmlFor="isPreview" className="font-bold text-stone-400 uppercase tracking-widest cursor-pointer select-none">
                  Allow Public Preview (Free Lesson)
                </label>
              </div>
            </div>

            <div className="text-right space-x-2.5 pt-3 border-t border-stone-850/60">
              <button 
                type="button" onClick={() => setIsLessonModalOpen(false)}
                className="btn-secondary px-4 py-1.5 text-[11px] font-bold rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary px-4 py-1.5 text-[11px] font-bold rounded-lg disabled:opacity-50"
              >
                Save Lesson
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
