"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useReturnById, useCancelReturn } from '@/hooks/useReturns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    RotateCcw,
    ArrowLeft,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Calendar,
    ChevronRight,
    MapPin,
    CreditCard,
    Building2,
    Hash,
    User as UserIcon,
    Camera,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default function ReturnDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: req, isLoading } = useReturnById(id)
    const { mutate: cancelReturn, isPending: isCancelling } = useCancelReturn()

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading return details...</p>
            </div>
        )
    }

    if (!req) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-4">
                <XCircle className="h-12 w-12 text-rose-500 mx-auto" />
                <h1 className="text-2xl font-bold text-slate-900">Return Not Found</h1>
                <p className="text-slate-500">The return request you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/profile/returns')}>Back to Returns</Button>
            </div>
        )
    }

    const steps = [
        { label: 'Requested', status: 'PENDING', date: req.createdAt, icon: Clock },
        { label: 'Approved', status: 'APPROVED', date: req.approvedAt, icon: CheckCircle2 },
        { label: 'Pickup Scheduled', status: 'PICKUP_SCHEDULED', date: req.assignedAt, icon: Truck },
        { label: 'Picked Up', status: 'PICKED_UP', date: req.pickedAt, icon: Package },
        { label: 'Received', status: 'RECEIVED_AT_WAREHOUSE', date: req.warehouseReceivedAt, icon: Building2 },
        { label: 'QC Passed', status: 'QC_PASSED', date: req.qcCompletedAt, icon: CheckCircle2 },
        { label: 'Refund Initiated', status: 'REFUND_INITIATED', date: req.refundInitiatedAt, icon: CreditCard },
        { label: 'Completed', status: 'REFUND_COMPLETED', date: req.refundCompletedAt, icon: CheckCircle2 },
    ]

    const currentStepIndex = steps.findIndex(s => s.status === req.status)
    const displaySteps = steps.filter(s => s.date || s.status === 'PENDING')

    if (req.status === 'REJECTED') {
        displaySteps.push({ label: 'Rejected', status: 'REJECTED', date: req.rejectedAt, icon: XCircle })
    } else if (req.status === 'CLOSED') {
        displaySteps.push({ label: 'Closed/Cancelled', status: 'CLOSED', date: req.updatedAt, icon: XCircle })
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="link"
                    size="icon"
                    className="rounded-full h-10 w-10 text-slate-400 hover:text-slate-900 -ml-3"
                    onClick={() => router.push('/profile/returns')}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Return Details</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">#{req._id.toUpperCase()}</p>
                </div>
            </div>

            {/* Status Card */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Current Status</p>
                            <p className="text-xl font-black text-blue-600 uppercase tracking-tight">{req.status?.replace(/_/g, ' ')}</p>
                        </div>
                        {req.status === 'PENDING' && (
                            <Button
                                variant="outline"
                                className="rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
                                onClick={() => cancelReturn(req._id)}
                                disabled={isCancelling}
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Return'}
                            </Button>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="relative space-y-6">
                        {displaySteps.map((step, idx) => {
                            const Icon = step.icon
                            const isLast = idx === displaySteps.length - 1
                            const isActive = step.date
                            return (
                                <div key={step.label} className="flex gap-4 relative">
                                    {!isLast && (
                                        <div className={cn(
                                            "absolute left-[15px] top-8 bottom-0 w-0.5",
                                            isActive ? "bg-blue-600" : "bg-slate-100"
                                        )} />
                                    )}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                                        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="pt-0.5 pb-4">
                                        <p className={cn("text-sm font-black uppercase tracking-tight", isActive ? "text-slate-900" : "text-slate-400")}>
                                            {step.label}
                                        </p>
                                        {step.date && (
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(step.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* OTP Section (If Pending Pickup) */}
            {req.status === 'PICKUP_OTP_PENDING' && (
                <Card className="border-none bg-blue-600 text-white shadow-2xl shadow-blue-200 rounded-[32px] overflow-hidden">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Pickup Verification OTP</p>
                            <p className="text-4xl font-black tracking-[0.2em]">{req.customerOtp}</p>
                        </div>
                        <p className="text-sm font-medium opacity-90 max-w-[280px] mx-auto">
                            Share this OTP with the delivery partner once they verify the items at your doorstep.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Detail */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] bg-white">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Item Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                            {req.productId?.images?.map((image: any) => (
                                <img
                                    key={image.url}
                                    src={image.url}
                                    alt={req.productId?.title}
                                    className="w-full h-full object-cover"
                                />
                            ))}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 line-clamp-2">{req.productId?.title}</h4>
                            <p className="text-xs text-slate-500 font-bold">Qty: {req.quantity}</p>
                            {req.variantId?.attributes?.map((attr: any) => (
                                <span key={attr.name} className="inline-block mr-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {attr.name}: <span className="text-slate-600">{attr.value}</span>
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Refund Summary */}
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] bg-white">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Refund Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-500 uppercase tracking-tighter text-xs">Method</span>
                            <span className="font-black text-slate-900">{req.refundMethod?.replace(/_/g, ' ')}</span>
                        </div>
                        {req.refundAmount && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-tighter text-xs">Amount</span>
                                <span className="font-black text-emerald-600 text-lg">₹{req.refundAmount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {req.refundTransactionId && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500 uppercase tracking-tighter text-xs">Trans ID</span>
                                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{req.refundTransactionId}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bank Details (If applicable) */}
            {req.refundMethod === 'BANK_TRANSFER' && req.bankDetails && (
                <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] bg-white">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Refund Destination
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <UserIcon className="h-3 w-3" /> Holder
                            </p>
                            <p className="text-sm font-black text-slate-700">{req.bankDetails.accountHolderName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> Bank
                            </p>
                            <p className="text-sm font-black text-slate-700">{req.bankDetails.bankName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Account
                            </p>
                            <p className="text-sm font-black text-slate-700">•••• {req.bankDetails.accountNumber.slice(-4)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <RotateCcw className="h-3 w-3" /> IFSC
                            </p>
                            <p className="text-sm font-black text-slate-700">{req.bankDetails.ifscCode}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Evidence & Notes */}
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] bg-white">
                <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> Request Info
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</p>
                        <p className="text-sm font-medium text-slate-700">{req.reason?.replace(/_/g, ' ')}</p>
                        {req.reasonDescription && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl italic">"{req.reasonDescription}"</p>
                        )}
                    </div>

                    {req.evidenceMedia && req.evidenceMedia.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Camera className="h-3 w-3" /> Evidence Photos
                            </p>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {req.evidenceMedia.map((media, idx) => (
                                    <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 hover:ring-2 hover:ring-blue-500 transition-all cursor-zoom-in">
                                        <img src={media.url} className="w-full h-full object-cover" alt="evidence" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
