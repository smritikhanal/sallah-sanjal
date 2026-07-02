const validator = require('validator');

/**
 * Validate user registration input
 */
const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName, phone, role } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!firstName || validator.isEmpty(firstName.trim())) {
    errors.push('First name is required');
  }

  if (!lastName || validator.isEmpty(lastName.trim())) {
    errors.push('Last name is required');
  }

  if (role && !['client', 'worker', 'admin'].includes(role)) {
    errors.push('Role must be client, worker, or admin');
  }

  if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
    errors.push('Invalid phone number format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || validator.isEmpty(password.trim())) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate refresh token input
 */
const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken || validator.isEmpty(refreshToken.trim())) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  next();
};

/**
 * Validate booking creation input
 */
const validateCreateBooking = (req, res, next) => {
  const { workerId, serviceId, bookingDate, durationHours, location, notes } = req.body;
  const errors = [];

  if (!workerId) {
    errors.push('Worker ID is required');
  }

  if (!serviceId) {
    errors.push('Service ID is required');
  }

  if (!bookingDate || !validator.isISO8601(bookingDate)) {
    errors.push('Valid booking date is required (ISO 8601 format)');
  }

  if (!durationHours || !validator.isInt(String(durationHours), { min: 1, max: 24 })) {
    errors.push('Duration must be between 1 and 24 hours');
  }

  if (location && typeof location !== 'string') {
    errors.push('Location must be a string');
  }

  if (notes && typeof notes !== 'string') {
    errors.push('Notes must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate booking status update
 */
const validateBookingStatusUpdate = (req, res, next) => {
  const { status, actualCost } = req.body;
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const errors = [];

  if (!status || !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (actualCost && !validator.isNumeric(String(actualCost))) {
    errors.push('Actual cost must be a number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate review creation input
 */
const validateCreateReview = (req, res, next) => {
  const { bookingId, workerId, rating, comment, professionalism, qualityOfWork, communication } = req.body;
  const errors = [];

  if (!bookingId) {
    errors.push('Booking ID is required');
  }

  if (!workerId) {
    errors.push('Worker ID is required');
  }

  if (!rating || !validator.isInt(String(rating), { min: 1, max: 5 })) {
    errors.push('Rating must be between 1 and 5');
  }

  if (comment && typeof comment !== 'string') {
    errors.push('Comment must be a string');
  }

  if (professionalism && !validator.isInt(String(professionalism), { min: 1, max: 5 })) {
    errors.push('Professionalism must be between 1 and 5');
  }

  if (qualityOfWork && !validator.isInt(String(qualityOfWork), { min: 1, max: 5 })) {
    errors.push('Quality of work must be between 1 and 5');
  }

  if (communication && !validator.isInt(String(communication), { min: 1, max: 5 })) {
    errors.push('Communication must be between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate worker profile creation/update
 */
const validateWorkerProfile = (req, res, next) => {
  const { bio, location, hourlyRate, experienceYears } = req.body;
  const errors = [];

  if (bio && typeof bio !== 'string') {
    errors.push('Bio must be a string');
  }

  if (location && typeof location !== 'string') {
    errors.push('Location must be a string');
  }

  if (hourlyRate && !validator.isNumeric(String(hourlyRate))) {
    errors.push('Hourly rate must be a number');
  }

  if (experienceYears && !validator.isInt(String(experienceYears), { min: 0, max: 70 })) {
    errors.push('Experience years must be between 0 and 70');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

/**
 * Validate testimonial creation input
 */
const validateTestimonial = (req, res, next) => {
  const { title, content, rating } = req.body;
  const errors = [];

  if (!title || validator.isEmpty(title.trim())) {
    errors.push('Title is required');
  }

  if (!content || validator.isEmpty(content.trim())) {
    errors.push('Content is required');
  }

  if (!rating || !validator.isInt(String(rating), { min: 1, max: 5 })) {
    errors.push('Rating must be between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateCreateBooking,
  validateBookingStatusUpdate,
  validateCreateReview,
  validateWorkerProfile,
  validateTestimonial,
};
