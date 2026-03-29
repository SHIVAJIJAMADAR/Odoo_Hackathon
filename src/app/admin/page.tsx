import { ApprovalRuleForm } from './rule-form'
import { RoleManagement } from './role-management'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AppShell } from '@/components/app-shell'

export default async function AdminPage() {
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

  const role = String(profile?.role ?? '').toLowerCase()
  if (role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <AppShell userRole="ADMIN" userEmail={userData.user.email}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Panel</h1>
          <p className="mt-1 text-neutral-500">Manage team members and configure system settings.</p>
        </div>

        <RoleManagement />
        <ApprovalRuleForm />
      </div>
    </AppShell>
  )
}
