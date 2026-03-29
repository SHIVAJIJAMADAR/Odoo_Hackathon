'use client'

import { motion } from 'framer-motion'
import { FileText, Plus, Inbox, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: 'file' | 'inbox' | 'receipt'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const icons = {
  file: FileText,
  inbox: Inbox,
  receipt: Receipt,
}

export function EmptyState({ icon = 'inbox', title, description, action, className }: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
          <Icon className="size-10 text-indigo-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
          <Plus className="size-4 text-neutral-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>

      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
