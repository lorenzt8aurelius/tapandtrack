import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/Auth/login', credentials);
    return response.data;
  },
};

export const sessionsAPI = {
  create: async (sessionData) => {
    const response = await api.post('/Sessions/create', sessionData);
    return response.data;
  },
  
  createTimer: async (sessionData) => {
    const response = await api.post('/Sessions/create-timer', sessionData);
    return response.data;
  },
  
  list: async (teacherId) => {
    const response = await api.get(`/Sessions/list?teacherId=${teacherId}`);
    return response.data;
  },
  
  getActive: async () => {
    const response = await api.get('/Sessions/active');
    return response.data;
  },
  
  getQR: async (sessionCode) => {
    const response = await api.get(`/Sessions/qr/${sessionCode}`);
    return response.data;
  },
  
  refreshQR: async (sessionCode) => {
    const response = await api.post(`/Sessions/refresh-qr/${sessionCode}`);
    return response.data;
  },
  
  end: async (sessionCode) => {
    const response = await api.post(`/Sessions/end/${sessionCode}`);
    return response.data;
  },
};

export const attendanceAPI = {
  record: async (data) => {
    const response = await api.post('/Attendance/record', data);
    return response.data;
  },
  
  getBySession: async (sessionCode) => {
    const response = await api.get(`/Attendance/session/${sessionCode}`);
    return response.data;
  },
  
  getByStudent: async (studentId) => {
    const response = await api.get(`/Attendance/student/${studentId}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getSessionStats: async (sessionCode) => {
    const response = await api.get(`/Analytics/session/${sessionCode}/stats`);
    return response.data;
  },
  
  getTeacherOverview: async (teacherId) => {
    const response = await api.get(`/Analytics/teacher/${teacherId}/overview`);
    return response.data;
  },
  
  getStudentOverview: async (studentId) => {
    const response = await api.get(`/Analytics/student/${studentId}/overview`);
    return response.data;
  },
  
  exportSession: async (sessionCode) => {
    const response = await api.get(`/Analytics/export/${sessionCode}`);
    return response.data;
  },
};

export default api;
