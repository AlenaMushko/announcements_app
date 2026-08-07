import { describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.ts';

describe('HTTP error handling', () => {
  it('returns 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Not found');
  });

  it('returns 400 for invalid JSON body', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username":');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toHaveProperty('body');
  });
});
