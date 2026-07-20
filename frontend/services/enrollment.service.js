import api from './api';

export const enrollmentService = {
  enrollCourse: async (courseId) => api.post('/enrollments', { courseId }),

  checkStatus: async (courseId) => {
    const token = localStorage.getItem('token');
    if (!token) return { data: { isEnrolled: false } };

    return api.get(`/enrollments/check/${courseId}`);
  },

  getMyCourses: async () => api.get('/enrollments/my-courses'),

  updateLastAccessed: async (courseId, lessonSlug, progress) => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    return api.put('/enrollments/last-accessed', {
      courseId,
      lessonSlug,
      progress,
    });
  },
};
