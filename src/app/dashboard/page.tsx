import { getPendingExpenses } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AppShell } from '@/components/app-shell'
import { DashboardStats } from '@/components/dashboard-stats'
import { ChartsSection } from '@/components/charts-section'
import { ActivityTimeline } from '@/components/activity-timeline'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseTable } from '@/components/expense-table'
import { DemoDataButton } from '@/components/demo-data-button'
import { EmptyState } from '@/components/empty-state'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  const role = String(profile?.role ?? 'employee').toUpperCase()

  const pending = await getPendingExpenses()
  const pendingExpenses = pending.ok ? pending.data : []

  const { data: allExpenses } = await supabase
    .from('expenses')
    .select('id, status, amount_normalized, created_at')
    .eq('submitter_id', userData.user.id)
    .order('created_at', { ascending: false })

  const totalExpenses = allExpenses?.length ?? 0
  const approvedCount = allExpenses?.filter((e) => e.status === 'Approved').length ?? 0
  const totalAmount = allExpenses?.reduce((sum, e) => sum + (Number(e.amount_normalized) || 0), 0) ?? 0

  const showApprovals = ['ADMIN', 'MANAGER'].includes(role)

  const recentActivity = (allExpenses ?? []).slice(0, 5).map((e) => ({
    id: e.id,
    type: 'submitted' as const,
    user: 'You',
    amount: Number(e.amount_normalized) || 0,
    currency: 'USD',
    timestamp: e.created_at,
    description: 'New expense submitted',
  }))

  return (
    <AppShell userRole={role} userEmail={userData.user.email}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="mt-1 text-neutral-500">Welcome back! Here&apos;s your expense overview.</p>
          </div>
          <DemoDataButton />
        </div>

        <DashboardStats
          totalExpenses={totalExpenses}
          pendingCount={pendingExpenses.length}
          approvedCount={approvedCount}
          totalAmount={totalAmount}
        />

        <ChartsSection />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {showApprovals && pendingExpenses.length > 0 && (
              <ExpenseTable expenses={pendingExpenses} title="Pending Approvals" showActions={true} />
            )}
            
            {showApprovals && pendingExpenses.length === 0 && (
              <EmptyState
                icon="inbox"
                title="All caught up!"
                description="No pending approvals at the moment. New expenses will appear here for review."
              />
            )}
          </div>
          
          <ActivityTimeline activities={recentActivity} />
        </div>

        <div className="max-w-3xl">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Submit New Expense</h3>
          <ExpenseForm />
        </div>
      </div>
    </AppShell>
  )
}
