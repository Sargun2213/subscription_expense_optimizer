import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../db/prisma.js';

describe('Backend API Integration Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;
  let createdSubId: string;

  const testUser1 = {
    email: `testuser1_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'User One',
    preferredCurrency: 'USD'
  };

  const testUser2 = {
    email: `testuser2_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'User Two',
    preferredCurrency: 'USD'
  };

  beforeAll(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send(testUser1);
    expect(res1.status).toBe(201);
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send(testUser2);
    expect(res2.status).toBe(201);
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;
  });

  afterAll(async () => {
    // Cleanup test users
    if (user1Id) {
      await prisma.user.delete({ where: { id: user1Id } }).catch(() => {});
    }
    if (user2Id) {
      await prisma.user.delete({ where: { id: user2Id } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('POST /api/auth/register prevents duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser1);
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  it('POST /api/auth/login validates credentials correctly', async () => {
    const validRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser1.email, password: testUser1.password });
    expect(validRes.status).toBe(200);
    expect(validRes.body.token).toBeDefined();

    const invalidRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser1.email, password: 'WrongPassword' });
    expect(invalidRes.status).toBe(401);
  });

  it('GET /api/subscriptions denies unauthenticated requests', async () => {
    const res = await request(app).get('/api/subscriptions');
    expect(res.status).toBe(401);
  });

  it('POST /api/subscriptions creates a subscription for authenticated user', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Figma Pro',
        category: 'Design',
        costAmount: 15.00,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        billingStartDate: '2026-01-01',
        status: 'ACTIVE',
        usageAssessment: 'ACTIVE'
      });

    expect(res.status).toBe(201);
    expect(res.body.subscription.name).toBe('Figma Pro');
    expect(res.body.subscription.normalizedMonthly).toBe(15.00);
    expect(res.body.subscription.normalizedAnnual).toBe(180.00);
    createdSubId = res.body.subscription.id;
  });

  it('GET /api/subscriptions enforces tenant isolation (User 2 cannot see User 1 sub)', async () => {
    const res = await request(app)
      .get('/api/subscriptions')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(200);
    expect(res.body.subscriptions.length).toBe(0);
  });

  it('GET /api/subscriptions/:id returns 404/denied for another user', async () => {
    const res = await request(app)
      .get(`/api/subscriptions/${createdSubId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(404);
  });

  it('PUT /api/subscriptions/:id updates subscription properties', async () => {
    const res = await request(app)
      .put(`/api/subscriptions/${createdSubId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        notes: 'Updated note for team license'
      });

    expect(res.status).toBe(200);
    expect(res.body.subscription.notes).toBe('Updated note for team license');
  });

  it('GET /api/dashboard returns calculated metrics from user records', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.activeSubscriptionsCount).toBe(1);
    expect(res.body.summary.totalMonthlyRecurring).toBe(15.00);
  });

  it('GET /api/settings/export-csv returns a CSV file', async () => {
    const res = await request(app)
      .get('/api/settings/export-csv')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Figma Pro');
  });

  it('DELETE /api/subscriptions/:id deletes subscription with authorization check', async () => {
    const res = await request(app)
      .delete(`/api/subscriptions/${createdSubId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);

    const checkRes = await request(app)
      .get(`/api/subscriptions/${createdSubId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(checkRes.status).toBe(404);
  });
});
