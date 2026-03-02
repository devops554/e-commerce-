"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInput,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getAdminNavigation } from "@/data/navigation/adminNav"
import { useAuth } from "@/providers/AuthContext"

export function AdminSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const navigation = getAdminNavigation(user)

    return (
        <Sidebar collapsible="icon" className="border-r border-gray-200">
            <SidebarHeader className="h-20 flex flex-col items-center justify-center border-b px-4">
                <div className="w-full flex items-center justify-between group-data-[collapsible=icon]:justify-center">
                    <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-white font-black shadow-lg shadow-green-200">
                            B.
                        </div>
                        <span className="text-xl font-black italic tracking-tighter text-gray-900">AdminPanel.</span>
                    </Link>
                    <div className="hidden group-data-[collapsible=icon]:flex h-8 w-8 items-center justify-center rounded-lg bg-green-700 text-white font-black">
                        B.
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="px-2 py-4 group-data-[collapsible=icon]:hidden">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <SidebarInput placeholder="Search menu..." className="pl-8 bg-gray-50/50 border-gray-200 focus-visible:ring-green-600" />
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-2">General</SidebarGroupLabel>
                    <SidebarMenu>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || item.items?.some(sub => pathname === sub.href)

                            if (item.items && item.items.length > 0) {
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton isActive={isActive}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                                <Link href={subItem.href}>
                                                                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton isActive={pathname === item.href}>
                                        <Link href={item.href || "#"} title={item.title}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* You can add user profile, logout etc here */}
                <div className="p-4 text-xs text-gray-400 group-data-[collapsible=icon]:hidden">
                    &copy; 2024 BivhaShop
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
