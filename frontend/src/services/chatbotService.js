import api from './api';

export const chatbotService = {
  // Send educational question to backend AI endpoint
  sendMessage: async (message) => {
    return await api.post('/chat', { message });
  },

  // Get conversation history
  getHistory: async () => {
    return await api.get('/chat/history');
  },

  // Clear conversation history
  clearHistory: async () => {
    return await api.delete('/chat/history');
  },
};
