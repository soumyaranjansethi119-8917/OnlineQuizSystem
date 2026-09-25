import api from './api';

export const adminService = {
  // Statistics and metrics for admin dashboard
  getStatistics: async () => {
    return await api.get('/admin/statistics');
  },

  // Student user list
  getUsers: async () => {
    return await api.get('/admin/users');
  },

  // Quizzes CRUD
  getQuizzes: async () => {
    return await api.get('/admin/quizzes');
  },

  getQuizById: async (quizId) => {
    return await api.get(`/admin/quizzes/${quizId}`);
  },

  createQuiz: async (quizData) => {
    return await api.post('/admin/quizzes', quizData);
  },

  updateQuiz: async (quizId, quizData) => {
    return await api.put(`/admin/quizzes/${quizId}`, quizData);
  },

  toggleQuizStatus: async (quizId, status) => {
    return await api.patch(`/admin/quizzes/${quizId}/status`, { status });
  },

  deleteQuiz: async (quizId) => {
    return await api.delete(`/admin/quizzes/${quizId}`);
  },

  // Questions CRUD
  getQuizQuestions: async (quizId) => {
    return await api.get(`/admin/quizzes/${quizId}/questions`);
  },

  addQuestion: async (quizId, questionData) => {
    return await api.post(`/admin/quizzes/${quizId}/questions`, questionData);
  },

  getQuestionById: async (questionId) => {
    return await api.get(`/admin/questions/${questionId}`);
  },

  updateQuestion: async (questionId, questionData) => {
    return await api.put(`/admin/questions/${questionId}`, questionData);
  },

  deleteQuestion: async (questionId) => {
    return await api.delete(`/admin/questions/${questionId}`);
  },
};
