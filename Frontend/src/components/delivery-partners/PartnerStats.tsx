"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, CheckCircle2, Calendar, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface StatsCardProps {
    icon: React.ReactElement
    label: string
    value: string | number
    color: string
}

export const StatsCard = ({ icon, label, value, color }: StatsCardProps) => (
    <Card className="rounded-3xl border-slate-100 shadow-sm p-5 bg-white flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 24 } as any)}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
        </div>
    </Card>
)

interface ShipmentRowProps {
    shipment: any
    status: 'active' | 'history'
}

export const ShipmentRow = ({ shipment, status }: ShipmentRowProps) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'active' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400'
            }`}>
            {shipment.status === 'DELIVERED' ? <CheckCircle2 size={18} /> : <Package size={18} />}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start mb-0.5">
                <p className="text-xs font-black text-slate-900 truncate">#{shipment.trackingNumber}</p>
                <Badge variant="outline" className={`text-[8px] font-black uppercase px-2 py-0 border-0 ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    shipment.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                        'bg-indigo-100 text-indigo-700'
                    }`}>
                    {shipment.status.replace(/_/g, ' ')}
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order {shipment.orderId.slice(-6)}</p>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <Calendar size={10} className="text-slate-300" />
                    {shipment.assignedAt ? format(new Date(shipment.assignedAt), 'MMM dd') : 'No date'}
                </div>
            </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
    </div>
)

export const LoadingList = () => (
    <div className="space-y-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
        ))}
    </div>
)

export const EmptyState = ({ message }: { message: string }) => (
    <div className="py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
        <Package className="w-8 h-8 text-slate-200" />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
)
