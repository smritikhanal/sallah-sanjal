import apiClient from './api';
import { useAuthStore } from '../utils/store';

// Auth services
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken }),
};

// Admin services
export const adminService = {
  getAnalytics: () => apiClient.get('/admin/analytics'),
  getAnalyticsTrends: () => apiClient.get('/admin/analytics/trends'),
  getAllWorkers: (params) => apiClient.get('/admin/workers', { params }),
  getWorkerDetail: (workerId) => apiClient.get(`/admin/workers/${workerId}`),
  verifyWorker: (workerId, data) => apiClient.patch(`/admin/workers/${workerId}/verify`, data),
  getAllClients: () => apiClient.get('/admin/clients'),
  getIssues: () => apiClient.get('/admin/issues'),
  updateIssueStatus: (issueId, data) => apiClient.patch(`/admin/issues/${issueId}`, data),
  getTestimonials: () => apiClient.get('/admin/testimonials'),
  updateTestimonialVisibility: (testimonialId, data) => apiClient.patch(`/admin/testimonials/${testimonialId}/visibility`, data),
};

// Worker services
export const workerService = {
  getAllWorkers: (params) => apiClient.get('/workers/all', { params }),
  getWorkerProfile: (workerId) => apiClient.get(`/workers/${workerId}`),
  createWorkerProfile: (data) => apiClient.post('/workers/profile', data),
  addServiceToWorker: (data) => apiClient.post('/workers/services', data),
  getCurrentWorkerProfile: () => apiClient.get('/workers/me'),
  updateWorkerProfile: (data) => apiClient.put('/workers/profile', data),
  getWorkerBookings: () => apiClient.get('/workers/bookings'),
  getWorkerReviews: () => apiClient.get('/workers/reviews'),
  getWorkerTestimonials: () => apiClient.get('/workers/testimonials'),
  createTestimonial: (data) => apiClient.post('/workers/testimonials', data),
  updateTestimonial: (testimonialId, data) => apiClient.patch(`/workers/testimonials/${testimonialId}`, data),
  deleteTestimonial: (testimonialId) => apiClient.delete(`/workers/testimonials/${testimonialId}`),
  updateBookingStatus: (bookingId, data) => apiClient.patch(`/workers/bookings/${bookingId}`, data),
};

// Booking services
export const bookingService = {
  createBooking: (data) => apiClient.post('/bookings', data),
  getUserBookings: () => apiClient.get('/bookings'),
  getBookingDetails: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, data) => apiClient.put(`/bookings/${bookingId}`, data),
};

// Review services
export const reviewService = {
  createReview: (data) => apiClient.post('/reviews', data),
  getWorkerReviews: (workerId, params) => apiClient.get(`/reviews/worker/${workerId}`, { params }),
  getUserReviews: () => apiClient.get('/reviews/user/reviews'),
};

// Chat services
export const chatService = {
  getOrCreateConversation: (data) => apiClient.post('/chat/conversation', data),
  getUserConversations: () => apiClient.get('/chat/conversations'),
  getConversationMessages: (conversationId, params) =>
    apiClient.get(`/chat/${conversationId}/messages`, { params }),
  markMessageAsRead: (messageId) => apiClient.put(`/chat/messages/${messageId}/read`),
  sendMessage: (conversationId, message) => apiClient.post(`/chat/${conversationId}/messages`, { message }),
};

// Client services
export const clientService = {
  getCurrentClientProfile: () => apiClient.get('/client/profile'),
  updateClientProfile: (data) => apiClient.put('/client/profile', data),
getClientBookings: (params) => apiClient.get('/client/bookings', { params }),
  createBooking: (data) => apiClient.post('/bookings', data),
  getBookingDetails: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, data) => apiClient.patch(`/bookings/${bookingId}`, data),
  getClientMessages: () => apiClient.get('/client/messages'),
};

// Category services
export const categoryService = {
  getAllCategories: () => apiClient.get('/categories/all'),
  getWorkersByCategory: (categoryId, params) => apiClient.get(`/categories/${categoryId}/workers`, { params }),
};
