"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Package, AlertTriangle, Info, CheckCheck, ArrowRight, Sparkles } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Notification } from "@/services/notification.service"
import { useAuth } from "@/providers/AuthContext"

type TabType = 'All' | 'order' | 'stock' | 'info'

const TABS: { label: string; value: TabType }[] = [
    { label: 'All', value: 'All' },
    { label: 'Orders', value: 'order' },
    { label: 'Stock', value: 'stock' },
    { label: 'Info', value: 'info' },
]

const getIcon = (type: string) => {
    switch (type) {
        case 'order': return <Package className="h-4 w-4 text-pink-500" />;
        case 'stock': return <AlertTriangle className="h-4 w-4 text-rose-400" />;
        default: return <Info className="h-4 w-4 text-fuchsia-400" />;
    }
}

const getIconBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-pink-50/60';
    switch (type) {
        case 'order': return 'bg-pink-50 ring-1 ring-pink-200';
        case 'stock': return 'bg-rose-50 ring-1 ring-rose-200';
        default: return 'bg-fuchsia-50 ring-1 ring-fuchsia-200';
    }
}

const getAccentColor = (type: string) => {
    switch (type) {
        case 'order': return 'bg-pink-400';
        case 'stock': return 'bg-rose-400';
        default: return 'bg-fuchsia-400';
    }
}

export default function NotificationDrawer() {
    const { user } = useAuth()
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()
    const [activeTab, setActiveTab] = useState<TabType>('All')

    const filtered: Notification[] = activeTab === 'All'
        ? notifications
        : notifications.filter((n: Notification) => n.type === activeTab)

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl border border-pink-100 bg-white hover:bg-pink-50 shadow-sm relative group transition-all duration-200 hover:shadow-md hover:border-pink-200"
                >
                    <Bell className="h-[18px] w-[18px] text-pink-400 transition-all duration-300 group-hover:text-pink-600 group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-pink-500 text-[9px] font-black text-white flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-[500px] p-0 flex flex-col h-full border-l border-pink-100 bg-[#fff5f7] shadow-2xl [&_[data-radix-scroll-area-scrollbar]]:w-1.5 [&_[data-radix-scroll-area-thumb]]:bg-pink-300 [&_[data-radix-scroll-area-thumb]]:rounded-full [&_[data-radix-scroll-area-scrollbar]]:bg-pink-50">

                {/* Header */}
                <SheetHeader className="p-5 pb-4 border-b border-pink-100 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-md shadow-pink-200">
                                    <Bell className="h-5 w-5 text-white" />
                                </div>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-rose-500 rounded-full ring-2 ring-white" />
                                )}
                            </div>
                            <div>
                                <SheetTitle className="text-[15px] font-bold text-slate-900 tracking-tight leading-none mb-1">
                                    Notifications
                                </SheetTitle>
                                <p className="text-[11px] text-pink-400 font-medium">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                                        : 'Everything up to date'}
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-500 text-[11px] font-semibold transition-all duration-150 active:scale-95 border border-pink-100"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Mark all read
                            </button>
                        )}
                    </div>
                </SheetHeader>

                {/* Filter tabs — working with useState */}
                <div className="flex gap-1 px-4 py-3 bg-white border-b border-pink-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95 ${activeTab === tab.value
                                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm shadow-pink-200'
                                : 'text-slate-400 hover:text-pink-500 hover:bg-pink-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                    <div className="px-3 py-2 space-y-1.5">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white animate-pulse flex gap-3 border border-pink-50">
                                    <div className="h-9 w-9 rounded-xl bg-pink-50 flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-3 w-2/5 bg-pink-50 rounded-md" />
                                        <div className="h-2.5 w-full bg-pink-50/60 rounded-md" />
                                        <div className="h-2.5 w-3/4 bg-pink-50/40 rounded-md" />
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
                                <div className="relative mb-5">
                                    <div className="h-16 w-16 rounded-3xl bg-pink-50 flex items-center justify-center">
                                        <Bell className="h-7 w-7 text-pink-200" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-xl bg-rose-100 flex items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-slate-700 mb-1">
                                    {activeTab === 'All' ? "You're all caught up!" : `No ${activeTab} notifications`}
                                </h3>
                                <p className="text-[12px] text-slate-400 leading-relaxed max-w-[200px]">
                                    {activeTab === 'All'
                                        ? 'No new notifications right now.'
                                        : 'Switch to "All" to see everything.'}
                                </p>
                            </div>
                        ) : (
                            filtered.map((notification: Notification) => {
                                const link = notification.link || (notification.type === 'stock'
                                    ? (user?.role === 'manager' || user?.role === 'MANAGER' ? '/manager/inventory' : '/admin/product')
                                    : null)

                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                        className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-200 border ${!notification.isRead
                                            ? 'bg-white border-pink-100 shadow-sm hover:shadow-md hover:border-pink-200'
                                            : 'bg-white/50 border-transparent hover:bg-white hover:border-pink-100 hover:shadow-sm'
                                            }`}
                                    >
                                        {/* Unread left accent bar */}
                                        {!notification.isRead && (
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full ${getAccentColor(notification.type)}`} />
                                        )}

                                        <div className="flex gap-3 pl-1">
                                            <div className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all ${getIconBg(notification.type, notification.isRead)}`}>
                                                {getIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`text-[13px] leading-snug truncate ${!notification.isRead
                                                        ? 'font-bold text-slate-900'
                                                        : 'font-medium text-slate-400'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] font-semibold text-pink-300 whitespace-nowrap tabular-nums mt-0.5">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-2">
                                                    {notification.message}
                                                </p>

                                                {link && (
                                                    <Link
                                                        href={link}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-500 hover:text-pink-700 transition-colors group/link"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        View details
                                                        <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div className="h-2" />
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 bg-white border-t border-pink-100">
                    <Link
                        href={user?.role === 'manager' || user?.role === 'MANAGER' ? "/manager/notifications" : "/admin/notifications"}
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-[12px] font-bold transition-all duration-150 active:scale-[0.98] shadow-sm shadow-pink-200"
                    >
                        View all notifications
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

            </SheetContent>
        </Sheet>
    )
}