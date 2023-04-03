import * as z from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
});

export const GetUserByIdSchema = z.object({
  _id: z.string().uuid(),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
