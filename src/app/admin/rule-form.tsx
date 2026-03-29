'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller, type FieldError, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2, Shield, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createApprovalRule } from './actions'

const ruleTypes = [
  { value: 'percentage', label: 'Percentage Threshold' },
  { value: 'specific_approver', label: 'Specific Approver' },
] as const

type AdminRuleFormValues = {
  rule_type: 'percentage' | 'specific_approver'
  threshold_percentage?: number
  approver_role?: string
}

export function ApprovalRuleForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminRuleFormValues>({
    defaultValues: { rule_type: 'percentage', threshold_percentage: 60 },
    mode: 'onBlur',
    shouldUnregister: true,
  })

  const ruleType = useWatch({ control, name: 'rule_type' })
  const thresholdError = (errors as Partial<Record<'threshold_percentage', FieldError>>)
    .threshold_percentage
  const approverRoleError = (errors as Partial<Record<'approver_role', FieldError>>).approver_role

  const onSubmit = async () => {
    console.log('Create rule clicked')
    const result = await createApprovalRule()
    console.log('createApprovalRule result', result)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Approval rule created successfully')
    reset({ rule_type: 'percentage', threshold_percentage: 60 })
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="size-5" />
          Create Approval Rule
        </CardTitle>
        <CardDescription>Set up rules to determine how expenses are approved</CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit(async () => {
          try {
            await onSubmit()
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            toast.error(message)
          }
        })}
      >
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rule Type</Label>
            <Controller
              name="rule_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rule_type ? (
              <p className="text-sm text-destructive">{errors.rule_type.message}</p>
            ) : null}
          </div>

          {ruleType === 'percentage' ? (
            <div className="space-y-2">
              <Label htmlFor="threshold_percentage" className="text-sm font-medium">Threshold Percentage</Label>
              <div className="relative">
                <Input
                  id="threshold_percentage"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  placeholder="60"
                  aria-invalid={Boolean(thresholdError)}
                  className="pr-10"
                  {...register('threshold_percentage' as const, { valueAsNumber: true })}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">Expenses above this percentage of budget require additional approval</p>
              {thresholdError ? (
                <p className="text-sm text-destructive">{thresholdError.message}</p>
              ) : null}
            </div>
          ) : null}

          {ruleType === 'specific_approver' ? (
            <div className="space-y-2">
              <Label htmlFor="approver_role" className="text-sm font-medium">Approver Role</Label>
              <Input
                id="approver_role"
                placeholder="e.g., CFO, Manager, Director"
                aria-invalid={Boolean(approverRoleError)}
                {...register('approver_role' as const)}
              />
              {approverRoleError ? (
                <p className="text-sm text-destructive">{approverRoleError.message}</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset({ rule_type: 'percentage', threshold_percentage: 60 })}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Create Rule
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

