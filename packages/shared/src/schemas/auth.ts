import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember: z.boolean().optional(),
});

export const LoginResponseSchema = z.object({
  data: z.object({
    token: z.string(),
    user: UserSchema,
  }),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  password: z.string().min(8),
  password_confirmation: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
