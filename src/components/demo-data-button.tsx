'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateDemoData } from '@/app/dashboard/actions'

export function DemoDataButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    const result = await generateDemoData()
    setIsLoading(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(`${result.count} demo expenses generated!`, {
      icon: <Check className="size-5 text-emerald-500" />,
    })
    router.refresh()
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isLoading}
      className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
    >
      {isLoading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 size-4" />
      )}
      Generate Demo Data
    </Button>
  )
}
