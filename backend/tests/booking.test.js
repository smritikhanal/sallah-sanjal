const request = require('supertest');
const path = require('path');

// Load test environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

const express = require('express');

const bookingRoutes = require('../src/routes/bookingRoutes');
const errorHandler = require('../src/middleware/errorHandler');

// Generate a valid test token for testing protected routes
const { generateAccessToken } = require('../src/utils/jwtUtils');
const testToken = generateAccessToken(999, 'client');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/bookings', bookingRoutes);
  app.use(errorHandler);
  return app;
};

describe('Booking Routes - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/bookings', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          workerId: 1,
          serviceId: 1,
          bookingDate: '2025-07-15T10:00:00.000Z',
          durationHours: 2,
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 with invalid booking data when authenticated', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          workerId: null,
          bookingDate: 'invalid-date',
          durationHours: 0,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 when duration is out of range', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          workerId: 1,
          serviceId: 1,
          bookingDate: '2025-07-15T10:00:00.000Z',
          durationHours: 25,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/bookings', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(401);
    });

    it('should return 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`);

      // Should either return bookings array or fail gracefully
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/bookings/:bookingId', () => {
    it('should return 400 with invalid status', async () => {
      const res = await request(app)
        .put('/api/bookings/1')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 with empty status', async () => {
      const res = await request(app)
        .put('/api/bookings/1')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
