import api from './api';

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getAllCourses = async (queryParams = '') => {
  const url = queryParams ? `/courses?${queryParams}` : '/courses';
  const response = await api.get(url);
  return response.data;
};

export const getCourseBySlug = async (slug) => {
  const response = await api.get(`/courses/${slug}`);
  return response.data;
};

export const getLessonBySlug = async (slug) => {
  const response = await api.get(`/lessons/${slug}`);
  return response.data;
};

export const getProblemByLessonId = async (lessonId) => {
  const response = await api.get(`/problems/lesson/${lessonId}`);
  return response.data;
};
