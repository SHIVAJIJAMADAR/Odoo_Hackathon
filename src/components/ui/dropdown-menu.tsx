"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function DropdownMenu({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }, [isControlled, onOpenChange])

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx.setOpen(!ctx.open),
    })
  }

  return (
    <button type="button" onClick={() => ctx.setOpen(!ctx.open)}>
      {children}
    </button>
  )
}

function DropdownMenuContent({ children, align = "end", sideOffset = 4 }: { children: React.ReactNode; align?: "start" | "center" | "end"; sideOffset?: number }) {
  const ctx = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx?.setOpen(false)
      }
    }
    if (ctx?.open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ctx])

  if (!ctx?.open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        align === "end" && "right-0",
        align === "start" && "left-0"
      )}
      style={{ marginTop: sideOffset }}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({ children, className, onSelect, ...props }: React.ComponentProps<"div">) {
  const ctx = React.useContext(DropdownMenuContext)
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={() => {
        onSelect?.()
        ctx?.setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
