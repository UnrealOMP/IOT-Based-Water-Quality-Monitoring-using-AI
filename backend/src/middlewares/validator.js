import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for sensor ingestion
 */
export const validateSensorReading = [
  body('pH')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH must be a number between 0 and 14'),
  
  body('tds')
    .isFloat({ min: 0 })
    .withMessage('TDS must be a non-negative number'),
  
  body('turbidity')
    .isFloat({ min: 0 })
    .withMessage('Turbidity must be a non-negative number'),
  
  body('temperature')
    .isFloat({ min: -50, max: 100 })
    .withMessage('Temperature must be between -50 and 100'),

  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO 8601 date'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        errors: errors.array(),
      });
    }
    next();
  },
];
