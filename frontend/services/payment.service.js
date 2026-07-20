import api from './api';

export const createVnpayUrl = async (courseId, userId) => {
  const response = await api.post('/payment/create_url', { courseId, userId });
  return response.data;
};
