'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Receipt,
  CheckCircle,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-5" /> },
  { href: '/dashboard?tab=submit', label: 'Submit Expense', icon: <Receipt className="size-5" /> },
  { href: '/dashboard?tab=approvals', label: 'Approvals', icon: <CheckCircle className="size-5" />, roles: ['admin', 'manager'] },
  { href: '/admin', label: 'Admin', icon: <Settings className="size-5" />, roles: ['admin'] },
]

interface SidebarProps {
  userRole: string
  onLogout: () => void
}

export function Sidebar({ userRole, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole.toLowerCase())
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === href
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-neutral-900">
      <div className="flex h-16 items-center border-b border-neutral-800 px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-white">Reimburse</span>
            <span className="ml-1 text-xs text-neutral-500">Pro</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
          Menu
        </p>
        {filteredNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            >
              {active && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 transition-colors',
                  active ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'relative z-10 transition-colors',
                  active ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                )}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-neutral-400 hover:bg-white/5 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="size-5" />
          <span>Logout</span>
        </Button>
      </div>

      <div className="border-t border-neutral-800 p-4">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4">
          <p className="text-xs font-medium text-white">Need help?</p>
          <p className="mt-1 text-xs text-neutral-400">Contact support</p>
        </div>
      </div>
    </aside>
  )
}
