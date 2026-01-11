import { z } from 'zod'

// Email validation
export const emailSchema = z
  .string()
  .email('البريد الإلكتروني غير صالح')
  .min(5, 'البريد الإلكتروني قصير جداً')
  .max(100, 'البريد الإلكتروني طويل جداً')

// Phone validation (Iraqi format)
export const phoneSchema = z
  .string()
  .regex(/^(07[3-9]|\+9647[3-9])[0-9]{8}$/, 'رقم الهاتف غير صالح')
  .transform((val) => val.replace(/\s/g, ''))

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(100, 'كلمة المرور طويلة جداً')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم')

// Simple password (for login)
export const simplePasswordSchema = z
  .string()
  .min(1, 'كلمة المرور مطلوبة')

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'الاسم قصير جداً')
  .max(50, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'الاسم يحتوي على أحرف غير صالحة')

// Coupon code validation
export const couponSchema = z
  .string()
  .min(3, 'كود الخصم قصير جداً')
  .max(20, 'كود الخصم طويل جداً')
  .regex(/^[A-Z0-9]+$/i, 'كود الخصم غير صالح')
  .transform((val) => val.toUpperCase())

// Comment validation
export const commentSchema = z
  .string()
  .min(2, 'التعليق قصير جداً')
  .max(1000, 'التعليق طويل جداً')
  .transform((val) => val.trim())

// Review validation
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

// Registration form
export const registerSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
})

// Login form
export const loginSchema = z.object({
  phone: phoneSchema,
  password: simplePasswordSchema,
})

// Checkout form
export const checkoutSchema = z.object({
  paymentMethod: z.enum(['zain_cash', 'asia_hawala', 'fib', 'qi_card']),
  couponCode: couponSchema.optional(),
  notes: z.string().max(500).optional(),
})

// Contact form
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'الموضوع قصير جداً').max(100, 'الموضوع طويل جداً'),
  message: z.string().min(10, 'الرسالة قصيرة جداً').max(2000, 'الرسالة طويلة جداً'),
})

// Course search
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  priceRange: z.enum(['free', 'paid', 'all']).optional(),
})

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validate and sanitize input
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  }
}

// Validate multiple fields
export function validateFields(
  validations: Array<{
    value: unknown
    schema: z.ZodSchema
    field: string
  }>
): { success: true } | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const { value, schema, field } of validations) {
    const result = schema.safeParse(value)
    if (!result.success) {
      errors[field] = result.error.errors[0].message
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return { success: true }
}
