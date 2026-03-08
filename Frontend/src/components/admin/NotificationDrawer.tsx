"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, Package, AlertTriangle, Info, CheckCheck, Clock, Trash2, ArrowRight } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Notification } from "@/services/notification.service"

const getIcon = (type: string) => {
    switch (type) {
        case 'order': return <Package className="h-4 w-4 text-primary" />;
        case 'stock': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        default: return <Info className="h-4 w-4 text-blue-500" />;
    }
}

export default function NotificationDrawer() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-100 rounded-xl hover:bg-slate-50 relative group">
                    <Bell className="h-5 w-5 text-slate-600 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-white"></span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-white/20 bg-white/80 backdrop-blur-xl">
                <SheetHeader className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">Notifications</SheetTitle>
                                <p className="text-xs font-medium text-slate-500">You have {unreadCount} unread alerts</p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                className="h-9 rounded-xl hover:bg-primary/5 text-primary font-bold text-xs gap-2"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="divide-y divide-gray-50">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="p-5 animate-pulse flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-slate-100 rounded" />
                                        <div className="h-3 w-full bg-slate-50 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center">
                                <div className="p-4 rounded-full bg-slate-50 mb-4">
                                    <Bell className="h-8 w-8 text-slate-200" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">All caught up!</h3>
                                <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
                            </div>
                        ) : (
                            notifications.map((notification: Notification) => (
                                <div
                                    key={notification._id}
                                    className={`group p-5 transition-all hover:bg-slate-50/80 cursor-pointer relative ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1 flex-shrink-0 p-2.5 rounded-xl ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-slate-100/50'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className={`text-sm tracking-tight truncate ${!notification.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>

                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                                                >
                                                    View Details
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl bg-white border-slate-200 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all">
                        <Link href="/admin/notifications">
                            View All Notifications
                        </Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
