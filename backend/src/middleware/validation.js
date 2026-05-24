const { body, validationResult } = require('express-validator');

const validatePet = [
  body('name').notEmpty().withMessage('Pet name is required'),
  body('category_id').isInt().withMessage('Valid category is required'),
  body('shelter_id').isInt().withMessage('Valid shelter is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateAdoption = [
  body('pet_id').isInt().withMessage('Valid pet ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validatePet, validateAdoption };