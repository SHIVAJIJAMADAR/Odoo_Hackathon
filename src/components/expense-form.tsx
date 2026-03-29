'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Upload, FileText, Scan, Check } from 'lucide-react'
import { expenseInputSchema, type ExpenseInput } from '@/lib/expenses'
import { submitExpense } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const currencyOptions = ['USD', 'EUR', 'GBP'] as const
const categoryOptions = ['Travel', 'Meals', 'Food', 'Supplies', 'Software', 'Other'] as const

interface FloatingLabelProps {
  label: string
  children: React.ReactNode
  error?: string
}

function FloatingLabel({ label, children, error }: FloatingLabelProps) {
  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export function ExpenseForm() {
  const router = useRouter()
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseInputSchema),
    defaultValues: {
      amount: 0,
      currency: 'USD',
      category: 'Travel',
      description: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (values: ExpenseInput) => {
    const result = await submitExpense(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Expense submitted successfully!', {
      icon: <Check className="size-5 text-emerald-500" />,
    })
    reset()
    setSelectedFile(null)
    router.refresh()
  }

  const handleReceiptUpload = useCallback(async (file: File) => {
    setSelectedFile(file)
    setIsOcrProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setValue('amount', 100, { shouldDirty: true, shouldValidate: true })
      setValue('category', 'Food', { shouldDirty: true, shouldValidate: true })
      setValue('description', 'Auto-filled from receipt', {
        shouldDirty: true,
        shouldValidate: true,
      })

      toast.success('Receipt processed! Form auto-filled.', {
        icon: <Scan className="size-5 text-indigo-500" />,
      })
    } catch {
      toast.error('Failed to process receipt')
    } finally {
      setIsOcrProcessing(false)
    }
  }, [setValue])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleReceiptUpload(file)
    }
  }, [handleReceiptUpload])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleReceiptUpload(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="rounded-2xl border border-neutral-200/50 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-neutral-900">Submit New Expense</h3>
          <p className="mt-1 text-sm text-neutral-500">Fill in the details below to submit a reimbursement request</p>
        </div>

        <form
          onSubmit={handleSubmit(async (values) => {
            try {
              await onSubmit(values)
            } catch {
              toast.error('Something went wrong')
            }
          })}
          className="p-6"
        >
          <div className="space-y-6">
            <FloatingLabel label="Receipt (Optional)">
              <div
                className={cn(
                  'group relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
                  isDragging && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
                  selectedFile && !isOcrProcessing && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
                  !selectedFile && !isDragging && 'border-neutral-200 hover:border-indigo-300 hover:bg-neutral-50'
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  disabled={isSubmitting || isOcrProcessing}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  onChange={onFileChange}
                />

                <AnimatePresence mode="wait">
                  {isOcrProcessing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="relative">
                        <Loader2 className="size-10 animate-spin text-indigo-500" />
                      </div>
                      <p className="text-sm font-medium text-indigo-600">Processing receipt with OCR...</p>
                    </motion.div>
                  ) : selectedFile ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Scan className="size-7 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-600">{selectedFile.name}</p>
                        <p className="mt-1 text-sm text-emerald-500">Receipt scanned - form auto-filled</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 transition-colors group-hover:bg-indigo-100">
                        <Upload className="size-7 text-neutral-400 transition-colors group-hover:text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">
                          Drop receipt here or <span className="text-indigo-600">browse</span>
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">PNG, JPG up to 10MB</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FloatingLabel>

            <div className="grid gap-6 sm:grid-cols-2">
              <FloatingLabel label="Amount *" error={errors.amount?.message}>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  disabled={isOcrProcessing}
                  className={cn(
                    'h-12 rounded-xl border-neutral-200 text-lg font-medium transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
                    errors.amount && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  {...register('amount', { valueAsNumber: true })}
                />
              </FloatingLabel>

              <FloatingLabel label="Currency *" error={errors.currency?.message}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isOcrProcessing}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FloatingLabel>
            </div>

            <FloatingLabel label="Category *" error={errors.category?.message}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting || isOcrProcessing}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FloatingLabel>

            <FloatingLabel label="Description *" error={errors.description?.message}>
              <Textarea
                placeholder="What was this expense for?"
                rows={3}
                disabled={isOcrProcessing}
                className={cn(
                  'resize-none rounded-xl border-neutral-200 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
                  errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
                {...register('description')}
              />
            </FloatingLabel>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-neutral-100 pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-neutral-200 px-6 transition-colors hover:bg-neutral-50"
              onClick={() => {
                reset()
                setSelectedFile(null)
              }}
              disabled={isSubmitting || isOcrProcessing}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
              disabled={isSubmitting || isOcrProcessing}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 size-4" />
                  Submit Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
