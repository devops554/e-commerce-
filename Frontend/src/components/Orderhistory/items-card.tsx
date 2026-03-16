/* ─────────────────────────────────────────────────────────────────
   items-card.tsx  —  OrderItemsCard (product list + totals)
───────────────────────────────────────────────────────────────── */
import React from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/orderhistory'
import { getStatus } from '@/types/orderhistory'
import { OhdCard, SectionLabel, CardTitle, Divider } from './primitives'

interface OrderItemsCardProps {
    order: Order
    className?: string
    animClass?: string
}

export function OrderItemsCard({ order, className, animClass }: OrderItemsCardProps) {
    return (
        <OhdCard className={cn(animClass, className)}>
            <SectionLabel>Items</SectionLabel>
            <CardTitle icon={<Package className="h-4 w-4 text-violet-500" />}>
                Product Snapshots
            </CardTitle>

            <div className="space-y-2.5">
                {order.items?.map((item, i) => {
                    const st = getStatus(item.status)
                    return (
                        <div
                            key={i}
                            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                        >
                            {/* thumbnail + info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-slate-100 flex-shrink-0 shadow-sm">
                                    <img
                                        src={item.product?.thumbnail?.url || 'https://placehold.co/56x56/f1f5f9/94a3b8?text=?'}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.title}</p>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className="text-[11px] font-medium text-slate-400">Qty {item.quantity}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300 inline-block" />
                                        <span className="text-[11px] font-semibold text-slate-600">₹{item.price?.toLocaleString()}</span>
                                        {item.warehouse?.name && (
                                            <>
                                                <span className="h-1 w-1 rounded-full bg-slate-300 inline-block" />
                                                <span className="text-[10px] font-medium text-indigo-400">{item.warehouse.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* price + status */}
                            <div className="text-right flex-shrink-0 pl-2">
                                <p className="text-sm font-bold text-slate-900">₹{(item.lineTotal || 0).toLocaleString()}</p>
                                <span className={cn(
                                    'inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                                    st.bg, st.pill, st.border
                                )}>
                                    {item.status || 'archived'}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Totals ── */}
            <Divider className="mt-5" />
            <div className="space-y-2.5 max-w-[280px] ml-auto">
                <TotalRow label="Subtotal" value={`₹${order.subTotal?.toLocaleString() ?? '—'}`} />
                <TotalRow label="GST (Tax)" value={`₹${order.totalGstAmount?.toLocaleString() ?? '—'}`} />
                <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                    <span className="ohd-display text-base font-bold text-slate-900">Total</span>
                    <span className="ohd-display text-xl font-bold text-blue-600">₹{order.totalAmount?.toLocaleString() ?? '—'}</span>
                </div>
            </div>
        </OhdCard>
    )
}

function TotalRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-medium">{label}</span>
            <span className="text-sm font-semibold text-slate-700">{value}</span>
        </div>
    )
}