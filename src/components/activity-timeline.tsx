'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'approved' | 'rejected' | 'submitted'
  user: string
  amount: number
  currency: string
  timestamp: string
  description?: string
}

interface ActivityTimelineProps {
  activities: Activity[]
  className?: string
}

const activityConfig = {
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'rejected',
  },
  submitted: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'submitted',
  },
}

function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200/50 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Clock className="size-8 text-neutral-400" />
        </div>
        <p className="text-neutral-500">No recent activity</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm', className)}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
          <p className="text-sm text-neutral-500">Latest expense updates</p>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
          View all
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-neutral-200 via-neutral-200 to-transparent" />

        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pl-12"
              >
                <div
                  className={cn(
                    'absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('size-5', config.color)} />
                </div>

                <div className="flex-1 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 transition-colors hover:bg-neutral-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-neutral-900">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        <span className="text-neutral-500">{config.label}</span>
                        {' '}
                        <span className="font-semibold">
                          {activity.currency} {activity.amount.toLocaleString()}
                        </span>
                      </p>
                      {activity.description && (
                        <p className="mt-1 text-sm text-neutral-500 line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
