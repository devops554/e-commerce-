"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, ChevronRight, Building2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// --- 1. CONTEXT ---
const SidebarContext = React.createContext<{
  state: "expanded" | "collapsed"
  collapsible: "offcanvas" | "icon" | "none"
  setOpen: (open: boolean) => void
  open: boolean
}>({
  state: "expanded",
  collapsible: "none",
  setOpen: () => { },
  open: true,
})

// --- 2. COMPONENTS ---

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "offcanvas" | "icon" | "none"
}

export function Sidebar({
  className,
  children,
  collapsible = "none",
  ...props
}: SidebarProps) {
  const [open, setOpen] = React.useState(true)
  const state = open ? "expanded" : "collapsed"

  return (
    <SidebarContext.Provider value={{ state, collapsible, setOpen, open }}>
      <div
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        className={cn(
          "group flex flex-col h-full transition-all duration-300 ease-in-out",
          state === "expanded" ? "w-72" : collapsible === "icon" ? "w-20" : "w-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col shrink-0", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto p-4 shrink-0", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 mb-6", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = React.useContext(SidebarContext)
  if (state === "collapsed") return null

  return (
    <div
      className={cn("px-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("flex flex-col gap-1 list-none p-0 m-0", className)} {...props}>
      {children}
    </ul>
  )
}

export function SidebarMenuItem({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("list-none", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
}

export function SidebarMenuButton({
  className,
  isActive,
  children,
  tooltip,
  ...props
}: SidebarMenuButtonProps) {
  const { state } = React.useContext(SidebarContext)

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/btn",
        "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
        isActive && "bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100",
        state === "collapsed" && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarMenuSub({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ml-6 mt-1 flex flex-col gap-1 border-l border-slate-100 pl-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuSubItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuSubButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean
  asChild?: boolean
}

export function SidebarMenuSubButton({
  className,
  isActive,
  asChild,
  children,
  ...props
}: SidebarMenuSubButtonProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
        "text-slate-500 hover:text-blue-600 hover:translate-x-1",
        isActive && "text-blue-600 font-medium bg-blue-50/50",
        className,
        (children.props as any).className
      ),
      ...props
    } as any)
  }

  return (
    <a
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
        "text-slate-500 hover:text-blue-600 hover:translate-x-1",
        isActive && "text-blue-600 font-medium bg-blue-50/50",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

export function SidebarInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMobile({
  children,
  header,
}: {
  children: React.ReactNode
  header?: React.ReactNode
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80 bg-white flex flex-col h-full border-r shadow-2xl">
        <div className="flex flex-col h-full">
          {header && <div className="p-4 border-b border-slate-100">{header}</div>}
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="flex flex-col gap-1">
              {children}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
