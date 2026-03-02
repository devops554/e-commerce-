"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Settings,
    LogOut,
    User,
    Bell,
    Search,
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import NotificationDrawer from './NotificationDrawer'
import { UserData } from '@/types/auth'
import { UserRole } from '@/services/user.service'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminHeaderProps {
    user?: UserData | null
}

export default function AdminHeader({ user: propUser }: AdminHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user: authUser, logout } = useAuth()
    const user = propUser || authUser
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    // Get Page Title from Pathname
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

    const mobileHeader = (
        <div className="flex items-center gap-3 p-6 bg-white border-b border-slate-50">
            <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className={cn(
                    "relative bg-white p-2 rounded-xl shadow-sm border border-slate-100",
                    "group-hover:border-blue-500/50 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-blue-500/10"
                )}>
                    <Image
                        src="https://res.cloudinary.com/dmpuhqwqb/image/upload/v1770719442/logo-2_yro9yx.gif"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Bivha Ed.</span>
                <span className="mt-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin</span>
            </div>
        </div>
    )

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between h-20 px-6 md:px-10">
                {/* Left Section: Mobile Menu & Dynamic Title */}
                <div className="flex items-center gap-6">
                    <SidebarMobile header={mobileHeader}>
                        <div className="px-2">
                            <Navigation navigation={getAdminNavigation(user)} />
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
                        <p className="text-xs font-medium text-slate-400 mt-0.5">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</p>
                    </div>
                </div>

                {/* Center Section: Premium Search Bar */}
                {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className={cn(
                        "relative w-full group transition-all duration-300",
                        isSearchFocused ? "scale-105" : "scale-100"
                    )}>
                        <div className={cn(
                            "absolute inset-0 bg-blue-500/5 rounded-2xl blur-lg transition-opacity duration-300",
                            isSearchFocused ? "opacity-100" : "opacity-0"
                        )}></div>
                        <div className={cn(
                            "relative flex items-center bg-slate-50 border transition-all duration-300 rounded-2xl px-4 py-2.5",
                            isSearchFocused ? "border-blue-500/50 bg-white shadow-xl shadow-blue-500/10" : "border-slate-200 hover:border-slate-300"
                        )}>
                            <Search className={cn(
                                "h-4 w-4 transition-colors duration-300",
                                isSearchFocused ? "text-blue-500" : "text-slate-400"
                            )} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="ml-3 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 w-full placeholder:text-slate-400"
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">
                                <span>⌘</span>
                                <span>K</span>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Right Section: Actions & Profile */}
                <div className="flex items-center gap-3 md:gap-5">
                    <div className="hidden sm:flex items-center gap-2">
                        {/* <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-slate-50 relative group">
                            <Bell className="h-5 w-5 text-slate-600 transition-transform group-hover:rotate-12" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
                        </Button> */}
                        <NotificationDrawer />
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all duration-200 group focus:outline-none">
                                <div className="relative">
                                    <div className="absolute -inset-0.5 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
                                    <Avatar className="h-10 w-10 relative border-2 border-white shadow-sm">
                                        <AvatarImage src={"/img/user-1.jpg"} alt={user?.name || "Admin"} />
                                        <AvatarFallback className="bg-slate-900 text-white font-bold text-xs uppercase">
                                            {user?.name?.charAt(0) || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user?.name || 'Admin'}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {user?.role === UserRole.ADMIN ? 'Super Admin' : 'Sub Admin'}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-all" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 p-2 rounded-2xl border-slate-200/60 shadow-2xl shadow-slate-200/50" align="end" sideOffset={8}>
                            <DropdownMenuLabel className="p-3">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{user?.email || 'admin@bivha.com'}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <div className="grid gap-1 py-1">
                                <DropdownMenuItem onClick={() => router.push('/admin/profile')} className="px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <User className="mr-3 h-4 w-4" />
                                    <span className="text-sm font-medium">My Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="px-3 py-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <Settings className="mr-3 h-4 w-4" />
                                    <span className="text-sm font-medium">Settings</span>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem onClick={handleLogout} className="px-3 py-2.5 rounded-xl text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors">
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
