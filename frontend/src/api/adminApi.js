import api from './axios';

export const getAdminStatsApi = () => api.get('/admin/stats');

export const getAdminUsersApi = (params) => api.get('/admin/users', { params });

export const updateUserRoleApi = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

export const deleteUserApi = (id) => api.delete(`/admin/users/${id}`);

export const getAdminAppointmentsApi = (params) =>
  api.get('/admin/appointments', { params });

export const getAdminPaymentsApi = (params) =>
  api.get('/admin/payments', { params });
