const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

jest.mock('../../services/documentParserService', () => ({
  extractText: jest.fn().mockResolvedValue('mock text')
}));
jest.mock('../../services/grokService', () => ({
  getChatCompletion: jest.fn(),
  parseJsonResponse: (c) => {
    try { return JSON.parse(c.replace(/```json|```/g, '').trim()); }
    catch { return { text: c, intent: 'GENERAL' }; }
  },
  checkHealth: jest.fn().mockResolvedValue(true)
}));

let app, mongoServer;
let validAuthHeader;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI  = mongoServer.getUri();
  process.env.JWT_SECRET   = 'test_secret_key';
  process.env.GROK_API_KEY = 'test_key';

  app = require('../../server');

  const User = require('../../models/User');
  const user = await User.create({ username: 'auth_tester', email: 'auth@test.com', password: 'pass123', role: 'officer' });
  validAuthHeader = `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })}`;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Auth Flow', () => {

  it('1. POST /api/auth/register — should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'newuser@test.com', password: 'password123' });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('token');
  });

  it('2. POST /api/auth/login — should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'newuser@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('3. POST /api/auth/login — should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'newuser@test.com', password: 'wrong_pass' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body).not.toHaveProperty('token');
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('Auth Guard — Protected Routes', () => {

  it('4. GET /api/properties — should reject unauthenticated request (no token)', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(401);
  });

  it('5. GET /api/properties — should reject request with expired token', async () => {
    const expiredToken = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('6. GET /api/properties — should reject request with malformed token', async () => {
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', 'Bearer not.a.real.token');

    expect(res.status).toBe(401);
  });

  it('7. GET /api/properties — should accept request with valid token', async () => {
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', validAuthHeader);

    expect(res.status).toBe(200);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('Input Validation', () => {

  it('8. POST /api/chat — should reject empty message', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', validAuthHeader)
      .send({ message: '' });

    expect(res.status).toBe(400);
  });

  it('9. POST /api/chat — should reject missing message field', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', validAuthHeader)
      .send({});

    expect(res.status).toBe(400);
  });

  it('10. GET /api/documents/search — should return 400 without query param', async () => {
    const res = await request(app)
      .get('/api/documents/search')
      .set('Authorization', validAuthHeader);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/query/i);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('System Health & Metrics', () => {

  it('11. GET /api/system/health — should return connected status', async () => {
    const res = await request(app).get('/api/system/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('Connected');
    expect(res.body.llm).toBe('Configured');
  });

  it('12. GET /api/system/metrics — should return memory/uptime data', async () => {
    const res = await request(app).get('/api/system/metrics');
    expect(res.status).toBe(200);
    expect(res.body.metrics).toHaveProperty('uptime');
    expect(res.body.metrics).toHaveProperty('memory');
    expect(res.body.metrics.memory).toHaveProperty('heapUsed');
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('Chat History Pagination', () => {

  it('13. Chat history should be paginated via query params', async () => {
    const grokService = require('../../services/grokService');

    // Seed 3 chat interactions
    for (let i = 0; i < 3; i++) {
      grokService.getChatCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: '{"intent":"GREETING","confidence":0.9}' } }] })
        .mockResolvedValueOnce({ choices: [{ message: { content: `Response ${i}` } }] });

      await request(app)
        .post('/api/chat')
        .set('Authorization', validAuthHeader)
        .send({ message: `Hello ${i}` });
    }

    const ChatHistory = require('../../models/ChatHistory');
    const page1 = await ChatHistory.paginate({}, { page: 1, limit: 4 });
    expect(page1.docs.length).toBeGreaterThan(0);
    expect(page1).toHaveProperty('totalDocs');
    expect(page1).toHaveProperty('totalPages');
  });

});
