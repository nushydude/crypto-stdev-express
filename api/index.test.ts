import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';

let app: any;

beforeAll(async () => {
  // Prevent `api/index.ts` from calling `app.listen(...)` during tests.
  process.env.NODE_ENV = 'production';

  // Ensure upstream calls fail fast but still return 200 from /api/status.
  process.env.AUTH_SERVICE = 'http://127.0.0.1:0';
  process.env.USER_SERVICE = 'http://127.0.0.1:0';

  const mod = await import('./index.ts');
  app = mod.default;
});

describe('gateway api', () => {
  it('GET /api/status returns 200', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('gateway', 'ok');
  });
});

