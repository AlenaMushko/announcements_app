import { describe, expect, it } from 'vitest';

import {
  LoginSchema,
  RefreshSchema,
  RegisterSchema,
} from '../../src/validations/auth.validator.ts';

const validRegister = {
  username: 'olena',
  email: 'olena@example.com',
  password: 'Secret123',
  name: 'Olena',
};

describe('RegisterSchema', () => {
  it('accepts valid registration data', () => {
    const result = RegisterSchema.safeParse(validRegister);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validRegister);
    }
  });

  it('rejects a username that is too short', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      username: 'ab',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a username that is too long', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      username: 'a'.repeat(31),
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      password: 'Sec123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without an uppercase letter', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      password: 'secret123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password without a digit', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      password: 'SecretWord',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a name that is too short', () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      name: 'A',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = RegisterSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('accepts valid login data', () => {
    const result = LoginSchema.safeParse({
      username: 'olena',
      password: 'Secret123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty username', () => {
    const result = LoginSchema.safeParse({
      username: '',
      password: 'Secret123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = LoginSchema.safeParse({
      username: 'olena',
      password: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = LoginSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('RefreshSchema', () => {
  it('accepts a valid refresh token', () => {
    const result = RefreshSchema.safeParse({
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty refresh token', () => {
    const result = RefreshSchema.safeParse({
      refreshToken: '',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing refreshToken', () => {
    const result = RefreshSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
