import axios from 'axios';
import api from './api';
import type { Course } from '../types';

export const courseService = {
  // Public APIs
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  getCourseBySlug: async (slug: string): Promise<Course | null> => {
    try {
      const response = await api.get(`/courses/${slug}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getInstructors: async (): Promise<any[]> => {
    const response = await api.get('/instructors');
    return response.data;
  },

  trackProgress: async (courseId: string, lessonId: string): Promise<boolean> => {
    const response = await api.post(`/progress/complete`, { courseId, lessonId });
    return response.data.success;
  },

  // Admin Panel APIs
  getAdminStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAdminCourses: async () => {
    const response = await api.get('/admin/courses');
    return response.data;
  },

  createCourse: async (data: any) => {
    const response = await api.post('/admin/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: any) => {
    const response = await api.put(`/admin/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Categories CRUD
  getAdminCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Instructors/Mentors CRUD (backward compat)
  getAdminInstructors: async () => {
    const response = await api.get('/admin/instructors');
    return response.data;
  },

  createInstructor: async (data: any) => {
    const response = await api.post('/admin/instructors', data);
    return response.data;
  },

  updateInstructor: async (id: string, data: any) => {
    const response = await api.put(`/admin/instructors/${id}`, data);
    return response.data;
  },

  deleteInstructor: async (id: string) => {
    const response = await api.delete(`/admin/instructors/${id}`);
    return response.data;
  },

  // Mentors CRUD (New)
  getAdminMentors: async () => {
    const response = await api.get('/admin/mentors');
    return response.data;
  },

  createMentor: async (data: any) => {
    const response = await api.post('/admin/mentors', data);
    return response.data;
  },

  updateMentor: async (id: string, data: any) => {
    const response = await api.put(`/admin/mentors/${id}`, data);
    return response.data;
  },

  deleteMentor: async (id: string) => {
    const response = await api.delete(`/admin/mentors/${id}`);
    return response.data;
  },

  // Users CRUD (New)
  getUsers: async (params: any) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  revokeUserSession: async (id: string) => {
    const response = await api.post(`/admin/users/${id}/revoke-session`);
    return response.data;
  },

  // Enrollments CRUD (New)
  getAdminEnrollments: async () => {
    const response = await api.get('/admin/enrollments');
    return response.data;
  },

  createEnrollment: async (data: any) => {
    const response = await api.post('/admin/enrollments', data);
    return response.data;
  },

  updateEnrollment: async (id: string, data: any) => {
    const response = await api.put(`/admin/enrollments/${id}`, data);
    return response.data;
  },

  deleteEnrollment: async (id: string) => {
    const response = await api.delete(`/admin/enrollments/${id}`);
    return response.data;
  },

  // Admin Analytics (New)
  getAdminAnalytics: async (range?: string) => {
    const response = await api.get('/admin/analytics', { params: { range } });
    return response.data;
  },

  // Modules CRUD
  createModule: async (data: any) => {
    const response = await api.post('/admin/modules', data);
    return response.data;
  },

  updateModule: async (id: string, data: any) => {
    const response = await api.put(`/admin/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id: string) => {
    const response = await api.delete(`/admin/modules/${id}`);
    return response.data;
  },

  // Lessons CRUD
  createLesson: async (data: any) => {
    const response = await api.post('/admin/lessons', data);
    return response.data;
  },

  updateLesson: async (id: string, data: any) => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: string) => {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  // Mentor Dashboards APIs (New)
  getMentorCourses: async () => {
    const response = await api.get('/mentor/courses');
    return response.data;
  },

  createMentorCourse: async (data: any) => {
    const response = await api.post('/mentor/courses', data);
    return response.data;
  },

  updateMentorCourse: async (id: string, data: any) => {
    const response = await api.put(`/mentor/courses/${id}`, data);
    return response.data;
  },

  deleteMentorCourse: async (id: string) => {
    const response = await api.delete(`/mentor/courses/${id}`);
    return response.data;
  },

  getMentorCourseSyllabus: async (courseId: string) => {
    const response = await api.get(`/mentor/courses/${courseId}/lessons`);
    return response.data;
  },

  createMentorModule: async (courseId: string, data: any) => {
    const response = await api.post(`/mentor/courses/${courseId}/modules`, data);
    return response.data;
  },

  updateMentorModule: async (id: string, data: any) => {
    const response = await api.put(`/mentor/modules/${id}`, data);
    return response.data;
  },

  deleteMentorModule: async (id: string) => {
    const response = await api.delete(`/mentor/modules/${id}`);
    return response.data;
  },

  createMentorLesson: async (courseId: string, moduleId: string, data: any) => {
    const response = await api.post(`/mentor/courses/${courseId}/modules/${moduleId}/lessons`, data);
    return response.data;
  },

  updateMentorLesson: async (id: string, data: any) => {
    const response = await api.put(`/mentor/lessons/${id}`, data);
    return response.data;
  },

  deleteMentorLesson: async (id: string) => {
    const response = await api.delete(`/mentor/lessons/${id}`);
    return response.data;
  },

  getMentorCourseStudents: async (courseId: string) => {
    const response = await api.get(`/mentor/courses/${courseId}/students`);
    return response.data;
  },

  getMentorAnalytics: async () => {
    const response = await api.get('/mentor/analytics');
    return response.data;
  },

  getMentorProfile: async () => {
    const response = await api.get('/mentor/profile');
    return response.data;
  },

  updateMentorProfile: async (data: any) => {
    const response = await api.put('/mentor/profile', data);
    return response.data;
  },

  uploadProjectSubmission: async (courseId: string, lessonId: string, file: File) => {
    const formData = new FormData();
    formData.append('projectFile', file);
    formData.append('courseId', courseId);
    formData.append('lessonId', lessonId);
    const response = await api.post('/submissions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getProjectSubmissions: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/submissions/${courseId}/${lessonId}`);
    return response.data;
  },

  deleteProjectSubmission: async (id: string) => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },

  uploadLessonResource: async (lessonId: string, file: File) => {
    const formData = new FormData();
    formData.append('resourceFile', file);
    const response = await api.post(`/mentor/lessons/${lessonId}/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getLessonResources: async (lessonId: string) => {
    const response = await api.get(`/lessons/${lessonId}/resources`);
    return response.data;
  },

  deleteLessonResource: async (id: string) => {
    const response = await api.delete(`/mentor/resources/${id}`);
    return response.data;
  },

  getMentorSubmissions: async () => {
    const response = await api.get('/mentor/submissions');
    return response.data;
  },

  // Bunny Stream Video Upload API (Direct upload from browser to Bunny CDN edge to bypass serverless 4.5MB limits)
  uploadBunnyVideo: async (file: File, title?: string, onProgress?: (percent: number) => void) => {
    const videoTitle = title || file.name.replace(/\.[^/.]+$/, '');

    // 1. Ask backend to create the video object in Bunny Stream (lightweight JSON payload < 1KB)
    const initRes = await api.post('/videos/create-bunny-upload', {
      title: videoTitle
    });

    const { videoId, libraryId, apiKey, hlsUrl, embedUrl, directUrl } = initRes.data;

    if (!videoId || !libraryId || !apiKey) {
      throw new Error('Failed to initialize Bunny Stream upload credentials.');
    }

    // 2. Stream video file directly from the browser to Bunny CDN
    await axios.put(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      file,
      {
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/octet-stream'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      }
    );

    return {
      success: true,
      videoId,
      libraryId,
      title: videoTitle,
      hlsUrl,
      embedUrl,
      directUrl
    };
  }
};

