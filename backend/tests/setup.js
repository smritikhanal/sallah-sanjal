const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

// Override with test-specific settings if needed
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRE = '15m';
process.env.JWT_REFRESH_EXPIRE = '7d';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.DB_NAME = process.env.DB_NAME || 'sallah_sanjal_test';
process.env.DB_PORT = process.env.DB_PORT || '3306';

// Export common test utilities
const request = require('supertest');

module.exports = {
  request,
};
