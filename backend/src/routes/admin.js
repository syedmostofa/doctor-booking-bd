const express = require('express');
const { getDashboardStats, getAllUsers, updateUserRole, deleteUser, getAllPayments } = require('../controllers/adminController');
const { getAllAppointments } = require('../controllers/appointmentsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorizeRoles('admin'));

// GET /api/v1/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/v1/admin/users
router.get('/users', getAllUsers);

// PATCH /api/v1/admin/users/:id/role
router.patch('/users/:id/role', updateUserRole);

// DELETE /api/v1/admin/users/:id
router.delete('/users/:id', deleteUser);

// GET /api/v1/admin/appointments
router.get('/appointments', getAllAppointments);

// GET /api/v1/admin/payments
router.get('/payments', getAllPayments);

module.exports = router;
