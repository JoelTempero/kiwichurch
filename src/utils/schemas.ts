import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  displayName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  username: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

export const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().regex(/^[\d\s\-+()]*$/, 'Please enter a valid phone number').or(z.literal('')),
  bio: z.string().optional(),
})

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional().default(''),
  location: z.string().optional().default(''),
  gatheringId: z.string().optional().default(''),
  isPublic: z.boolean().default(true),
  imageURL: z.string().optional().default(''),
}).refine(data => !data.endTime || data.endTime > data.time, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

export const keteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional().default(''),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional().default(''),
  published: z.boolean().default(true),
})

export const groupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional().default(''),
  rhythm: z.string().optional().default(''),
  location: z.string().optional().default(''),
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
  color: z.string().default('#2d5a4a'),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type PasswordInput = z.infer<typeof passwordSchema>
export type EventInput = z.infer<typeof eventSchema>
export type KeteInput = z.infer<typeof keteSchema>
export type GroupInput = z.infer<typeof groupSchema>
export type CommentInput = z.infer<typeof commentSchema>
