const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { addPet, getPets, getPetById, updatePetStatus, updatePet } = require('../controllers/petController');
const { validatePet } = require('../middleware/validation');

// Public routes (no authentication needed)
router.get('/', getPets);
router.get('/:id', getPetById);

// Protected routes (require authentication)
router.post('/', authenticateToken, authorizeRoles('shelter_staff', 'admin'), validatePet, addPet);
router.put('/:id/status', authenticateToken, authorizeRoles('shelter_staff', 'admin'), updatePetStatus);
router.put('/:id', authenticateToken, authorizeRoles('shelter_staff', 'admin'), updatePet);

module.exports = router; 