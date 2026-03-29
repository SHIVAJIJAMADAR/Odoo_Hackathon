'use server'

import { expenseInputSchema, type ExpenseInput } from '@/lib/expenses'
import { createClient } from '@/utils/supabase/server'

export type SubmitExpenseResult = { ok: true } | { ok: false; error: string }
export type PendingExpense = {
  id: string
  created_at: string
  amount_original: number | string
  amount_normalized: number | string
  currency_original: string
  category: string
  description: string
  status: string
}

const DEMO_EXPENSES = [
  { amount: 45.99, currency: 'USD', category: 'Food', description: 'Team lunch meeting at Italian Bistro' },
  { amount: 1250, currency: 'INR', category: 'Travel', description: 'Flight tickets for client visit' },
  { amount: 89.50, currency: 'USD', category: 'Supplies', description: 'Office stationery and printer ink' },
  { amount: 320, currency: 'INR', category: 'Food', description: 'Client dinner at Marriott Hotel' },
  { amount: 2100, currency: 'INR', category: 'Travel', description: 'Taxi and metro passes for conference' },
  { amount: 67.25, currency: 'USD', category: 'Software', description: 'Monthly SaaS subscription renewal' },
]

export type GenerateDemoDataResult = { ok: true; count: number } | { ok: false; error: string }

export async function generateDemoData(): Promise<GenerateDemoDataResult> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { ok: false, error: 'You must be logged in.' }
  }

  const demoEntries = DEMO_EXPENSES.map((expense) => ({
    submitter_id: userData.user.id,
    amount_original: expense.amount,
    currency_original: expense.currency,
    amount_normalized: expense.currency === 'USD' ? expense.amount : expense.amount * 0.012,
    category: expense.category,
    description: expense.description,
    status: 'Pending',
  }))

  const { error } = await supabase.from('expenses').insert(demoEntries)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, count: demoEntries.length }
}

export type GetPendingExpensesResult =
  | { ok: true; data: PendingExpense[] }
  | { ok: false; error: string }

export async function getPendingExpenses(): Promise<GetPendingExpensesResult> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { ok: false, error: 'You must be logged in.' }
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('id, created_at, amount_original, amount_normalized, currency_original, category, description')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, data: (data ?? []) as PendingExpense[] }
}

export type ProcessApprovalResult = { ok: true } | { ok: false; error: string }

export async function processApproval(input: {
  expenseId: string
  action: 'Approve' | 'Reject'
  comments: string
}): Promise<ProcessApprovalResult> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { ok: false, error: 'You must be logged in.' }
  }

  if (input.action === 'Reject' && input.comments.trim().length === 0) {
    return { ok: false, error: 'Rejection comments are required.' }
  }

  const { error } = await supabase.rpc('process_approval', {
    p_expense_id: input.expenseId,
    p_action: input.action,
    p_comments: input.comments,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const nextStatus = input.action === 'Approve' ? 'Approved' : 'Rejected'
  const { error: statusError } = await supabase
    .from('expenses')
    .update({ status: nextStatus })
    .eq('id', input.expenseId)

  if (statusError) {
    return { ok: false, error: statusError.message }
  }

  return { ok: true }
}

export async function submitExpense(input: ExpenseInput): Promise<SubmitExpenseResult> {
  const parsed = expenseInputSchema.safeParse(input)
  if (!parsed.success) {
    const message =
      parsed.error.flatten().formErrors[0] ??
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ??
      'Invalid form data'
    return { ok: false, error: message }
  }

  const supabase = await createClient()
  const { data, error: userError } = await supabase.auth.getUser()

  if (userError || !data.user) {
    return { ok: false, error: 'You must be logged in to submit an expense.' }
  }

  const amountOriginal = parsed.data.amount
  const currencyOriginal = parsed.data.currency
  let amountNormalized = amountOriginal

  try {
    console.log('submitExpense fx start', { amountOriginal, currencyOriginal })
    const url = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(currencyOriginal)}`
    const res = await fetch(url, { cache: 'no-store' })
    console.log('submitExpense fx response', { status: res.status, ok: res.ok })

    if (res.ok) {
      const json = (await res.json()) as unknown
      let rateToUSD: number | null = null

      if (currencyOriginal === 'USD') {
        rateToUSD = 1
      } else if (json && typeof json === 'object' && 'rates' in json) {
        const rates = (json as { rates?: unknown }).rates
        if (rates && typeof rates === 'object' && 'USD' in rates) {
          const candidate = (rates as Record<string, unknown>).USD
          if (typeof candidate === 'number') rateToUSD = candidate
        }
      }

      if (typeof rateToUSD === 'number' && Number.isFinite(rateToUSD) && rateToUSD > 0) {
        amountNormalized = amountOriginal * rateToUSD
        console.log('submitExpense fx applied', { rateToUSD, amountNormalized })
      } else {
        console.log('submitExpense fx missing rate', { currencyOriginal })
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log('submitExpense fx failed', { message })
    amountNormalized = amountOriginal
  }

  const { error } = await supabase.from('expenses').insert({
    submitter_id: data.user.id,
    amount_original: amountOriginal,
    currency_original: currencyOriginal,
    amount_normalized: amountNormalized,
    category: parsed.data.category,
    description: parsed.data.description,
    status: 'Pending',
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true }
}

