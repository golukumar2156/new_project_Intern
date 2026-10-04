import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_~\-+=\[\]\\\/]).{8,16}$/;

export const signupSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Invalid email address format'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .refine(
      (val) => passwordRegex.test(val),
      'Password must be 8-16 characters and include at least one uppercase letter and one special character'
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional(),
});

export const ownerSignupSchema = signupSchema.extend({
  storeName: z
    .string()
    .min(1, 'Store name is required')
    .max(100, 'Store name must not exceed 100 characters'),
  storeEmail: z.string().email('Invalid store email address format'),
  storeAddress: z
    .string()
    .min(1, 'Store address is required')
    .max(400, 'Store address must not exceed 400 characters'),
});

export const addUserSchema = signupSchema.extend({
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER' }),
  }),
});

export const addStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name is too long'),
  email: z.string().email('Invalid store email format'),
  address: z
    .string()
    .min(1, 'Store address is required')
    .max(400, 'Store address must not exceed 400 characters'),
  ownerId: z.string().optional().nullable(),
});

export const rateStoreSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .refine(
      (val) => passwordRegex.test(val),
      'Password must be 8-16 characters and include at least one uppercase letter and one special character'
    ),
});
