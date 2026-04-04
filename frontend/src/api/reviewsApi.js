import api from './axios';

export const createReviewApi = (data) => api.post('/reviews', data);

export const getDoctorReviewsApi = (doctorId, params) =>
  api.get(`/reviews/doctor/${doctorId}`, { params });

export const deleteReviewApi = (id) => api.delete(`/reviews/${id}`);
