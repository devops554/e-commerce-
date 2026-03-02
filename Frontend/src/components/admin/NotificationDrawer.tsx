'use client'

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell, CheckCheck, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function NotificationDrawer() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()

    const handleMarkAsRead = (id: string) => {
        markAsRead(id)
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead()
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="relative transition-all duration-200 hover:bg-slate-100 rounded-full h-9 w-9 p-0">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[500px] p-0 flex flex-col h-full bg-white">
                <SheetHeader className="p-6 border-b bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">Notifications</SheetTitle>
                            <span className="text-xs text-gray-500 mt-0.5">You have {unreadCount} unread messages</span>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all px-3 py-1.5 h-auto rounded-lg"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-2 py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 text-sm text-gray-500 italic">
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="relative mb-4">
                                <div className="absolute -inset-2 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-sm border border-gray-100 flex items-center justify-center h-16 w-16">
                                    <Bell className="h-8 w-8 text-blue-500 opacity-60" />
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">All caught up!</h3>
                            <p className="text-sm text-gray-500 max-w-[200px] mx-auto">No notifications yet. Check back later for updates.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 px-4">
                            {(notifications as any[]).map((notification: any) => (
                                <div
                                    key={notification._id}
                                    className={`group relative p-4 rounded-2xl border transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${!notification.isRead
                                        ? 'bg-blue-50/40 border-blue-100/50 shadow-sm hover:bg-blue-50/60'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                        }`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-125 ${!notification.isRead ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-transparent'
                                            }`} />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm font-bold tracking-tight lowercase first-letter:uppercase transition-colors ${!notification.isRead ? 'text-blue-950' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] font-medium text-gray-400 shrink-0 whitespace-nowrap bg-gray-100/50 px-2 py-0.5 rounded-full">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-2">
                                                {notification.message}
                                            </p>

                                            {(notification.type === 'contact_form' || notification.type === 'course_purchased') && (
                                                <Link
                                                    href={notification.type === 'contact_form' ? "/admin/contacts" : `/courses/${notification.data?.courseId}`}
                                                    className="inline-flex items-center mt-2.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 group-hover:bg-blue-100 px-3 py-1 rounded-full group-hover:shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!notification.isRead) {
                                                            handleMarkAsRead(notification._id);
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                    <ChevronRight className="h-2.5 w-2.5 ml-1" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 border-t bg-gray-50/50">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all rounded-xl py-5 shadow-sm"
                        onClick={() => {/* Navigate to all notifications */ }}
                    >
                        View All Activity
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
