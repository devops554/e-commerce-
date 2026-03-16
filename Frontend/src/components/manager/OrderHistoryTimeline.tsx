"use client"

import React from 'react'
import { CheckCircle2, Clock, Package, Truck, User, MapPin, Search } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface HistoryItem {
    actor: { name: string; role: string } | string
    actorRole: string
    action: string
    status: string
    note?: string
    timestamp: string | Date
}

interface OrderHistoryTimelineProps {
    history: HistoryItem[]
}

const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
        case 'CREATED':
        case 'PENDING':
            return <Clock className="h-5 w-5" />
        case 'CONFIRMED':
            return <CheckCircle2 className="h-5 w-5" />
        case 'PACKED':
            return <Package className="h-5 w-5" />
        case 'SHIPPED':
        case 'OUT_FOR_DELIVERY':
            return <Truck className="h-5 w-5" />
        case 'DELIVERED':
            return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        case 'CANCELLED':
            return <Search className="h-5 w-5 text-red-500" />
        default:
            return <Clock className="h-5 w-5" />
    }
}

const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
        case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100'
        case 'SHIPPED':
        case 'OUT_FOR_DELIVERY': return 'bg-blue-50 text-blue-600 border-blue-100'
        default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
}

export const OrderHistoryTimeline = ({ history }: OrderHistoryTimelineProps) => {
    if (!history || history.length === 0) return (
        <div className="flex flex-col items-center justify-center p-8 text-slate-400">
            <Clock className="h-10 w-10 mb-2 opacity-20" />
            <p className="font-medium">No history recorded yet.</p>
        </div>
    )

    const sortedHistory = [...history].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {sortedHistory.map((item, index) => (
                <div key={index} className="relative flex items-start gap-4">
                    <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white z-10",
                        index === 0 ? "border-blue-500 ring-4 ring-blue-50" : "border-slate-200"
                    )}>
                        {getStatusIcon(item.status)}
                    </div>
                    
                    <div className="flex flex-col gap-1 w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border",
                                getStatusColor(item.status)
                            )}>
                                {item.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                                {format(new Date(item.timestamp), 'MMM dd, hh:mm a')}
                            </span>
                        </div>
                        
                        <h4 className="text-sm font-black text-slate-900 mt-1">
                            {item.action.replace(/_/g, ' ')}
                        </h4>
                        
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-3 w-3 text-slate-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-500">
                                {typeof item.actor === 'object' ? item.actor.name : 'System'} ({item.actorRole || 'automated'})
                            </p>
                        </div>
                        
                        {item.note && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-100 italic text-xs text-slate-600 font-medium">
                                "{item.note}"
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
