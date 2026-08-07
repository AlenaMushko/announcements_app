import { describe, expect, it } from 'vitest';

describe('Vitest environment', () => {
  it('uses the test DATABASE_URL', () => {
    expect(process.env.DATABASE_URL).toContain('mydb_test');
  });
});
