import { z } from 'zod';

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// UUID validation
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format');

// Date validation
export const dateSchema = z
  .string()
  .datetime({ message: 'Invalid date format' });

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL format');

// Phone validation
export const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number format'
  );

/**
 * Auth schemas
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Workspace schemas
 */
export const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  settings: z.record(z.string(), z.any()).optional(),
});

export const updateWorkspaceSchema = workspaceSchema.partial();

/**
 * AI Agent schemas
 */
export const aiAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name must be less than 100 characters'),
  type: z
    .string()
    .min(1, 'Agent type is required'),
  workspace_id: uuidSchema,
  config: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(32000).optional(),
    systemPrompt: z.string().optional(),
    tools: z.array(z.string()).optional(),
  }).optional(),
  status: z.enum(['active', 'inactive', 'training']).optional(),
});

export const updateAIAgentSchema = aiAgentSchema.partial();

/**
 * Pipeline schemas
 */
export const pipelineStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['agent', 'condition', 'transform', 'action']),
  config: z.record(z.string(), z.any()),
  nextSteps: z.array(z.string()).optional(),
});

export const pipelineSchema = z.object({
  name: z
    .string()
    .min(1, 'Pipeline name is required')
    .max(100, 'Pipeline name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  workspace_id: uuidSchema,
  steps: z.array(pipelineStepSchema).optional(),
  schedule: z.string().nullable().optional(),
  status: z.enum(['active', 'paused', 'failed']).optional(),
});

export const updatePipelineSchema = pipelineSchema.partial();

/**
 * Generic pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

/**
 * Search schema
 */
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.string(), z.any()).optional(),
});

/**
 * Utility function to validate data against schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Utility function to get formatted error messages
 */
export function getErrorMessages(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  (error as any).errors.forEach((err: any) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
}

/**
 * Type exports
 */
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type WorkspaceData = z.infer<typeof workspaceSchema>;
export type AIAgentData = z.infer<typeof aiAgentSchema>;
export type PipelineData = z.infer<typeof pipelineSchema>;
export type PipelineStepData = z.infer<typeof pipelineStepSchema>;