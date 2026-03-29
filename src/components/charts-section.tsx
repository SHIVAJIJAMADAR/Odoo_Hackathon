'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const trendData = [
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 1398 },
  { month: 'Mar', amount: 3800 },
  { month: 'Apr', amount: 3908 },
  { month: 'May', amount: 4800 },
  { month: 'Jun', amount: 3800 },
]

const categoryData = [
  { name: 'Travel', value: 35, color: '#6366f1' },
  { name: 'Food', value: 25, color: '#8b5cf6' },
  { name: 'Supplies', value: 20, color: '#a855f7' },
  { name: 'Software', value: 12, color: '#d946ef' },
  { name: 'Other', value: 8, color: '#f472b6' },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-semibold text-neutral-900">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

interface ChartsSectionProps {
  className?: string
}

export function ChartsSection({ className }: ChartsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`grid gap-4 lg:grid-cols-2 ${className || ''}`}
    >
      <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Expense Trend</h3>
          <p className="text-sm text-neutral-500">Monthly expense overview</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">By Category</h3>
          <p className="text-sm text-neutral-500">Expense distribution</p>
        </div>
        <div className="flex h-64 items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-neutral-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
