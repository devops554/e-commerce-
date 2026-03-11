// components/order/OrderStatusCard.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
    CheckCircle2, Clock, Truck, XCircle, ShoppingBag, BadgeCheck, Package, AlertCircle, RotateCcw
} from 'lucide-react'

export type StatusKey =
    | 'PENDING' | 'CREATED' | 'PAID' | 'CONFIRMED' | 'PACKED'
    | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    | 'FAILED' | 'CANCELLED' | 'RETURNED'
    | 'FAILED_DELIVERY' | 'PENDING_REASSIGNMENT'

export const ORDER_STATUS_CONFIG: Record<StatusKey, {
    label: string
    icon: React.ReactElement
    hex: string
    tint: string
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
}> = {
    CREATED: { label: 'Order Placed', icon: <ShoppingBag className="w-4 h-4" />, hex: '#64748b', tint: '#f1f5f9', badgeVariant: 'secondary' },
    PAID: { label: 'Paid', icon: <BadgeCheck className="w-4 h-4" />, hex: '#64748b', tint: '#f1f5f9', badgeVariant: 'secondary' },
    PENDING: { label: 'Pending', icon: <Clock className="w-4 h-4" />, hex: '#f59e0b', tint: '#fffbeb', badgeVariant: 'outline' },
    CONFIRMED: { label: 'Confirmed', icon: <BadgeCheck className="w-4 h-4" />, hex: '#3b82f6', tint: '#eff6ff', badgeVariant: 'default' },
    PACKED: { label: 'Packed', icon: <Package className="w-4 h-4" />, hex: '#6366f1', tint: '#eef2ff', badgeVariant: 'default' },
    SHIPPED: { label: 'Shipped', icon: <Truck className="w-4 h-4" />, hex: '#8b5cf6', tint: '#f5f3ff', badgeVariant: 'default' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: <Truck className="w-4 h-4" />, hex: '#0ea5e9', tint: '#f0f9ff', badgeVariant: 'default' },
    DELIVERED: { label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" />, hex: '#10b981', tint: '#ecfdf5', badgeVariant: 'default' },
    FAILED: { label: 'Failed', icon: <XCircle className="w-4 h-4" />, hex: '#ef4444', tint: '#fef2f2', badgeVariant: 'destructive' },
    FAILED_DELIVERY: { label: 'Delivery Failed', icon: <XCircle className="w-4 h-4" />, hex: '#f97316', tint: '#fff7ed', badgeVariant: 'destructive' },
    CANCELLED: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, hex: '#94a3b8', tint: '#f8fafc', badgeVariant: 'secondary' },
    RETURNED: { label: 'Returned', icon: <RotateCcw className="w-4 h-4" />, hex: '#f59e0b', tint: '#fffbeb', badgeVariant: 'outline' },
    PENDING_REASSIGNMENT: { label: 'Reassignment Req.', icon: <AlertCircle className="w-4 h-4" />, hex: '#f59e0b', tint: '#fffbeb', badgeVariant: 'outline' },
}

const TIMELINE_STEPS: { key: StatusKey; label: string; icon: React.ReactElement }[] = [
    { key: 'PENDING', label: 'Placed', icon: <ShoppingBag className="w-3 h-3" /> },
    { key: 'CONFIRMED', label: 'Confirmed', icon: <BadgeCheck className="w-3 h-3" /> },
    { key: 'PACKED', label: 'Packed', icon: <Package className="w-3 h-3" /> },
    { key: 'SHIPPED', label: 'Shipped', icon: <Truck className="w-3 h-3" /> },
    { key: 'OUT_FOR_DELIVERY', label: 'In Transit', icon: <Truck className="w-3 h-3" /> },
    { key: 'DELIVERED', label: 'Delivered', icon: <CheckCircle2 className="w-3 h-3" /> },
]

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
    orderStatus: string
    totalAmount: number
    createdAt: string
    orderId: string
    cancelReason?: string
    cancelAt?: string
    cancelBy?: string
}

export function OrderStatusCard({ orderStatus, totalAmount, createdAt, orderId, cancelReason, cancelAt, cancelBy }: Props) {
    const normStatus = orderStatus?.toUpperCase() as StatusKey
    const cfg = ORDER_STATUS_CONFIG[normStatus] ?? ORDER_STATUS_CONFIG.PENDING

    const effectiveStatus =
        normStatus === 'CREATED' || normStatus === 'PAID' ? 'PENDING' : normStatus

    const rawIndex = TIMELINE_STEPS.findIndex((s) => s.key === effectiveStatus)
    const stepIndex = rawIndex === -1 ? 0 : rawIndex
    const isAbnormal = ['FAILED', 'CANCELLED', 'RETURNED', 'FAILED_DELIVERY'].includes(normStatus)

    const hex = cfg.hex
    const tint = cfg.tint

    return (
        <Card className="overflow-hidden border border-slate-100 shadow-sm w-full">
            {/* Gradient top accent */}
            <div style={{ background: `linear-gradient(90deg, ${hex}, ${hex}bb)`, height: '4px', width: '100%' }} />

            <CardContent className="pt-4 pb-5 px-4 sm:pt-5 sm:pb-6 sm:px-6">

                {/* ── Top row: Badge + Total ── */}
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="space-y-1.5 min-w-0">
                        {/* Status badge pill */}
                        <span
                            style={{ backgroundColor: tint, color: hex }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                        >
                            {React.cloneElement(cfg.icon, {
                                style: { color: hex },
                                className: 'w-3.5 h-3.5 shrink-0'
                            } as any)}
                            {cfg.label}
                        </span>
                        {/* Date + time */}
                        <p className="text-xs text-slate-400 font-medium">
                            {fmtDate(createdAt)} &bull; {fmtTime(createdAt)}
                        </p>
                        {/* Order ID — truncated on small screens */}
                        <p className="text-[10px] text-slate-300 font-mono tracking-wide truncate max-w-[200px] sm:max-w-none">
                            {orderId}
                        </p>
                    </div>

                    {/* Total — always right-aligned */}
                    <div className="text-right shrink-0 ml-auto">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Total</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                            &#8377;{totalAmount?.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* ── Cancellation / failure banner ── */}
                {isAbnormal && cancelReason && (
                    <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 min-w-0">
                            <p className="text-xs font-black text-rose-800 uppercase tracking-widest flex flex-wrap items-center gap-1.5">
                                {normStatus === 'CANCELLED' ? 'Cancellation Details' : 'Issue Details'}
                                {['admin', 'subadmin', 'seller', 'manager'].includes((cancelBy ?? '').toLowerCase()) && (
                                    <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black leading-none whitespace-nowrap">
                                        BY {cancelBy?.toUpperCase()}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-rose-700 leading-snug break-words">{cancelReason}</p>
                            {cancelAt && (
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                                    On {fmtDate(cancelAt)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Timeline ── */}
                {!isAbnormal && (
                    <div className="mt-6 sm:mt-8">

                        {/* On MOBILE (< sm): vertical stepper */}
                        <div className="flex flex-col gap-0 sm:hidden">
                            {TIMELINE_STEPS.map((step, i) => {
                                const done = i <= stepIndex
                                const current = i === stepIndex
                                const isLast = i === TIMELINE_STEPS.length - 1

                                return (
                                    <div key={step.key} className="flex items-stretch gap-3">
                                        {/* Left: circle + vertical line */}
                                        <div className="flex flex-col items-center" style={{ width: 28 }}>
                                            {/* Circle */}
                                            <div
                                                className="rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                                                style={{
                                                    width: 28, height: 28,
                                                    ...(done ? {
                                                        background: current ? `linear-gradient(135deg, ${hex}, ${hex}cc)` : hex,
                                                        borderColor: hex,
                                                        boxShadow: `0 2px 8px ${hex}44`,
                                                        color: '#fff',
                                                    } : {
                                                        backgroundColor: '#f1f5f9',
                                                        borderColor: '#cbd5e1',
                                                        color: '#94a3b8',
                                                    }),
                                                    transform: current ? 'scale(1.1)' : 'scale(1)',
                                                }}
                                            >
                                                {React.cloneElement(step.icon, { size: 12 } as any)}
                                            </div>
                                            {/* Vertical connector */}
                                            {!isLast && (
                                                <div
                                                    className="flex-1 w-0.5 my-0.5 rounded-full"
                                                    style={{
                                                        minHeight: 20,
                                                        backgroundColor: done && i < stepIndex ? hex : '#e2e8f0',
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Right: label */}
                                        <div className={`flex items-center ${isLast ? 'pb-0' : 'pb-3'}`}>
                                            <span
                                                style={current ? { color: hex } : {}}
                                                className={`text-[11px] font-black uppercase tracking-widest ${current ? '' : done ? 'text-slate-600' : 'text-slate-300'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                            {current && (
                                                <span
                                                    style={{ backgroundColor: tint, color: hex }}
                                                    className="ml-2 text-[9px] font-black px-2 py-0.5 rounded-full"
                                                >
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* On DESKTOP (>= sm): horizontal stepper */}
                        <div className="hidden sm:block px-1">
                            {/* Row 1: circles + connectors */}
                            <div className="flex items-center w-full">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const done = i <= stepIndex
                                    const current = i === stepIndex
                                    const connFill = i < stepIndex
                                    const isLast = i === TIMELINE_STEPS.length - 1

                                    return (
                                        <React.Fragment key={step.key}>
                                            {/* Circle */}
                                            <div className="relative shrink-0 flex items-center justify-center" style={{ width: 36, height: 36 }}>
                                                {current && (
                                                    <div
                                                        className="absolute inset-0 rounded-full"
                                                        style={{ backgroundColor: tint, transform: 'scale(1.7)', opacity: 0.7 }}
                                                    />
                                                )}
                                                <div
                                                    className="relative z-10 flex items-center justify-center rounded-full border-2 transition-all duration-300"
                                                    style={{
                                                        width: 36, height: 36,
                                                        ...(done ? {
                                                            background: current ? `linear-gradient(135deg, ${hex}, ${hex}cc)` : hex,
                                                            borderColor: hex,
                                                            boxShadow: `0 2px 10px ${hex}44`,
                                                            color: '#fff',
                                                        } : {
                                                            backgroundColor: '#f1f5f9',
                                                            borderColor: '#cbd5e1',
                                                            color: '#94a3b8',
                                                        }),
                                                        transform: current ? 'scale(1.12)' : 'scale(1)',
                                                    }}
                                                >
                                                    {React.cloneElement(step.icon, { size: 14 } as any)}
                                                </div>
                                            </div>

                                            {/* Connector */}
                                            {!isLast && (
                                                <div
                                                    className="flex-1 mx-1 relative overflow-hidden"
                                                    style={{ height: 4, borderRadius: 9999, backgroundColor: '#e2e8f0' }}
                                                >
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, bottom: 0,
                                                        borderRadius: 9999,
                                                        width: connFill ? '100%' : '0%',
                                                        background: `linear-gradient(90deg, ${hex}99, ${hex})`,
                                                        transition: 'width 0.4s ease',
                                                    }} />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </div>

                            {/* Row 2: labels */}
                            <div className="flex items-start mt-2.5">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const done = i <= stepIndex
                                    const current = i === stepIndex
                                    const isLast = i === TIMELINE_STEPS.length - 1

                                    return (
                                        <React.Fragment key={step.key}>
                                            <div style={{ width: 36, flexShrink: 0 }} className="flex justify-center">
                                                <span
                                                    style={current ? { color: hex } : {}}
                                                    className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight block ${current ? '' : done ? 'text-slate-600' : 'text-slate-300'
                                                        }`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                            {!isLast && <div className="flex-1 mx-1" />}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    )
}