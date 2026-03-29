'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCompanyMembers, updateMemberRole, type CompanyMember } from '@/app/admin/actions'

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  employee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
] as const

export function RoleManagement() {
  const router = useRouter()
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const loadMembers = async () => {
      const result = await getCompanyMembers()
      if (!mountedRef.current) return
      setIsLoading(false)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setMembers(result.data)
    }

    loadMembers()

    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (newRole !== 'admin' && newRole !== 'manager' && newRole !== 'employee') {
      return
    }

    setUpdatingId(memberId)
    const result = await updateMemberRole(memberId, newRole as 'admin' | 'manager' | 'employee')
    setUpdatingId(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Role updated successfully')
    router.refresh()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Team Members
          </CardTitle>
          <CardDescription>Manage team member roles</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Team Members
        </CardTitle>
        <CardDescription>Manage team member roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-center text-muted-foreground">No team members found.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{member.full_name || 'No name'}</span>
                  <span className="text-sm text-muted-foreground">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleColors[member.role] || roleColors.employee}`}
                  >
                    {member.role}
                  </span>
                  <Select
                    value={member.role}
                    onValueChange={(value) => {
                      if (value) handleRoleChange(member.id, value)
                    }}
                    disabled={updatingId === member.id}
                  >
                    <SelectTrigger className="w-[130px]">
                      {updatingId === member.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
