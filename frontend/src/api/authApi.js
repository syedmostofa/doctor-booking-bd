import api from './axios';

export const loginApi = (credentials) => api.post('/auth/login', credentials);

export const registerApi = (userData) => api.post('/auth/register', userData);

export const getMeApi = () => api.get('/auth/me');

export const forgotPasswordApi = (email) => api.post('/auth/forgot-password', { email });

export const resetPasswordApi = (token, password) =>
  api.post('/auth/reset-password', { token, password });

export const updateProfileApi = (data) => api.patch('/auth/profile', data);

export const changePasswordApi = (current_password, new_password) =>
  api.post('/auth/change-password', { current_password, new_password });
