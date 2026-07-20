import api from './api';

export const blogService = {
  // Lấy tất cả blog với phân trang
  getAll: async (page = 1) => {
    const response = await api.get(`/blogs?page=${page}`);
    return response.data;
  },

  // Lấy blog theo slug
  getBySlug: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  // Lấy blog nổi bật
  getFeatured: async (limit = 6) => {
    const response = await api.get(`/blogs/featured/latest?limit=${limit}`);
    return response.data;
  },

  // Tạo blog (Admin)
  create: async (data) => {
    const response = await api.post('/blogs', data);
    return response.data;
  },

  // Cập nhật blog (Admin)
  update: async (id, data) => {
    const response = await api.put(`/blogs/${id}`, data);
    return response.data;
  },

  // Xóa blog (Admin)
  delete: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  }
};
