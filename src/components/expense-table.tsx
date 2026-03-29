'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { processApproval, type PendingExpense } from '@/app/dashboard/actions'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAmount(amount: number | string) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0
  )
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    pending: { 
      bg: 'bg-amber-50 dark:bg-amber-950/30', 
      text: 'text-amber-700 dark:text-amber-400', 
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500'
    },
    approved: { 
      bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
      text: 'text-emerald-700 dark:text-emerald-400', 
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-500'
    },
    rejected: { 
      bg: 'bg-red-50 dark:bg-red-950/30', 
      text: 'text-red-700 dark:text-red-400', 
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500'
    },
  }

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
      config.bg, config.text, config.border
    )}>
      {status.toLowerCase() === 'pending' && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {status.toLowerCase() === 'approved' && (
        <CheckCircle2 className={cn('size-3.5', config.icon)} />
      )}
      {status.toLowerCase() === 'rejected' && (
        <XCircle className={cn('size-3.5', config.icon)} />
      )}
      {status}
    </span>
  )
}

interface ExpenseTableProps {
  expenses: PendingExpense[]
  title?: string
  showActions?: boolean
}

export function ExpenseTable({ expenses, title = 'Recent Expenses', showActions = true }: ExpenseTableProps) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<PendingExpense | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  const runApprove = async (expenseId: string) => {
    setBusyId(expenseId)
    const result = await processApproval({ expenseId, action: 'Approve', comments: '' })
    setBusyId(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Expense approved!', {
      icon: <CheckCircle2 className="size-5 text-emerald-500" />,
    })
    router.refresh()
  }

  const runReject = async () => {
    if (!rejecting) return
    setBusyId(rejecting.id)
    const result = await processApproval({
      expenseId: rejecting.id,
      action: 'Reject',
      comments: rejectComment,
    })
    setBusyId(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Expense rejected')
    setRejecting(null)
    setRejectComment('')
    router.refresh()
  }

  if (expenses.length === 0) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-neutral-200/50 bg-white shadow-sm overflow-hidden"
      >
        <div className="border-b border-neutral-100 px-6 py-4">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                {showActions && <th className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {expenses.map((expense, index) => {
                const isBusy = busyId === expense.id
                return (
                  <tr
                    key={expense.id}
                    className={cn(
                      'transition-colors hover:bg-indigo-50/30',
                      index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'
                    )}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-neutral-600">{formatDate(expense.created_at)}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900">
                        {expense.currency_original} {formatAmount(expense.amount_original)}
                      </span>
                      {expense.currency_original !== 'USD' && (
                        <p className="text-xs text-neutral-400">
                          ≈ ${formatAmount(expense.amount_normalized)} USD
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-6 py-4">
                      <p className="truncate text-sm text-neutral-600">{expense.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={expense.status || 'pending'} />
                    </td>
                    {showActions && (
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-medium shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50"
                            onClick={() => runApprove(expense.id)}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="mr-1 size-3.5" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg border-red-200 text-xs font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                            onClick={() => {
                              setRejecting(expense)
                              setRejectComment('')
                            }}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <X className="mr-1 size-3.5" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Dialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null)
            setRejectComment('')
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this expense.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {rejecting && (
              <div className="grid gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Amount</span>
                  <span className="font-medium">
                    {formatAmount(rejecting.amount_original)} {rejecting.currency_original}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Category</span>
                  <span className="font-medium">{rejecting.category}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Rejection Reason</label>
              <Textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Explain why this expense is being rejected..."
                rows={3}
                className="rounded-xl border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setRejecting(null)}
              disabled={busyId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={runReject}
              disabled={busyId !== null || rejectComment.trim().length === 0}
            >
              {busyId !== null && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
