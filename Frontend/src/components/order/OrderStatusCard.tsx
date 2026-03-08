// components/order/OrderStatusCard.tsx
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    CheckCircle2, Clock, Truck, XCircle, ShoppingBag, BadgeCheck, Package
} from 'lucide-react'

export type StatusKey = 'created' | 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'failed' | 'cancelled'

export const ORDER_STATUS_CONFIG: Record<
    StatusKey,
    { label: string; icon: React.ReactNode; accent: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    created: { label: 'Order Placed', icon: <ShoppingBag className="w-4 h-4" />, accent: 'bg-slate-500', badgeVariant: 'secondary' },
    pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, accent: 'bg-amber-500', badgeVariant: 'outline' },
    confirmed: { label: 'Confirmed', icon: <BadgeCheck className="w-4 h-4" />, accent: 'bg-blue-500', badgeVariant: 'default' },
    packed: { label: 'Packed', icon: <Package className="w-4 h-4" />, accent: 'bg-indigo-500', badgeVariant: 'default' },
    shipped: { label: 'Shipped', icon: <Truck className="w-4 h-4" />, accent: 'bg-violet-500', badgeVariant: 'default' },
    delivered: { label: 'Delivered', icon: <CheckCircle2 className="w-4 h-4" />, accent: 'bg-emerald-500', badgeVariant: 'default' },
    failed: { label: 'Failed', icon: <XCircle className="w-4 h-4" />, accent: 'bg-destructive', badgeVariant: 'destructive' },
    cancelled: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, accent: 'bg-muted', badgeVariant: 'secondary' },
}

const TIMELINE_STEPS: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'Placed', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'confirmed', label: 'Confirmed', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
    { key: 'packed', label: 'Packed', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'shipped', label: 'Shipped', icon: <Truck className="w-3.5 h-3.5" /> },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
]

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
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
    const cfg = ORDER_STATUS_CONFIG[orderStatus as StatusKey] ?? ORDER_STATUS_CONFIG.pending

    // Map created (for paid orders) to pending so the "Placed" step is highlighted
    const effectiveStatus = orderStatus === 'created' ? 'pending' : orderStatus
    const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === effectiveStatus)
    const isAbnormal = ['failed', 'cancelled'].includes(orderStatus)

    return (
        <Card className="overflow-hidden border-0 shadow-md">
            <div className={`h-1.5 w-full ${cfg.accent}`} />
            <CardContent className="pt-5 pb-5 px-5">
                {/* status + total */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <Badge variant={cfg.badgeVariant} className="gap-1.5 text-xs px-2.5 py-1">
                            {cfg.icon}
                            {cfg.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                            {fmtDate(createdAt)} &bull; {fmtTime(createdAt)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">{orderId}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Total</p>
                        <p className="text-2xl font-black text-foreground">
                            &#8377;{totalAmount?.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* Cancellation Info */}
                {orderStatus === 'cancelled' && cancelReason && (
                    <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-black text-rose-900 uppercase tracking-widest flex items-center gap-1.5">
                                Cancellation Details
                                {(cancelBy === 'admin' || cancelBy === 'subadmin' || cancelBy === 'seller') && (
                                    <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black leading-none">
                                        BY {cancelBy?.toUpperCase()}
                                    </span>
                                )}
                            </p>
                            <p className="text-sm font-medium text-rose-700 leading-snug">
                                {cancelReason}
                            </p>
                            {cancelAt && (
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                                    Cancelled on {fmtDate(cancelAt)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* timeline */}
                {!isAbnormal && (
                    <div className="mt-5 flex items-center">
                        {TIMELINE_STEPS.map((step, i) => {
                            const done = i <= stepIndex
                            const current = i === stepIndex
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                      ${done ? `${cfg.accent} border-transparent text-white` : 'bg-muted border-border text-muted-foreground'}
                      ${current ? 'ring-2 ring-offset-1 ring-offset-background ring-primary/30' : ''}`}
                                        >
                                            {step.icon}
                                        </div>
                                        <span className={`text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap
                      ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {i < TIMELINE_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full transition-colors
                      ${i < stepIndex ? cfg.accent : 'bg-border'}`} />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}