import api from './axios';

export const getMyNotificationsApi = (params) =>
  api.get('/notifications', { params });

export const markNotificationReadApi = (id) =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsReadApi = () =>
  api.patch('/notifications/read-all');
