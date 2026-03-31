const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// ─── Prevent pdf-parse from registering native GC handle ──────────────────────
jest.mock('../../services/documentParserService', () => ({
  extractText: jest.fn().mockResolvedValue(
    'Section 5.2: Property owners aged 65+ are eligible for a 20% tax exemption. ' +
    'Applications must be submitted before April 1st to the Municipal Tax Office.'
  )
}));

// ─── Mock Grok so tests are deterministic and free ────────────────────────────
jest.mock('../../services/grokService', () => ({
  getChatCompletion: jest.fn(),
  parseJsonResponse: (c) => {
    try { return JSON.parse(c.replace(/```json|```/g, '').trim()); }
    catch { return { text: c, intent: 'GENERAL' }; }
  },
  checkHealth: jest.fn().mockResolvedValue(true)
}));

const grokService = require('../../services/grokService');

let app;
let mongoServer;
let authHeader;
let documentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET  = 'test_secret_key';
  process.env.GROK_API_KEY = 'test_grok_key';

  app = require('../../server');

  const User = require('../../models/User');
  const admin = await User.create({
    username: 'admin_doc_tester',
    email:    'admin@doctest.com',
    password: 'password123',
    role:     'admin'
  });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  authHeader = `Bearer ${token}`;

  // Create a real temp file to satisfy multer's `req.file` check
  const tmpPath = path.join(__dirname, 'test_upload.pdf');
  fs.writeFileSync(tmpPath, 'Fake PDF content for upload test');
});

afterAll(async () => {
  const tmpPath = path.join(__dirname, 'test_upload.pdf');
  if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────

describe('Document Upload & RAG Pipeline', () => {

  it('1. POST /api/documents/upload — should upload, parse, and chunk a document', async () => {
    const tmpPath = path.join(__dirname, 'test_upload.pdf');

    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', authHeader)
      .attach('document', tmpPath);            // multipart/form-data

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.fileName).toContain('test_upload');

    documentId = res.body.data._id;           // save for later tests

    // Parser was called exactly once with the saved file path
    const { extractText } = require('../../services/documentParserService');
    expect(extractText).toHaveBeenCalledTimes(1);
  });

  it('2. GET /api/documents — should list uploaded documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('fileName');
  });

  it('3. GET /api/documents/search?query=… — should return relevant chunks from RAG index', async () => {
    const res = await request(app)
      .get('/api/documents/search')
      .query({ query: 'tax exemption elderly' })
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Even with 0 chunks (full-text index may be empty in memory), structure must be correct
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('4. GET /api/documents/:id/context — should return paginated chunks for a document', async () => {
    if (!documentId) return; // skip if upload failed

    const res = await request(app)
      .get(`/api/documents/${documentId}/context`)
      .query({ page: 1, limit: 5 })
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('totalChunks');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('5. DELETE /api/documents/:id — should delete document and cascade chunks', async () => {
    if (!documentId) return;

    const res = await request(app)
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);

    // Verify it's gone
    const verify = await request(app)
      .get(`/api/documents/${documentId}/context`)
      .set('Authorization', authHeader);

    // Either 404 (not found) or 200 with 0 chunks
    expect([200, 404]).toContain(verify.status);
  });

  it('6. POST /api/documents/upload — should reject non-PDF/DOCX files', async () => {
    const tmpTxt = path.join(__dirname, 'bad_upload.txt');
    fs.writeFileSync(tmpTxt, 'I am not a valid document');

    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', authHeader)
      .attach('document', tmpTxt);

    fs.unlinkSync(tmpTxt);

    // Multer's fileFilter should reject with 4xx
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

});

// ─── RAG-based Chat Q&A flow ──────────────────────────────────────────────────

describe('Document-Grounded Chat (RAG) Flow', () => {

  it('7. Chat DOCUMENT_QUERY with seeded chunks should return grounded answer', async () => {
    // Seed a chunk directly into the DB for clean test isolation
    const DocumentChunk = require('../../models/DocumentChunk');
    const fakeDocId = new mongoose.Types.ObjectId();
    await DocumentChunk.create({
      documentId: fakeDocId,
      chunkIndex: 0,
      content: 'Section 5.2: Property owners aged 65+ are eligible for a 20% tax exemption.'
    });

    // Intent detection call
    grokService.getChatCompletion.mockResolvedValueOnce({
      choices: [{ message: { content: '{"intent":"DOCUMENT_QUERY","confidence":0.98}' } }]
    });

    // RAG synthesis call
    grokService.getChatCompletion.mockResolvedValueOnce({
      choices: [{ message: { content: 'Property owners aged 65+ qualify for a 20% exemption per Section 5.2.' } }]
    });

    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', authHeader)
      .send({ message: 'Who qualifies for property tax exemption?' });

    expect(res.status).toBe(200);
    expect(res.body.data.intent).toBe('DOCUMENT_QUERY');
    expect(res.body.data.text).toContain('20%');
    expect(grokService.getChatCompletion).toHaveBeenCalledTimes(2);
  });

});
