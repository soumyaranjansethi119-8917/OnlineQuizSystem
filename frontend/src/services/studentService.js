import api from './api';

export const studentService = {
  // Submit answers for server evaluation
  submitQuiz: async (submissionData) => {
    return await api.post('/submit-quiz', submissionData);
  },

  // Get student's attempt history
  getHistory: async () => {
    return await api.get('/history');
  },

  // Get result and question-by-question review of a specific attempt
  getAttemptDetail: async (attemptId) => {
    return await api.get(`/history/${attemptId}`);
  },

  // Get global or quiz-specific leaderboard
  getLeaderboard: async (quizId = '') => {
    const params = quizId && quizId !== 'all' ? { quiz_id: quizId } : {};
    return await api.get('/leaderboard', { params });
  },
};
