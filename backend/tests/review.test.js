const request = require('supertest');
const path = require('path');

// Load test environment
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

const express = require('express');
const reviewRoutes = require('../src/routes/reviewRoutes');
const { errorHandler } = require('../src/middleware/errorHandler');

// Generate a valid test token
const { generateAccessToken } = require('../src/utils/jwtUtils');
const testToken = generateAccessToken(999, 'client');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/reviews', reviewRoutes);
  app.use(errorHandler);
  return app;
};

describe('Review Routes - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/reviews/worker/:workerId', () => {
    it('should return reviews for a valid worker ID (public)', async () => {
      const res = await request(app)
        .get('/api/reviews/worker/1');

      // Should succeed (public route) even if no reviews exist
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/reviews', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({
          bookingId: 1,
          workerId: 1,
          rating: 5,
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 with missing required fields when authenticated', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 with invalid rating', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookingId: 1,
          workerId: 1,
          rating: 6,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 with negative rating', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookingId: 1,
          workerId: 1,
          rating: -1,
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when bookingId is missing', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          workerId: 1,
          rating: 5,
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 when workerId is missing', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bookingId: 1,
          rating: 5,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/reviews/user/reviews', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app)
        .get('/api/reviews/user/reviews');

      expect(res.status).toBe(401);
    });
  });
});
