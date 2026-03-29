'use server'

import { createClient } from '@/utils/supabase/server'

export type CreateApprovalRuleResult = { ok: true } | { ok: false; error: string }

export async function createApprovalRule(): Promise<CreateApprovalRuleResult> {
  try {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { ok: false, error: userError?.message ?? 'You must be logged in.' }
    }

    console.log('createApprovalRule', { user_id: userData.user.id })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', userData.user.id)
      .single()

    if (profileError) {
      console.log('createApprovalRule profileError', { message: profileError.message })
      return { ok: false, error: profileError.message }
    }

    if (!profile?.company_id) {
      console.log('createApprovalRule missing company_id', { user_id: userData.user.id })
      return { ok: false, error: 'Missing company_id for this user profile. Please complete your profile setup.' }
    }

    console.log('createApprovalRule resolved company_id', { company_id: profile.company_id })

    const { error } = await supabase.from('approval_rules').insert({
      company_id: profile.company_id,
      rule_type: 'percentage',
      conditions: { min_percentage: 1 },
      is_active: true,
    })

    if (error) {
      console.log('createApprovalRule insertError', { message: error.message })
      return { ok: false, error: error.message }
    }

    console.log('createApprovalRule success', { company_id: profile.company_id })
    return { ok: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.log('createApprovalRule exception', { message })
    return { ok: false, error: message }
  }
}

export type GetCompanyMembersResult = { ok: true; data: CompanyMember[] } | { ok: false; error: string }

export type CompanyMember = {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

export async function getCompanyMembers(): Promise<GetCompanyMembersResult> {
  try {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { ok: false, error: 'You must be logged in.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', userData.user.id)
      .single()

    if (profileError || !profile) {
      return { ok: false, error: 'Could not find your profile.' }
    }

    if (profile.role !== 'admin') {
      return { ok: false, error: 'Only admins can view company members.' }
    }

    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: true })

    if (membersError) {
      return { ok: false, error: membersError.message }
    }

    const membersWithEmail = await Promise.all(
      (members ?? []).map(async (member) => {
        const { data: userData } = await supabase.auth.admin.getUserById(member.id)
        return {
          ...member,
          email: userData.user?.email ?? 'Unknown',
        }
      })
    )

    return { ok: true, data: membersWithEmail }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

export type UpdateMemberRoleResult = { ok: true } | { ok: false; error: string }

export async function updateMemberRole(
  memberId: string,
  newRole: 'admin' | 'manager' | 'employee'
): Promise<UpdateMemberRoleResult> {
  try {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { ok: false, error: 'You must be logged in.' }
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', userData.user.id)
      .single()

    if (profileError || !adminProfile) {
      return { ok: false, error: 'Could not find your profile.' }
    }

    if (adminProfile.role !== 'admin') {
      return { ok: false, error: 'Only admins can change roles.' }
    }

    if (memberId === userData.user.id) {
      return { ok: false, error: 'You cannot change your own role.' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('company_id', adminProfile.company_id)

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

