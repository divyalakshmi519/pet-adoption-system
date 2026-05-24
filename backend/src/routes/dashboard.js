const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAdminAnalytics, getShelterAnalytics } = require('../controllers/dashboardController');

// Admin only routes
router.get('/admin', authenticateToken, authorizeRoles('admin'), getAdminAnalytics);

// Shelter staff and admin routes
router.get('/shelter', authenticateToken, authorizeRoles('shelter_staff', 'admin'), getShelterAnalytics);

module.exports = router;