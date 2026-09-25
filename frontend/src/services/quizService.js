import api from './api';

export const quizService = {
  // Get all published quizzes (supports search, category, difficulty)
  getQuizzes: async (params = {}) => {
    return await api.get('/quizzes', { params });
  },

  // Get details of a single quiz (e.g., instructions)
  getQuizById: async (quizId) => {
    return await api.get(`/quizzes/${quizId}`);
  },

  // Get questions for taking quiz (correct answers stripped)
  getQuizQuestions: async (quizId) => {
    return await api.get(`/quizzes/${quizId}/questions`);
  },

  // Get aggregate statistics for public landing page
  getPublicStats: async () => {
    return await api.get('/public/stats');
  },
};
