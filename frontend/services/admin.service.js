import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// 1. QUẢN LÝ KHÓA HỌC (COURSE)
// ==========================================

export const getAdminCourses = async (page = 1, limit = 5, search = '') => {
  try {
    let url = `/admin/courses?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi fetch danh sách khóa học Admin:", error);
    throw error;
  }
};

export const getAdminCourseById = async (courseId) => {
  try {
    const response = await api.get(`/admin/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }    
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post(`/admin/courses`, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/admin/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/admin/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePublishCourse = async (courseId) => {
  try {
    const response = await api.patch(`/admin/courses/${courseId}/publish`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 2. QUẢN LÝ CHƯƠNG (CHAPTER / MODULE)
// ==========================================

// Thêm chương mới
export const createChapter = async (courseId, chapterData) => {
  try {
    const response = await api.post(`/admin/courses/${courseId}/chapters`, chapterData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateChapter = async (chapterId, chapterData) => {
  try {
    const response = await api.put(`/admin/chapters/${chapterId}`, chapterData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteChapter = async (chapterId) => {
  try {
    const response = await api.delete(`/admin/chapters/${chapterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 3. QUẢN LÝ BÀI HỌC (LESSON)
// ==========================================

// 3. Thêm bài học mới
export const createLesson = async (chapterId, lessonData) => {
  try {
    const response = await api.post(`/admin/chapters/${chapterId}/lessons`, lessonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật nội dung bài học
export const updateLessonContent = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/admin/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật bài học:", error);
    throw error;
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/admin/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 4. QUẢN LÝ BÀI TẬP THỰC HÀNH (PROBLEM)
// ==========================================

export const getProblemsByLessonId = async (lessonId) => {
  try {
    const response = await api.get(`/problems/admin/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProblem = async (problemData) => {
  try {
    const response = await api.post(`/problems`, problemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProblem = async (problemId, problemData) => {
  try {
    const response = await api.put(`/problems/${problemId}`, problemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const response = await api.delete(`/problems/${problemId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 5. TRỢ LÝ AI (AI GENERATION)
// ==========================================
export const generateProblemWithAI = async (promptData) => {
  try {
    const response = await api.post(`/ai/generate-problem`, promptData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 6. QUẢN LÝ NGƯỜI DÙNG (USER)
// ==========================================
export const getAdminUsers = async (page = 1, limit = 10, search = '') => {
  try {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProgressAdmin = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/progress`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 7. THỐNG KÊ DASHBOARD
// ==========================================
export const getAdminDashboardStats = async (startDate = '', endDate = '') => {
    let url = `/admin/dashboard-stats`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data;
};

// ==========================================
// 8. UPLOAD FILE
// ==========================================
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/admin/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};