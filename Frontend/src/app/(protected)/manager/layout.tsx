"use client"

import React, { useEffect } from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Navigation } from '@/components/ui/nav-item'
import { managerNavigation } from '@/data/navigation/managerNav'
import {
    LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminHeader from '@/components/admin/AdminHeader'

import { useAuth } from '@/providers/AuthContext'
import { BreadcrumbProvider } from '@/providers/BreadcrumbContext'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { motion, AnimatePresence } from 'framer-motion'

interface ManagerLayoutProps {
    children: React.ReactNode
}

const ManagerLayout = ({ children }: ManagerLayoutProps) => {
    const router = useRouter()
    const { user, isLoaded, logout } = useAuth()

    useEffect(() => {
        if (isLoaded && (!user || user.role !== 'manager')) {
            router.push('/')
        }
    }, [user, isLoaded, router])

    if (!isLoaded || (!user || user.role !== 'manager')) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-700 text-xs">M</div>
                </div>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-inter">
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col shrink-0 bg-white border-r border-slate-200/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-30">
                <Sidebar collapsible="icon" className="h-full">
                    <SidebarHeader className="p-6">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 px-2 mb-4"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative bg-white p-2 rounded-xl shadow-sm border border-slate-100">
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
                                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Bivha Warehouse</span>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                                    Manager Portal
                                </span>
                            </div>
                        </motion.div>
                    </SidebarHeader>

                    <SidebarContent className="px-4 py-2">
                        <SidebarGroup>
                            <SidebarGroupLabel>Warehouse Operations</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <Navigation navigation={managerNavigation} />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-6 border-t border-slate-50">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group"
                            onClick={handleLogout}
                        >
                            <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-red-100 transition-colors">
                                <LogOut className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm">Sign Out</span>
                        </Button>
                    </SidebarFooter>
                </Sidebar>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <BreadcrumbProvider>
                <div className="flex flex-col flex-1 min-w-0 h-full relative">
                    <AdminHeader user={user as any} />

                    <main className="flex-1 overflow-y-auto bg-slate-50/30 relative scroll-smooth">
                        <div className="max-w-[1600px] mx-auto p-6 md:p-10">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <AdminBreadcrumb />
                            </motion.div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="pb-12"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
                </div>
            </BreadcrumbProvider>
        </div>
    )
}

export default ManagerLayout;
