import api from './api';

export const authService = {
  // Hàm đăng ký
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Hàm đăng nhập
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Hàm lấy thông tin user hiện tại
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Hàm đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};