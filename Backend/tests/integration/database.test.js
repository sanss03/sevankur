const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// ─── Prevent native GC open handle ───────────────────────────────────────────
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
let officerHeader, adminHeader;
let officerUser, adminUser;

const baseProperty = {
  propertyId: 'PROP-DB-001',
  taxId:      'TAX-DB-001',
  ownerName:  'Bob Builder',
  propertyType: 'commercial',
  ward:       'Ward 3',
  address: { street: '99 Trade St', city: 'Commerce City', state: 'CC', zipCode: '99999', country: 'Testland' },
  value: 1_200_000,
  status: 'active'
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI  = mongoServer.getUri();
  process.env.JWT_SECRET   = 'test_secret_key';
  process.env.GROK_API_KEY = 'test_key';

  app = require('../../server');

  const User = require('../../models/User');
  officerUser = await User.create({ username: 'officer1', email: 'officer1@test.com', password: 'pass123', role: 'officer' });
  adminUser   = await User.create({ username: 'admin1',   email: 'admin1@test.com',   password: 'pass123', role: 'admin'   });

  officerHeader = `Bearer ${jwt.sign({ id: officerUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })}`;
  adminHeader   = `Bearer ${jwt.sign({ id: adminUser._id   }, process.env.JWT_SECRET, { expiresIn: '1d' })}`;

  // Pre-seed one property
  const Property = require('../../models/Property');
  await Property.create(baseProperty);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Property API — CRUD & Filtering', () => {

  it('1. GET /api/properties — should return all properties', async () => {
    const res = await request(app)
      .get('/api/properties')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it('2. GET /api/properties?city=Commerce+City — should filter by city', async () => {
    const res = await request(app)
      .get('/api/properties')
      .query({ city: 'Commerce City' })
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.every(p => p.address.city === 'Commerce City')).toBe(true);
  });

  it('3. POST /api/properties — should create a new property', async () => {
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', adminHeader)
      .send({
        propertyId: 'PROP-DB-002',
        taxId:      'TAX-DB-002',
        ownerName:  'Clara Moon',
        propertyType: 'residential',
        ward:       'Ward 7',
        address: { street: '1 Moon Lane', city: 'Lunaville', state: 'LV', zipCode: '00001', country: 'Testland' },
        value: 750_000,
        status: 'active'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.propertyId).toBe('PROP-DB-002');
  });

  it('4. GET /api/properties/:id — should return single property by Mongo ID', async () => {
    const Property = require('../../models/Property');
    const prop = await Property.findOne({ propertyId: 'PROP-DB-001' });

    const res = await request(app)
      .get(`/api/properties/${prop._id}`)
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.propertyId).toBe('PROP-DB-001');
  });

  it('5. PUT /api/properties/:id — should update property value', async () => {
    const Property = require('../../models/Property');
    const prop = await Property.findOne({ propertyId: 'PROP-DB-001' });

    const res = await request(app)
      .put(`/api/properties/${prop._id}`)
      .set('Authorization', adminHeader)
      .send({ value: 999_999 });

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(999_999);
  });

  it('6. GET /api/properties/stats — should return aggregated stats', async () => {
    const res = await request(app)
      .get('/api/properties/stats')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('byType');
  });

  it('7. DELETE /api/properties/:id — should delete a property', async () => {
    const Property = require('../../models/Property');
    const prop = await Property.findOne({ propertyId: 'PROP-DB-002' });

    const res = await request(app)
      .delete(`/api/properties/${prop._id}`)
      .set('Authorization', adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Tax Records & Defaulters API', () => {

  let taxRecordId;

  it('8. POST /api/tax-records — should create a tax record', async () => {
    const Property = require('../../models/Property');
    const prop = await Property.findOne({ propertyId: 'PROP-DB-001' });

    const res = await request(app)
      .post('/api/tax-records')
      .set('Authorization', adminHeader)
      .send({
        propertyId: prop._id,
        taxYear:    '2025',          // String in schema
        taxAmount:  15_000,
        taxRate:    1.25,
        dueDate:    '2025-03-31',
        remainingAmount: 15_000,     // required field
        paymentStatus: 'pending'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.taxYear).toBe('2025');
    taxRecordId = res.body.data._id;
  });

  it('9. GET /api/tax-records — should return tax records list', async () => {
    const res = await request(app)
      .get('/api/tax-records')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('10. GET /api/defaulters — should return defaulter list', async () => {
    const res = await request(app)
      .get('/api/defaulters')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('Analytics API (Admin RBAC)', () => {

  it('11. GET /api/analytics/dashboard — officer can access dashboard', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('12. GET /api/analytics/tax — admin can access tax analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/tax')
      .set('Authorization', adminHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('13. GET /api/analytics/tax — officer is FORBIDDEN from admin analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/tax')
      .set('Authorization', officerHeader);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

});
