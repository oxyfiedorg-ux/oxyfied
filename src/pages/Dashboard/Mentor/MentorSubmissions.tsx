import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ShieldAlert, Loader2, Download, FileText 
} from 'lucide-react';
import { courseService } from '../../../services/courseService';
import api from '../../../services/api';

interface CourseOption {
  id: string;
  title: string;
  category: string;
}

interface ProjectSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  lessonTitle: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  createdAt: string;
}

export const MentorSubmissions: React.FC = () => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubmissionsData = async () => {
      try {
        setLoading(true);
        // Fetch mentor's courses for the filter dropdown
        const coursesData = await courseService.getMentorCourses();
        setCourses(coursesData);

        // Fetch all student project submissions for mentor's courses
        const subsData = await courseService.getMentorSubmissions();
        setSubmissions(subsData);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch student project submissions.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionsData();
  }, []);

  // Filter project submissions based on selection & search string
  const filteredSubmissions = submissions.filter(s => {
    // Filter by selected course
    const courseMatches = selectedCourseId === 'all' || s.courseTitle.toLowerCase() === courses.find(c => c.id === selectedCourseId)?.title.toLowerCase();
    
    // Filter by student search query (name or email or lesson title)
    const searchMatches = 
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.lessonTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.fileName.toLowerCase().includes(search.toLowerCase());

    return courseMatches && searchMatches;
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest">Loading Student Submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-white">Project Submissions</h2>
        <p className="text-xs text-stone-400 mt-1">Review, audit, and download project deliverables uploaded by your students.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-900 border border-stone-850 p-4 rounded-2xl shadow-xl">
        {/* Course Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-955 border border-stone-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
          >
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <BookOpen className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Text Search Bar */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search by student name, email, lesson, or file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-955 border border-stone-850 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Submissions List Container */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl shadow-xl overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs font-semibold">
            No project submissions found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-955/65 border-b border-stone-850 text-stone-400 font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course Program & Lesson</th>
                  <th className="px-6 py-4">Submitted File</th>
                  <th className="px-6 py-4">Date Uploaded</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850/40 text-stone-300">
                {filteredSubmissions.map((sub) => {
                  const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
                  const fileUrl = `${baseURL}${sub.filePath}`;

                  return (
                    <tr key={sub.id} className="hover:bg-stone-950/30 transition-colors">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{sub.studentName}</span>
                          <span className="text-[10px] text-stone-500 font-mono">{sub.studentEmail}</span>
                        </div>
                      </td>

                      {/* Course / Lesson details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-stone-200">{sub.courseTitle}</span>
                          <span className="text-[10px] text-stone-450 italic mt-0.5">{sub.lessonTitle}</span>
                        </div>
                      </td>

                      {/* File Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <FileText className="w-4 h-4 text-stone-500 flex-shrink-0" />
                          <div className="flex flex-col truncate">
                            <a 
                              href={fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-medium hover:text-amber-500 transition-colors truncate"
                            >
                              {sub.fileName}
                            </a>
                            <span className="text-[9px] text-stone-500 font-mono leading-none mt-0.5">{sub.fileSize}</span>
                          </div>
                        </div>
                      </td>

                      {/* Date Submitted */}
                      <td className="px-6 py-4 text-stone-400 font-mono">
                        {new Date(sub.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>

                      {/* Download Action */}
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={fileUrl} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-500 hover:text-amber-450 bg-stone-950 border border-stone-850 px-3 py-2 rounded-xl hover:border-amber-500/30 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download File
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
