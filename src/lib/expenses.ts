import { z } from 'zod'

export const expenseInputSchema = z
  .object({
    amount: z
      .number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      })
      .finite()
      .positive('Amount must be greater than 0'),
    currency: z
      .string({
        required_error: 'Currency is required',
        invalid_type_error: 'Currency must be a string',
      })
      .trim()
      .length(3, 'Currency must be exactly 3 letters')
      .regex(/^[A-Za-z]{3}$/, 'Currency must be 3 letters')
      .transform((v) => v.toUpperCase()),
    category: z
      .string({
        required_error: 'Category is required',
        invalid_type_error: 'Category must be a string',
      })
      .trim()
      .min(1, 'Category is required')
      .max(100, 'Category is too long'),
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, 'Description is required')
      .max(1000, 'Description is too long'),
  })
  .strict()

export type ExpenseInput = z.infer<typeof expenseInputSchema>

