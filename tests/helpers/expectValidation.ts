import { expect } from 'vitest';

type ValidationResponse = {
  status: number;
  body: {
    error?: string;
    details?: Record<string, unknown>;
  };
};

export function expectValidationFailure(response: ValidationResponse, fields: string[]) {
  expect(response.status).toBe(422);
  expect(response.body.error).toBe('Validation failed');
  expect(response.body.details).toEqual(
    expect.objectContaining(
      Object.fromEntries(fields.map((field) => [field, expect.any(Array)])),
    ),
  );
}
