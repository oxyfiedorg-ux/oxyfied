import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Play, CheckCircle2, Circle, 
  Download, FileText, ShieldAlert, Upload, Trash2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import api from '../../services/api';
import type { Lesson, Course } from '../../types';

export const Learning: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const { user, isEnrolled, completeLesson, isLessonCompleted } = useAuth();
  const [activeTab, setActiveTab] = useState<'desc' | 'resources' | 'notes' | 'project'>('desc');
  const [noteInput, setNoteInput] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [lessonResources, setLessonResources] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dynamic course state
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load course details on mount / courseId change
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setIsLoading(true);
        const data = await courseService.getCourseBySlug(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load learning course catalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);
  
  // Flatten syllabus to map paginate listings
  const allLessons: Lesson[] = [];
  course?.modules?.forEach((mod) => {
    mod.lessons.forEach((l) => {
      allLessons.push(l);
    });
  });

  const activeLessonIndex = lessonId 
    ? allLessons.findIndex((l) => l.id === lessonId)
    : 0;
  const activeLesson = allLessons[activeLessonIndex >= 0 ? activeLessonIndex : 0];

  // Redirect to correct URL with active lesson ID if it's missing from the path
  useEffect(() => {
    if (course && !lessonId && activeLesson) {
      navigate(`/dashboard/learn/${course.id}/${activeLesson.id}`, { replace: true });
    }
  }, [course, lessonId, activeLesson, navigate]);

  // Fetch submissions and resources when active lesson changes
  useEffect(() => {
    const fetchSubsAndResources = async () => {
      if (!course?.id || !activeLesson?.id) return;
      try {
        const [subsData, resourcesData] = await Promise.all([
          courseService.getProjectSubmissions(course.id, activeLesson.id),
          courseService.getLessonResources(activeLesson.id)
        ]);
        setSubmissions(subsData);
        setLessonResources(resourcesData);
      } catch (err) {
        console.error('Failed to load project submissions/resources:', err);
      }
    };
    fetchSubsAndResources();
  }, [course?.id, activeLesson?.id]);

  // Security guard logic: checking enrollment (mentors and admins have full access for video referencing and management)
  const userHasAccess = isEnrolled(courseId || '') || user?.role === 'mentor' || user?.role === 'admin';

  // Redirect if unauthorized
  useEffect(() => {
    if (course && !userHasAccess) {
      console.warn('Unauthorized access check failed for program registration.');
    }
  }, [course, userHasAccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-955 text-white flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Classroom...</span>
      </div>
    );
  }

  if (!course || !activeLesson) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-white font-display">Lesson Not Found</h2>
        <Link to="/dashboard" className="btn-primary px-5 py-2.5 text-xs font-semibold rounded-lg shadow">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Handle unauthorized view error screen
  if (!userHasAccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-stone-900 border border-red-950/40 p-8 rounded-2xl shadow-2xl text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
        <div className="space-y-2">
          <h2 className="text-xl font-display font-extrabold text-white">Access Denied</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            The frontend has detected that you do not hold active enrollment status for: <strong>{course.title}</strong>. 
            All lesson URLs are authorized on the server before streams are generated.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to={`/courses/${course.slug}`} className="btn-primary px-6 py-2.5 text-xs font-bold rounded-lg shadow">
            View Pricing & Enroll
          </Link>
          <Link to="/dashboard" className="btn-secondary px-6 py-2.5 text-xs font-semibold rounded-lg">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  // Handle checking completion
  const handleToggleCompletion = async () => {
    await completeLesson(course.id, activeLesson.id);
  };

  // Pagination triggers
  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      const prev = allLessons[activeLessonIndex - 1];
      navigate(`/dashboard/learn/${course.id}/${prev.id}`);
    }
  };

  const handleNextLesson = async () => {
    // Automatically complete current lesson on Next click
    await completeLesson(course.id, activeLesson.id);
    
    if (activeLessonIndex < allLessons.length - 1) {
      const next = allLessons[activeLessonIndex + 1];
      navigate(`/dashboard/learn/${course.id}/${next.id}`);
    }
  };

  // Handle saving private note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setSavedNotes((prev) => [...prev, noteInput]);
    setNoteInput('');
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left max-w-7xl mx-auto">
      
      {/* Left panel: Video, Tabs & Pagination (8 cols) */}
      <main className="lg:col-span-8 space-y-6">
        
        {/* Breadcrumb back navigation */}
        <div className="flex items-center justify-between">
          <Link 
            to={user?.role === 'mentor' ? '/dashboard/mentor/courses' : user?.role === 'admin' ? '/dashboard/admin/courses' : '/dashboard/my-courses'} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {user?.role === 'mentor' ? 'Back to Mentor Courses' : user?.role === 'admin' ? 'Back to Admin Courses' : 'Back to My Courses'}
          </Link>
          {(user?.role === 'mentor' || user?.role === 'admin') && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">
              {user?.role === 'mentor' ? 'Mentor Video Reference' : 'Admin Preview View'}
            </span>
          )}
        </div>

        {/* SECURE VIDEO PLAYER */}
        <VideoPlayer
          courseId={course.id}
          lessonId={activeLesson.id}
          lessonTitle={activeLesson.title}
          onEnded={handleToggleCompletion}
        />

        {/* Classroom pagination controls */}
        <div className="flex items-center justify-between border-y border-stone-850 py-4 px-2">
          <button
            onClick={handlePrevLesson}
            disabled={activeLessonIndex === 0}
            className="btn-secondary px-4 py-2 text-xs font-bold rounded-lg disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleToggleCompletion}
            className={`px-4 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${
              isLessonCompleted(course.id, activeLesson.id)
                ? 'bg-emerald-950/20 text-emerald-450 border-emerald-900/30'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isLessonCompleted(course.id, activeLesson.id) ? 'Completed' : 'Mark as Complete'}
          </button>

          <button
            onClick={handleNextLesson}
            disabled={activeLessonIndex === allLessons.length - 1}
            className="btn-primary px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab options menu */}
        <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-stone-850 text-xs font-bold text-stone-400">
            {[
              { id: 'desc', label: 'Lesson Description' },
              { id: 'resources', label: 'Resources & Downloads' },
              { id: 'notes', label: 'My Notes' },
              { id: 'project', label: 'Submit Project' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 border-b-2 text-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-500 bg-stone-950/30'
                    : 'border-transparent hover:text-white hover:bg-stone-950/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content viewer */}
          <div className="p-6 text-stone-305 text-xs sm:text-sm leading-relaxed">
            
            {/* Tab: Description */}
            {activeTab === 'desc' && (
              <div className="space-y-4 text-left">
                <h3 className="font-display font-bold text-base text-white">{activeLesson.title}</h3>
                <div className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {activeLesson.description || (
                    <span className="text-stone-500 italic">No notes or description defined for this lesson yet.</span>
                  )}
                </div>
                <div className="p-3.5 bg-amber-550/5 border border-amber-500/20 rounded-xl text-amber-400 flex items-start gap-2.5 font-medium text-xs mt-4">
                  <ShieldAlert className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Sandbox Policy Notice</span>
                    <span>All hacking exercises must be run inside offline local machines (Kali VMs) targeting local Sandboxes only. Do not perform operations outside authorized guidelines.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Resources */}
            {activeTab === 'resources' && (
              <div className="space-y-4 text-left">
                <h4 className="font-display font-bold text-white">Download Materials</h4>
                {lessonResources.length === 0 ? (
                  <div className="p-5 bg-stone-955/40 border border-stone-850/50 rounded-xl text-center text-xs text-stone-500 italic">
                    No resource materials uploaded for this lesson.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessonResources.map((res) => {
                      const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
                      const fileUrl = `${baseURL}${res.filePath}`;

                      return (
                        <div key={res.id} className="flex items-center justify-between p-3 bg-stone-955 border border-stone-850 rounded-xl hover:border-stone-800 transition-colors">
                          <span className="flex items-center gap-2 font-medium text-stone-200 text-xs truncate max-w-[70%]">
                            <FileText className="w-4 h-4 text-stone-500" />
                            {res.fileName}
                          </span>
                          <a 
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-500 hover:text-amber-450 bg-stone-900 border border-stone-850 px-2.5 py-1.5 rounded-lg hover:border-amber-500/25 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download ({res.fileSize})
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-5 text-left max-w-3xl">
                <h4 className="font-display font-bold text-white text-base">Personal Lesson Notebook</h4>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  Write down private notes or reminders for this lesson. They are saved to your local workspace session.
                </p>
                
                {savedNotes.length > 0 && (
                  <div className="space-y-2.5 mb-4">
                    {savedNotes.map((note, idx) => (
                      <div key={idx} className="p-3 bg-stone-955 border border-stone-850 rounded-xl text-xs leading-relaxed text-stone-300">
                        {note}
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSaveNote} className="space-y-3">
                  <textarea
                    rows={4}
                    placeholder="Capture key concepts, questions or commands..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-955 border border-stone-850 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="btn-primary px-5 py-2.5 text-[10px] font-bold rounded-xl shadow-sm uppercase tracking-wider"
                  >
                    Save Note
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Project Submission */}
            {activeTab === 'project' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4 text-left">
                  <h4 className="font-display font-bold text-white text-base flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-500" />
                    Submit Lesson Project
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Upload your completed project deliverables (.zip or .pdf) for verification by your course mentor. Maximum allowed file size is 25 MB.
                  </p>

                  {/* Upload Dropzone */}
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center p-8 bg-stone-955 border border-dashed border-stone-850 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all duration-300">
                      <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <Upload className={`w-10 h-10 text-stone-500 ${isUploading ? 'animate-bounce text-amber-500' : 'hover:text-stone-300'}`} />
                        <span className="text-xs font-semibold text-stone-250">
                          {isUploading ? 'Uploading project track...' : 'Click to select project file'}
                        </span>
                        <span className="text-[10px] text-stone-550">ZIP or PDF formats only</span>
                      </div>
                      <input
                        type="file"
                        accept=".zip,.pdf"
                        disabled={isUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validation checks
                          const ext = file.name.split('.').pop()?.toLowerCase();
                          if (ext !== 'zip' && ext !== 'pdf') {
                            setUploadError('Only .zip and .pdf formats are supported.');
                            return;
                          }
                          if (file.size > 25 * 1024 * 1024) {
                            setUploadError('File exceeds the 25 MB size limit.');
                            return;
                          }

                          setUploadError(null);
                          setIsUploading(true);
                          try {
                            await courseService.uploadProjectSubmission(course.id, activeLesson.id, file);
                            const updated = await courseService.getProjectSubmissions(course.id, activeLesson.id);
                            setSubmissions(updated);
                          } catch (err: any) {
                            setUploadError(err.response?.data?.error || 'Failed to submit project track.');
                          } finally {
                            setIsUploading(false);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {uploadError && (
                      <span className="text-[10px] text-red-400 font-medium block">
                        {uploadError}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submission Checklist */}
                <div className="space-y-4 text-left md:border-l border-stone-850 md:pl-8 pt-6 md:pt-0">
                  <h5 className="text-[11px] font-bold text-stone-500 uppercase tracking-widest leading-none">Uploaded Deliverables</h5>
                  {submissions.length === 0 ? (
                    <div className="p-6 bg-stone-955/40 border border-stone-850/50 rounded-xl text-center text-xs text-stone-500 italic">
                      No project deliverables submitted yet for this lesson.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((sub) => {
                        const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
                        const fileUrl = `${baseURL}${sub.filePath}`;

                        return (
                          <div key={sub.id} className="flex items-center justify-between p-3.5 bg-stone-955 border border-stone-850 rounded-xl hover:border-stone-800 transition-colors">
                            <div className="flex flex-col space-y-1 max-w-[70%]">
                              <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-semibold text-stone-200 text-xs truncate hover:text-amber-500 transition-colors"
                              >
                                {sub.fileName}
                              </a>
                              <span className="text-[10px] text-stone-500 font-semibold font-mono">
                                {sub.fileSize} • {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <a 
                                href={fileUrl} 
                                download 
                                className="text-[10px] font-bold text-amber-500 hover:text-amber-450 bg-stone-900 border border-stone-850 px-2.5 py-1.5 rounded-lg"
                              >
                                Download
                              </a>
                              <button 
                                onClick={async () => {
                                  if (!window.confirm(`Delete submission "${sub.fileName}"?`)) return;
                                  try {
                                    await courseService.deleteProjectSubmission(sub.id);
                                    setSubmissions(prev => prev.filter(s => s.id !== sub.id));
                                  } catch (err) {
                                    alert('Failed to delete project submission.');
                                  }
                                }}
                                className="p-1.5 text-stone-500 hover:text-red-400 transition-colors hover:bg-stone-900 rounded-lg"
                                title="Delete Deliverable"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* Right panel: Course syllabus list / checklist (4 cols) */}
      <aside className="lg:col-span-4 bg-[#141210] border border-stone-850 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-140px)] flex flex-col sticky top-24">
        <div className="p-4 border-b border-stone-850 bg-stone-950/20 text-left">
          <h3 className="font-display font-bold text-sm text-white leading-none">Course Curriculum</h3>
          <span className="text-[10px] text-stone-500 font-semibold block mt-1 uppercase">Track Progression</span>
        </div>

        {/* Accordions listing */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(course.modules || []).map((mod) => (
            <div key={mod.id} className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide block">
                {mod.title}
              </span>
              
              <div className="space-y-1.5 pl-1.5">
                {mod.lessons.map((l) => {
                  const isActive = l.id === lessonId;
                  const completed = isLessonCompleted(course.id, l.id);

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/dashboard/learn/${course.id}/${l.id}`)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors text-left ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'hover:bg-stone-950 text-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 flex-1 pr-2 line-clamp-1">
                        <Play className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-500'}`} />
                        <span>{l.title}</span>
                      </span>
                      {completed ? (
                        <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-emerald-450'} flex-shrink-0`} />
                      ) : (
                        <Circle className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-600'} flex-shrink-0`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
};
