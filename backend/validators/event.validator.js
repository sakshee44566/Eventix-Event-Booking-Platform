import { body } from 'express-validator';

export const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['music', 'tech', 'business', 'education', 'sports', 'arts'])
    .withMessage('Invalid category'),
  
  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Event start time is required'),
  
  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('Event end time is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Event location is required'),
  
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Event venue is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('Event city is required'),
  
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer name is required'),
  
  body('price')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('ticketTiers')
    .isArray({ min: 1 })
    .withMessage('At least one ticket tier is required'),
  
  body('ticketTiers.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ticket tier name is required'),
  
  body('ticketTiers.*.price')
    .notEmpty()
    .withMessage('Ticket tier price is required')
    .isFloat({ min: 0 })
    .withMessage('Ticket tier price must be a positive number'),
  
  body('ticketTiers.*.available')
    .notEmpty()
    .withMessage('Available tickets is required')
    .isInt({ min: 0 })
    .withMessage('Available tickets must be a non-negative integer'),
  
  body('ticketTiers.*.total')
    .notEmpty()
    .withMessage('Total tickets is required')
    .isInt({ min: 0 })
    .withMessage('Total tickets must be a non-negative integer')
];

