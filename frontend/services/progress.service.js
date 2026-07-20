import api from './api';

export const progressService = {
  markCompleted: async (lessonId, courseId) => {
    const user = JSON.parse(localStorage.getItem('user'));

    return api.post('/progress/complete', {
      lessonId,
      courseId,
      userId: user?.id,
    });
  },

  getUserProgress: async (courseId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return api.get(`/progress/${courseId}?userId=${user?.id}`);
  },
};
