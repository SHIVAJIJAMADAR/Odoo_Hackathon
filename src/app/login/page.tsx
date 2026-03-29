'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2, User, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const redirectByRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        toast.error(error.message)
        return
      }

      const role = String(profile?.role ?? '').toLowerCase()
      if (role === 'admin') {
        router.push('/admin')
        return
      }

      router.push('/dashboard')
    } catch {
      toast.error('Failed to determine user role')
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Logged in successfully!')
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        toast.error(userError?.message ?? 'Unable to load user session')
        return
      }

      await redirectByRole(userData.user.id)
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const companyName = formData.get('company_name') as string

      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        toast.error(signUpError.message)
        return
      }

      if (!signUpData.user) {
        toast.success('Account created! Please check your email for confirmation.')
        return
      }

      const { error: companyError } = await supabase
        .from('companies')
        .upsert({ name: companyName }, { onConflict: 'name' })

      if (companyError) {
        console.error('Company upsert error:', companyError)
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('name', companyName)
        .single()

      if (companyData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            company_id: companyData.id,
            role: 'pending',
            full_name: email.split('@')[0],
          })

        if (profileError) {
          console.error('Profile insert error:', profileError)
        }
      }

      toast.success('Account created!')
      await redirectByRole(signUpData.user.id)
    } catch {
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/50 to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <User className="size-8" />
          </div>
          <h1 className="text-2xl font-bold">Smart Reimbursement System</h1>
          <p className="mt-2 text-muted-foreground">Streamline your expense management</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="name@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Get started with Smart Reimbursement System
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input id="signup-email" name="email" type="email" placeholder="name@company.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="company-name" name="company_name" placeholder="Acme Inc." className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input id="signup-password" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
