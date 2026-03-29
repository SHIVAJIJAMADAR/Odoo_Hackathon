'use client'

import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface AppShellProps {
  userRole: string
  userEmail?: string
  children: React.ReactNode
}

export function AppShell({ userRole, userEmail, children }: AppShellProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to logout')
      return
    }
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col pl-64">
        <TopNavbar userRole={userRole} userEmail={userEmail} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
