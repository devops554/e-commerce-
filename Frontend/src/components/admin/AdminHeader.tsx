"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Settings,
    LogOut,
    User,
    ChevronDown,
    Warehouse
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthContext'
import Image from 'next/image'
import { SidebarMobile } from '../ui/sidebar'
import { ScrollArea } from '../ui/scroll-area'
import { Navigation } from '../ui/nav-item'
import { getAdminNavigation } from '@/data/navigation/adminNav'
import { managerNavigation } from '@/data/navigation/managerNav'
import NotificationDrawer from './NotificationDrawer'
import { UserData } from '@/types/auth'
import { UserRole } from '@/services/user.service'
import { motion } from 'framer-motion'

interface AdminHeaderProps {
    user?: UserData | null
}

export default function AdminHeader({ user: propUser }: AdminHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user: authUser, logout } = useAuth()
    const user = propUser || authUser

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const getPageTitle = (path: string) => {
        const parts = path.split('/').filter(Boolean)
        if (parts.length <= 1) return 'Dashboard'

        const navigation = getAdminNavigation(user)
        const navItem = navigation.find(item => item.href === path)
        if (navItem) return navItem.title

        const lastPart = parts[parts.length - 1]
        if (lastPart.length > 20) {
            const secondLast = parts[parts.length - 2]
            return `Edit ${secondLast.slice(0, -1) || secondLast}`
        }

        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ')
    }

    const pageTitle = getPageTitle(pathname)

    const isManager = user?.role === UserRole.MANAGER

    const mobileHeader = (
        <div
            className="relative overflow-hidden bg-white"
            style={{ borderBottom: "1px solid #fce7f3" }}
        >
            {/* Top pink strip */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #fb7185, #f43f5e, #e11d48)" }}
            />

            {/* Soft pink glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(251,113,133,0.07) 0%, transparent 70%)"
                }}
            />

            <div className="relative flex flex-col items-center gap-3 px-6 pt-6 pb-5">
                {/* Full-width logo */}
                <div className="relative group w-full">
                    <div
                        className="absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition duration-500"
                        style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}
                    />
                    <div className="relative w-full flex items-center justify-center bg-rose-50/60 rounded-2xl px-4 py-3 border border-rose-100 group-hover:border-rose-200 group-hover:bg-rose-50 transition-all duration-300">
                        <Image
                            src="/photo/Kiranase-logo.png"
                            alt="Kiranase"
                            width={160}
                            height={44}
                            className="object-contain w-full h-auto max-h-[44px]"
                        />
                    </div>
                </div>

                {/* Role badge */}
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
                        {user?.role === UserRole.ADMIN
                            ? 'Admin Portal'
                            : user?.role === UserRole.SUB_ADMIN
                                ? 'Sub Admin Portal'
                                : 'Manager Portal'}
                    </span>
                </div>
            </div>

        </div>
    )

    return (
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm"
            style={{ borderColor: "#fce7f3" }}
        >
            {/* Top pink strip */}
            <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #fb7185, #f43f5e, #e11d48)" }}
            />

            <div className="flex items-center justify-between h-20 px-6 md:px-10">

                {/* ── Left: Mobile menu + Page title ── */}
                <div className="flex items-center gap-6">
                    <SidebarMobile header={mobileHeader}>
                        <ScrollArea className="h-[calc(75vh-148px)] w-full">
                            <div className="px-3 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 mb-3 text-rose-300">
                                    {isManager ? 'Warehouse Operations' : 'Administration'}
                                </p>
                                <Navigation
                                    navigation={isManager ? managerNavigation : getAdminNavigation(user)}
                                />
                            </div>

                        </ScrollArea>
                        <div className="relative z-10 p-4"
                            style={{ borderTop: "1px solid #fce7f3" }}
                        >
                            {/* User card */}
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 bg-rose-50 border border-rose-100">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #fb7185, #e11d48)" }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || "M"}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                                        {user?.name || "Manager"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate">
                                        {user?.email || "manager@kiranase.com"}
                                    </span>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-rose-50 border border-transparent hover:border-rose-100"
                            >
                                <div className="p-1.5 rounded-lg bg-rose-50 group-hover:bg-rose-100 transition-colors">
                                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                                </div>
                                <span className="text-sm font-bold text-rose-500">Sign Out</span>
                            </button>
                        </div>
                    </SidebarMobile>


                    <div className="hidden lg:flex flex-col">
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={pageTitle}
                            className="text-2xl font-extrabold text-slate-900 tracking-tight"
                        >
                            {pageTitle}
                        </motion.h1>
                        <p className="text-xs font-medium text-rose-400 mt-0.5">
                            Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
                        </p>
                    </div>
                </div>


                {/* ── Right: Notifications + Profile ── */}
                <div className="flex items-center gap-3 md:gap-5">
                    <NotificationDrawer />

                    <div className="h-8 w-px mx-1 block" style={{ background: "#fce7f3" }} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-200 group focus:outline-none border border-transparent hover:border-rose-100 hover:bg-rose-50/50">
                                <div className="relative">
                                    <div
                                        className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"
                                        style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}
                                    />
                                    <Avatar className="h-9 w-9 relative border-2 shadow-sm" style={{ borderColor: "#fce7f3" }}>
                                        <AvatarImage src={"/img/user-1.jpg"} alt={user?.name || "Admin"} />
                                        <AvatarFallback
                                            className="text-white font-bold text-xs uppercase"
                                            style={{ background: "linear-gradient(135deg, #fb7185, #e11d48)" }}
                                        >
                                            {user?.name?.charAt(0) || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                                    <span className="text-sm font-bold text-slate-800 group-hover:text-rose-500 transition-colors">
                                        {user?.name || 'Admin'}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-400">
                                        {user?.role === UserRole.ADMIN
                                            ? 'Super Admin'
                                            : user?.role === UserRole.SUB_ADMIN
                                                ? 'Sub Admin'
                                                : 'Manager'}
                                    </span>
                                </div>

                                <ChevronDown className="h-3.5 w-3.5 text-rose-300 group-hover:text-rose-500 transition-all group-hover:rotate-180 duration-200" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-64 p-2 rounded-2xl shadow-2xl"
                            style={{
                                borderColor: "#fce7f3",
                                boxShadow: "0 20px 40px -12px rgba(244,63,94,0.12)"
                            }}
                            align="end"
                            sideOffset={8}
                        >
                            {/* Profile card */}
                            <div
                                className="flex items-center gap-3 p-3 mb-1 rounded-xl"
                                style={{ background: "#fff1f2", border: "1px solid #fce7f3" }}
                            >
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={"/img/user-1.jpg"} alt={user?.name || "Admin"} />
                                    <AvatarFallback
                                        className="text-white font-bold text-xs uppercase"
                                        style={{ background: "linear-gradient(135deg, #fb7185, #e11d48)" }}
                                    >
                                        {user?.name?.charAt(0) || "A"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs font-medium truncate text-rose-400">{user?.email || 'admin@kiranase.com'}</p>
                                </div>
                            </div>

                            <DropdownMenuSeparator style={{ background: "#fce7f3" }} />

                            <div className="grid gap-1 py-1">
                                <DropdownMenuItem
                                    onClick={() => isManager ? router.push('/manager/profile') : router.push('/admin/profile')}
                                    className="px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50 focus:bg-rose-50"
                                >
                                    <User className="mr-3 h-4 w-4 text-rose-400" />
                                    <span className="text-sm font-medium">My Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => isManager ? router.push('/manager/settings') : router.push('/admin/settings')}
                                    className="px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50 focus:bg-rose-50"
                                >
                                    <Settings className="mr-3 h-4 w-4 text-rose-400" />
                                    <span className="text-sm font-medium">Settings</span>
                                </DropdownMenuItem>
                            </div>

                            <DropdownMenuSeparator style={{ background: "#fce7f3" }} />

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="px-3 py-2.5 rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors"
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                <span className="text-sm font-bold">Logout Session</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}