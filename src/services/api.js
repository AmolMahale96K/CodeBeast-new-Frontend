import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('codebeast_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('codebeast_token');
      localStorage.removeItem('codebeast_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  toggleBookmark: (problemId) => API.put(`/auth/bookmark/${problemId}`),
  getNotifications: () => API.get('/auth/notifications'),
  markNotificationRead: (notifId) => API.put(`/auth/notifications/${notifId}`),
};

export const problemAPI = {
  getProblems: (params) => API.get('/problems', { params }),
  getProblem: (slug) => API.get(`/problems/${slug}`),
  createProblem: (data) => API.post('/problems', data),
  updateProblem: (id, data) => API.put(`/problems/${id}`, data),
  deleteProblem: (id) => API.delete(`/problems/${id}`),
};

export const submissionAPI = {
  runCode: (data) => API.post('/submissions/run', data),
  submitSolution: (problemId, data) => API.post(`/submissions/submit/${problemId}`, data),
  getSubmissions: (problemId) => API.get(problemId ? `/submissions/problem/${problemId}` : '/submissions'),
  getSubmission: (id) => API.get(`/submissions/${id}`),
};

export const assignmentAPI = {
  create: (data) => API.post('/assignments', data),
  getAll: () => API.get('/assignments'),
  getOne: (id) => API.get(`/assignments/${id}`),
  update: (id, data) => API.put(`/assignments/${id}`, data),
  delete: (id) => API.delete(`/assignments/${id}`),
  submit: (id, data) => API.post(`/assignments/${id}/submit`, data),
};

export const testAPI = {
  create: (data) => API.post('/tests', data),
  getAll: () => API.get('/tests'),
  getOne: (id) => API.get(`/tests/${id}`),
  update: (id, data) => API.put(`/tests/${id}`, data),
  delete: (id) => API.delete(`/tests/${id}`),
  start: (id) => API.post(`/tests/${id}/start`),
  publish: (id) => API.put(`/tests/${id}/publish`),
};

export const dashboardAPI = {
  getDashboard: () => API.get('/dashboard'),
  getLeaderboard: () => API.get('/dashboard/leaderboard'),
  getAdminAnalytics: () => API.get('/dashboard/admin'),
  getUsers: () => API.get('/dashboard/admin/users'),
  updateUserRole: (id, role) => API.put(`/dashboard/admin/users/${id}/role`, { role }),
};

export default API;