import { z } from 'zod'

const uuidSchema = z
  .string({
    required_error: 'Company ID is required',
    invalid_type_error: 'Company ID must be a string',
  })
  .uuid('Company ID must be a valid UUID')

export const approvalRuleSchema = z
  .object({
    rule_type: z.enum(['percentage', 'specific_approver']),
    threshold_percentage: z
      .coerce
      .number()
      .finite('Threshold Percentage must be a valid number')
      .min(0, 'Threshold Percentage must be at least 0')
      .max(100, 'Threshold Percentage must be at most 100')
      .optional(),
    approver_role: z
      .string({
        invalid_type_error: 'Approver Role must be a string',
      })
      .trim()
      .min(1, 'Approver Role is required')
      .max(100, 'Approver Role is too long')
      .optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.rule_type === 'percentage') {
      if (typeof val.threshold_percentage !== 'number') {
        ctx.addIssue({
          code: 'custom',
          path: ['threshold_percentage'],
          message: 'Threshold Percentage is required',
        })
      }
      if (typeof val.approver_role === 'string' && val.approver_role.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['approver_role'],
          message: 'Approver Role is not allowed for percentage rules',
        })
      }
    } else {
      if (typeof val.approver_role !== 'string' || val.approver_role.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['approver_role'],
          message: 'Approver Role is required',
        })
      }
      if (typeof val.threshold_percentage === 'number') {
        ctx.addIssue({
          code: 'custom',
          path: ['threshold_percentage'],
          message: 'Threshold Percentage is not allowed for specific approver rules',
        })
      }
    }
  })

export type ApprovalRuleInput = z.infer<typeof approvalRuleSchema>

export const approvalRuleInsertSchema = z
  .object({
    company_id: uuidSchema,
    rule_type: z.enum(['percentage', 'specific_approver']),
    conditions: z.record(z.unknown()),
    is_active: z.boolean(),
  })
  .strict()

export type ApprovalRuleInsert = z.infer<typeof approvalRuleInsertSchema>

