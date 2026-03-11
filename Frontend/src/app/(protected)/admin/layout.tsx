"use client"

import React, { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Navigation } from '@/components/ui/nav-item'
import { getAdminNavigation } from '@/data/navigation/adminNav'
import { useNotifications } from '@/hooks/useNotifications'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAuth } from '@/providers/AuthContext'
import { BreadcrumbProvider } from '@/providers/BreadcrumbContext'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { motion, AnimatePresence } from 'framer-motion'
import { UserRole } from '@/services/user.service'
import { useSocket } from '@/hooks/useSocket'
import { toast } from 'sonner'

interface AdminLayoutProps {
    children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const router = useRouter()
    const { user, isLoaded, logout } = useAuth()
    const { unreadCount } = useNotifications()

    useEffect(() => {
        if (isLoaded && (!user || (user.role !== 'admin' && user.role !== 'subadmin'))) {
            router.push('/')
        }
    }, [user, isLoaded, router])

    useSocket('order.created', (order) => {
        toast.success(`New order received: ${order.orderId}`, {
            description: `Total amount: ₹${order.totalAmount}`,
            duration: 5000,
        })
    })

    useSocket('stock.updated', (data) => {
        toast.info(`Stock indicator updated`, {
            description: `Variant ID: ${data.variantId} now has ${data.stock} units left.`,
            duration: 5000,
        })
    })

    if (!isLoaded || (!user || (user.role !== 'admin' && user.role !== 'subadmin'))) {
        return (
            <div className="flex h-screen items-center justify-center bg-rose-50">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-rose-400/20 border-t-rose-500" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-rose-600 text-xs">A</div>
                </div>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const enhancedNavigation = getAdminNavigation(user).map(item =>
        item.title === 'Notifications' ? { ...item, badge: unreadCount } : item
    )

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-inter">

            {/* ─── DESKTOP SIDEBAR ─── */}
            <aside
                className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30 bg-white overflow-hidden"
                style={{
                    borderRight: "1px solid #fce7f3",
                    boxShadow: "4px 0 24px -8px rgba(244,63,94,0.08)"
                }}
            >
                {/* Top pink strip */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 z-20"
                    style={{ background: "linear-gradient(90deg, #fb7185, #f43f5e, #e11d48)" }}
                />

                {/* Soft pink glow */}
                <div
                    className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% -20%, rgba(251,113,133,0.08) 0%, transparent 70%)"
                    }}
                />

                {/* ── LOGO HEADER ── */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex flex-col items-center px-5 pt-7 pb-5"
                    style={{ borderBottom: "1px solid #fce7f3" }}
                >
                    <div className="relative group w-full">
                        <div
                            className="absolute -inset-1 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition duration-500"
                            style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}
                        />
                        <div className="relative w-full flex items-center justify-center bg-rose-50/60 rounded-2xl px-4 py-3 border border-rose-100
                            group-hover:border-rose-200 group-hover:bg-rose-50 transition-all duration-300">
                            <Image
                                src="https://res.cloudinary.com/divmjg4i9/image/upload/v1773213508/Kiranase-logo_kguira.png"
                                alt="Kiranase"
                                width={160}
                                height={44}
                                className="object-contain w-full h-auto max-h-[44px]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#f43f5e" }}>
                            {user?.role === UserRole.ADMIN ? 'Super Admin' : 'Sub Admin'}
                        </span>
                    </div>
                </motion.div>

                {/* ── NAV with shadcn ScrollArea ── */}
                <ScrollArea className="flex-1 relative z-10 h-[calc(40vh-128px)]">
                    <div className="px-3 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 mb-3 text-rose-300">
                            Main Navigation
                        </p>
                        <Navigation navigation={enhancedNavigation} />
                    </div>
                </ScrollArea>

                {/* ── FOOTER ── */}
                <div
                    className="relative z-10 p-4"
                    style={{ borderTop: "1px solid #fce7f3" }}
                >
                    {/* User card */}
                    <div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 border"
                        style={{ background: "#fff1f2", borderColor: "#fce7f3" }}
                    >
                        <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #fb7185, #e11d48)" }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                                {user?.name || "Admin"}
                            </span>
                            <span className="text-[10px] truncate text-rose-400">
                                {user?.email || "admin@kiranase.com"}
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
            </aside>

            {/* ─── MAIN CONTENT ─── */}
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

                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-100/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
                </div>
            </BreadcrumbProvider>
        </div>
    )
}

export default AdminLayout