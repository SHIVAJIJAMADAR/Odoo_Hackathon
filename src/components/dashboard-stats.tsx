'use client'

import { motion } from 'framer-motion'
import { DollarSign, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  gradient: string
  className?: string
}

function StatCard({ title, value, subtitle, icon, trend, gradient, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 shadow-xl shadow-neutral-200/50 transition-shadow hover:shadow-2xl',
        className
      )}
    >
      <div className={cn('absolute inset-0 opacity-90', gradient)} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-white/60">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                trend.positive ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'
              )}
            >
              <TrendingUp className={cn('size-3', !trend.positive && 'rotate-180')} />
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-white/60">vs last month</span>
          </div>
        )}
      </div>

      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-black/10 blur-3xl" />
    </motion.div>
  )
}

interface DashboardStatsProps {
  totalExpenses: number
  pendingCount: number
  approvedCount: number
  totalAmount: number
}

export function DashboardStats({ totalExpenses, pendingCount, approvedCount, totalAmount }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Expenses"
        value={totalExpenses}
        subtitle="All time"
        icon={<DollarSign className="size-6 text-white" />}
        trend={{ value: 12, positive: true }}
        gradient="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
      />
      <StatCard
        title="Pending Review"
        value={pendingCount}
        subtitle="Awaiting approval"
        icon={<Clock className="size-6 text-white" />}
        gradient="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500"
      />
      <StatCard
        title="Approved"
        value={approvedCount}
        subtitle="This month"
        icon={<CheckCircle2 className="size-6 text-white" />}
        trend={{ value: 8, positive: true }}
        gradient="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"
      />
      <StatCard
        title="Total Amount"
        value={`$${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        subtitle="Normalized USD"
        icon={<DollarSign className="size-6 text-white" />}
        trend={{ value: 15, positive: true }}
        gradient="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500"
      />
    </div>
  )
}
