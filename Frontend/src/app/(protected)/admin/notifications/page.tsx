"use client"

import { useNotifications } from "@/hooks/useNotifications"
import { Bell, Package, AlertTriangle, Info, CheckCheck, Clock, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Notification } from "@/services/notification.service"

const getIcon = (type: string) => {
    switch (type) {
        case 'order': return <Package className="h-5 w-5 text-primary" />;
        case 'stock': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
        default: return <Info className="h-5 w-5 text-blue-500" />;
    }
}

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()
    const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'stock'>('all')

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'all') return true;
        return n.type === filter;
    })

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto">
            {/* Header section with stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Alerts</h1>
                    <p className="text-slate-500 font-medium">Manage and track all administrative notifications</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Unread Alerts</p>
                            <p className="text-lg font-black text-slate-900 leading-none mt-1">{unreadCount}</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            onClick={() => markAllAsRead()}
                            className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] px-6 gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                                <Filter className="h-4 w-4 text-primary" />
                                Quick Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {[
                                { id: 'all', label: 'All Alerts', icon: <Bell className="h-4 w-4" /> },
                                { id: 'unread', label: 'Unread Only', icon: <Clock className="h-4 w-4" /> },
                                { id: 'order', label: 'Orders', icon: <Package className="h-4 w-4" /> },
                                { id: 'stock', label: 'Stock Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id as any)}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group ${filter === tab.id
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'text-slate-600 hover:bg-white hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${filter === tab.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                                            {tab.icon}
                                        </div>
                                        <span className="text-xs font-bold leading-none">{tab.label}</span>
                                    </div>
                                    {filter !== tab.id && (
                                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 group-hover:bg-primary/10 group-hover:text-primary">
                                            {notifications.filter(n => tab.id === 'all' ? true : (tab.id === 'unread' ? !n.isRead : n.type === tab.id)).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications List */}
                <div className="lg:col-span-3 space-y-4">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Card key={i} className="border-none shadow-sm rounded-3xl animate-pulse h-24 bg-white/50" />
                        ))
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="p-6 bg-slate-50 rounded-full mb-6 relative">
                                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl scale-150" />
                                <Bell className="h-12 w-12 text-slate-200 relative" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic">No notifications found</h3>
                            <p className="text-slate-400 font-medium text-sm mt-1">Try changing your filter settings</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNotifications.map((notification: Notification) => (
                                <Card
                                    key={notification._id}
                                    className={`border-none transition-all duration-300 rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 relative cursor-pointer ${!notification.isRead ? 'bg-white ring-2 ring-primary/5' : 'bg-white opacity-80 hover:opacity-100'
                                        }`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-5">
                                            <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500 ${!notification.isRead ? 'bg-primary/10 shadow-inner' : 'bg-slate-50'}`}>
                                                {getIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className={`text-lg tracking-tight ${!notification.isRead ? 'font-black text-slate-900 italic' : 'font-bold text-slate-600'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                            </div>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${notification.type === 'order' ? 'text-primary' : (notification.type === 'stock' ? 'text-orange-500' : 'text-blue-500')
                                                                }`}>
                                                                {notification.type} alert
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!notification.isRead && (
                                                        <span className="h-3 w-3 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(255,50,105,0.5)]" />
                                                    )}
                                                </div>

                                                <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
                                                    {notification.message}
                                                </p>

                                                {notification.link && (
                                                    <div className="flex items-center justify-end mt-4">
                                                        <Button asChild variant="ghost" className="h-10 rounded-xl hover:bg-primary/5 text-primary font-black text-xs uppercase tracking-widest gap-2">
                                                            <Link href={notification.link}>
                                                                Resolve Now
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
