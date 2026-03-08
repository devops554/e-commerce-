"use client"

import React, { useEffect } from 'react'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { useStockHistory } from '@/hooks/useInventory'
import {
    History,
    ArrowUpCircle,
    ArrowDownCircle,
    Truck,
    Box,
    ArrowRightLeft,
    Clock,
    User,
    FileText,
    Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const StockHistoryPage = () => {
    const { setBreadcrumbs } = useBreadcrumb()
    const { data: warehouse, isLoading: isWhLoading } = useManagerWarehouse()
    const { data: history, isLoading: isHistoryLoading } = useStockHistory(warehouse?._id || '')

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Manager Dashboard', href: '/manager' },
            { label: 'Stock History' }
        ])
    }, [setBreadcrumbs])

    const getActionConfig = (type: string, amount: number) => {
        switch (type) {
            case 'ADJUSTMENT':
                return {
                    icon: amount > 0 ? ArrowUpCircle : ArrowDownCircle,
                    color: amount > 0 ? 'text-emerald-500' : 'text-rose-500',
                    bgColor: amount > 0 ? 'bg-emerald-50' : 'bg-rose-50',
                    label: amount > 0 ? 'Stock Added' : 'Stock Reduced'
                }
            case 'TRANSFER_IN':
                return {
                    icon: ArrowRightLeft,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50',
                    label: 'Transfer In'
                }
            case 'TRANSFER_OUT':
                return {
                    icon: ArrowRightLeft,
                    color: 'text-amber-500',
                    bgColor: 'bg-amber-50',
                    label: 'Transfer Out'
                }
            case 'DISPATCH':
                return {
                    icon: Truck,
                    color: 'text-indigo-500',
                    bgColor: 'bg-indigo-50',
                    label: 'Dispatched'
                }
            case 'RESERVATION':
                return {
                    icon: Clock,
                    color: 'text-slate-500',
                    bgColor: 'bg-slate-50',
                    label: 'Reserved'
                }
            case 'RELEASE':
                return {
                    icon: Box,
                    color: 'text-sky-500',
                    bgColor: 'bg-sky-50',
                    label: 'Released'
                }
            default:
                return {
                    icon: History,
                    color: 'text-slate-500',
                    bgColor: 'bg-slate-50',
                    label: type
                }
        }
    }

    if (isWhLoading || isHistoryLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-[100px] w-full rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock History</h1>
                    <p className="text-slate-500 font-bold mt-1">Audit trail for <span className="text-slate-900">{warehouse?.name}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {history?.map((log, idx) => {
                    const config = getActionConfig(log.type, log.amount)
                    const Icon = config.icon

                    return (
                        <div key={log._id} className="group relative">
                            {/* Connector Line */}
                            {idx !== history.length - 1 && (
                                <div className="absolute left-[26px] top-14 bottom-[-16px] w-0.5 bg-slate-100" />
                            )}

                            <Card className="border-none shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all rounded-3xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        {/* Status Icon */}
                                        <div className={cn("h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", config.bgColor)}>
                                            <Icon className={cn("h-7 w-7", config.color)} />
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn("px-2.5 py-0.5 rounded-lg font-black border-none ring-1 ring-inset tracking-tight uppercase text-[10px]",
                                                    config.bgColor, config.color)}>
                                                    {config.label}
                                                </Badge>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">•</span>
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(log.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                                <h3 className="text-base font-black text-slate-900 truncate">
                                                    {log.product?.title || 'Unknown Product'}
                                                </h3>
                                                <Badge variant="outline" className="w-fit bg-slate-50 text-slate-500 border-slate-100 font-black text-[10px] px-2 py-0 rounded-md">
                                                    {log.variant?.sku}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                                                    <User className="h-3 w-3" />
                                                    Manual Action
                                                </div>
                                                {log.source && (
                                                    <>
                                                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">•</span>
                                                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                                                            {log.source}
                                                        </span>
                                                    </>
                                                )}
                                                {log.notes && (
                                                    <>
                                                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">•</span>
                                                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px] max-w-full sm:max-w-xs truncate" title={log.notes}>
                                                            <FileText className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{log.notes}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Change Value */}
                                        <div className="md:text-right px-4 py-3 bg-slate-50/50 rounded-2xl min-w-[100px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Quantity</p>
                                            <p className={cn("text-xl font-black tabular-nums", log.amount >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                                {log.amount > 0 ? '+' : ''}{log.amount}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}

                {(!history || history.length === 0) && (
                    <div className="bg-white rounded-[40px] p-24 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8 animate-pulse">
                            <History className="h-12 w-12 text-slate-200" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">No History Found</h2>
                        <p className="text-slate-400 font-bold mt-3 max-w-sm leading-relaxed">
                            Once stock movements occur in your warehouse, a detailed audit trail will appear here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StockHistoryPage
