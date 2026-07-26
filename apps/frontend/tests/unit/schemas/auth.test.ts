import { describe, it, expect } from 'vitest';
import {
  LoginRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '@amt/shared';

describe('Auth Zod Schemas', () => {
  describe('LoginRequestSchema', () => {
    it('accepts valid email and password', () => {
      const result = LoginRequestSchema.safeParse({
        email: 'admin@example.com',
        password: 'secret123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = LoginRequestSchema.safeParse({
        email: 'not-an-email',
        password: 'secret123',
      });
      expect(result.success).toBe(false);
    });

    it('allows optional remember field', () => {
      const withoutRemember = LoginRequestSchema.safeParse({
        email: 'admin@example.com',
        password: 'secret123',
      });
      expect(withoutRemember.success).toBe(true);

      const withRemember = LoginRequestSchema.safeParse({
        email: 'admin@example.com',
        password: 'secret123',
        remember: true,
      });
      expect(withRemember.success).toBe(true);
    });
  });

  describe('ResetPasswordRequestSchema', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = ResetPasswordRequestSchema.safeParse({
        email: 'admin@example.com',
        token: 'reset-token-abc',
        password: 'short',
        password_confirmation: 'short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ForgotPasswordRequestSchema', () => {
    it('rejects invalid email', () => {
      const result = ForgotPasswordRequestSchema.safeParse({
        email: 'bad-email',
      });
      expect(result.success).toBe(false);
    });
  });
});
