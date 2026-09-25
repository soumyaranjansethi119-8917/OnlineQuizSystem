// Application Constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

export const QUIZ_DIFFICULTIES = ['easy', 'medium', 'hard'];

export const QUIZ_STATUSES = ['published', 'draft', 'inactive'];
