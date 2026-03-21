"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useMyReturns } from '@/hooks/useReturns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    RotateCcw, 
    ChevronRight, 
    Package, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    XCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react'
import { badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function MyReturnsPage() {
    const router = useRouter()
    const { data: returns, isLoading } = useMyReturns()

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4 text-amber-500" />
            case 'APPROVED': return <CheckCircle2 className="h-4 w-4 text-blue-500" />
            case 'PICKUP_SCHEDULED': return <Package className="h-4 w-4 text-purple-500" />
            case 'PICKED_UP': return <Package className="h-4 w-4 text-indigo-500" />
            case 'RECEIVED_AT_WAREHOUSE': return <Package className="h-4 w-4 text-indigo-500" />
            case 'QC_PASSED': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'QC_FAILED': return <XCircle className="h-4 w-4 text-rose-500" />
            case 'REFUND_INITIATED': return <Clock className="h-4 w-4 text-blue-500" />
            case 'REFUND_COMPLETED': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'REJECTED': return <XCircle className="h-4 w-4 text-rose-500" />
            case 'CLOSED': return <AlertCircle className="h-4 w-4 text-slate-500" />
            default: return <AlertCircle className="h-4 w-4 text-slate-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'APPROVED': return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'PICKUP_SCHEDULED': return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'PICKED_UP': 
            case 'RECEIVED_AT_WAREHOUSE': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
            case 'QC_PASSED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'QC_FAILED': return 'bg-rose-50 text-rose-700 border-rose-200'
            case 'REFUND_INITIATED': return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'REFUND_COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200'
            case 'CLOSED': return 'bg-slate-50 text-slate-700 border-slate-200'
            default: return 'bg-slate-50 text-slate-700 border-slate-200'
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Fetching your returns...</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="link" 
                        size="icon" 
                        className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-900 -ml-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <RotateCcw className="h-8 w-8 text-blue-600" />
                        My Returns
                    </h1>
                </div>
                <p className="text-slate-500 font-medium ml-9">Manage your return requests and track refunds.</p>
            </div>

            {/* List */}
            {returns?.data?.length === 0 ? (
                <div className="bg-white rounded-[32px] p-12 text-center space-y-6 shadow-2xl shadow-slate-200/50 border border-slate-50">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <RotateCcw className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-900">No Return Requests</h2>
                        <p className="text-slate-500 font-medium">You haven't requested any returns yet.</p>
                    </div>
                    <Button 
                        onClick={() => router.push('/my-orders')}
                        className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black font-bold"
                    >
                        View Orders
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {returns?.data?.map((req: any) => (
                        <Card 
                            key={req._id}
                            className="group border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white hover:ring-4 hover:ring-blue-50 transition-all duration-300 cursor-pointer"
                            onClick={() => router.push(`/profile/returns/${req._id}`)}
                        >
                            <CardContent className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                        <img 
                                            src={req.productId?.images?.[0]?.url || req.productId?.thumbnail || '/placeholder.png'} 
                                            alt={req.productId?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {req.productId?.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                    Return ID: #{req._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                                                getStatusColor(req.status)
                                            )}>
                                                {getStatusIcon(req.status)}
                                                {req.status?.replace(/_/g, ' ')}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Requested on</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <RotateCcw className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Refund Method</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {req.refundMethod?.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                            {req.refundAmount && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Refund Amount</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-emerald-600">
                                                        ₹{req.refundAmount.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 flex items-center justify-between">
                                            <div className="text-[11px] font-medium text-slate-400 italic">
                                                {req.reason?.replace(/_/g, ' ')}
                                            </div>
                                            <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:gap-2 transition-all">
                                                View Details
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
