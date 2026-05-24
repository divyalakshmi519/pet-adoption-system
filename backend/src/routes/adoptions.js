const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
  applyForAdoption, 
  updateAdoptionStatus, 
  getUserApplications,
  getAllApplications 
} = require('../controllers/adoptionController');

// User routes (authenticated)
router.post('/apply', authenticateToken, applyForAdoption);
router.get('/user/:userId?', authenticateToken, getUserApplications);

// Staff/Admin routes
router.put('/:id/status', authenticateToken, authorizeRoles('shelter_staff', 'admin'), updateAdoptionStatus);
router.get('/all', authenticateToken, authorizeRoles('shelter_staff', 'admin'), getAllApplications);

module.exports = router;