const request = require('supertest');
const path = require('path');

// Load test environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

// We need to require the app after setting env vars
// For integration testing we create a minimal test app instance

const express = require('express');
const authRoutes = require('../src/routes/authRoutes');
const errorHandler = require('../src/middleware/errorHandler');

// Create a test app with just the routes we need
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
};

describe('Auth Routes - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123', firstName: 'John', lastName: 'Doe' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when firstName is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          lastName: 'Doe',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 with invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'superadmin',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 with invalid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: 'abc',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid', password: 'password123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should return 400 when refresh token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Refresh token is required');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/auth/verify');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token format', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidToken');

      expect(res.status).toBe(401);
    });
  });
});
