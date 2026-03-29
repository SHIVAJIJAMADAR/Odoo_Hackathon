'use client'

import { Bell, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
  userRole: string
  userEmail?: string
}

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', text: 'text-purple-400' },
  manager: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20', text: 'text-blue-400' },
  employee: { bg: 'bg-gradient-to-r from-gray-500/20 to-gray-400/20', text: 'text-gray-400' },
}

export function TopNavbar({ userRole, userEmail }: TopNavbarProps) {
  const roleStyle = roleColors[userRole.toLowerCase()] || roleColors.employee

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-4 px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="h-9 w-64 rounded-lg border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-neutral-100"
        >
          <Bell className="size-5 text-neutral-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 shadow-sm" />
        </Button>

        <div className="h-6 w-px bg-neutral-200" />

        <button className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-neutral-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <span className="text-sm font-semibold">
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">
              {userEmail?.split('@')[0] || 'User'}
            </p>
            <p className={cn('text-xs font-medium', roleStyle.text)}>{userRole}</p>
          </div>
          <ChevronDown className="size-4 text-neutral-400" />
        </button>
      </div>
    </header>
  )
}
