// components/order/OrderItemCard.tsx
"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, ChevronDown, ChevronUp, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'

const STORAGE_ATTRS = ['Storage Instructions', 'Shelf Life']

interface Attribute { name: string; value: string }

interface OrderItem {
    _id?: string
    title: string
    price: number
    quantity: number
    status?: string
    cancelReason?: string
    variant?: {
        sku?: string
        price?: number
        discount?: number
        discountPrice?: number
        weightKg?: number
        dimensionsCm?: { length: number; width: number; height: number }
        attributes?: Attribute[]
        images?: { url: string }[]
    }
    product?: {
        images?: { url: string }[]
    }
}

interface Props {
    item: OrderItem
    isLast?: boolean
    action?: React.ReactNode
    returnStatus?: string
    returnRejectionReason?: string
    returnPolicy?: {
        isReturnable: boolean;
        windowValue: number;
        windowUnit: string;
    }
    returnRequest?: any
}

function getAttr(attributes: Attribute[] = [], name: string) {
    return attributes.find((a) => a.name === name)?.value ?? null
}

export function OrderItemCard({ item, isLast, action, returnStatus, returnRejectionReason, returnPolicy, returnRequest }: Props) {
    const [showAttrs, setShowAttrs] = useState(false)

    const variantImg = item.variant?.images?.[0]?.url
    const productImg = item.product?.images?.[0]?.url
    const imgSrc = variantImg || productImg
    const attrs = item.variant?.attributes ?? []
    const netVolume = getAttr(attrs, 'Net Volume')
    const originalPrice = item.variant?.price
    const discount = item.variant?.discount ?? 0

    const mainAttrs = attrs.filter((a) => !STORAGE_ATTRS.includes(a.name))
    const storageAttrs = attrs.filter((a) => STORAGE_ATTRS.includes(a.name))
    const hasAttrs = attrs.length > 0

    return (
        <div>
            <div className="flex gap-4">

                {/* ── Thumbnail ── */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-muted-foreground" />
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[9px] font-black px-1.5 py-0.5 rounded-md leading-tight">
                            -{discount}%
                        </div>
                    )}
                </div>

                {/* ── Info ── */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-black text-slate-900 line-clamp-2 md:line-clamp-1 mb-1 leading-tight">
                            {item.title}
                        </p>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                            {item.status && (
                                <>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${item.status === 'cancelled' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                        {item.status}
                                    </span>
                                    {item.status === 'cancelled' && item.cancelReason && (
                                        <span className="text-[8px] text-rose-400 font-medium max-w-[100px] text-right leading-none italic">
                                            "{item.cancelReason}"
                                        </span>
                                    )}
                                </>
                            )}
                            {returnStatus && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
                                        Return: {returnStatus.replace(/_/g, ' ')}
                                    </span>
                                    {returnStatus === 'REJECTED' && returnRejectionReason && (
                                        <span className="text-[8px] text-rose-500 font-medium max-w-[120px] text-right leading-tight italic bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                                            Reason: "{returnRejectionReason}"
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Return Policy Info */}
                    {returnPolicy && (
                        <div className="flex items-center gap-1.5 mt-1">
                            <RotateCcw className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-semibold text-slate-500">
                                {returnPolicy.isReturnable
                                    ? `${returnPolicy.windowValue} ${returnPolicy.windowUnit.toLowerCase()} return policy`
                                    : 'Non-returnable item'
                                }
                            </span>
                        </div>
                    )}
                    {/* Net Volume badge */}
                    {(netVolume || item.variant?.weightKg || item.variant?.dimensionsCm) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {netVolume && (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
                                    {netVolume}
                                </Badge>
                            )}
                            {(item.variant?.weightKg || item.variant?.dimensionsCm) && (
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold border-slate-200 text-slate-500 bg-slate-50/50">
                                    {item.variant?.weightKg ? `${item.variant.weightKg}kg` : ''}
                                    {item.variant?.weightKg && item.variant?.dimensionsCm ? ' · ' : ''}
                                    {item.variant?.dimensionsCm ? `${item.variant.dimensionsCm.length}x${item.variant.dimensionsCm.width}x${item.variant.dimensionsCm.height}cm` : ''}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* SKU */}
                    {item.variant?.sku && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-1.5">{item.variant.sku}</p>
                    )}

                    {/* Price + Qty row */}
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-foreground">
                                &#8377;{item.price?.toLocaleString('en-IN')}
                            </span>
                            {originalPrice && originalPrice !== item.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                    &#8377;{originalPrice?.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Qty: <span className="font-semibold text-foreground">{item.quantity}</span>
                        </span>
                    </div>

                    {/* Refund Details */}
                    {returnRequest?.status === 'REFUND_COMPLETED' && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3" />
                                Refund Successful
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Amount</p>
                                    <p className="text-sm font-black text-emerald-700">₹{returnRequest.refundAmount?.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Method</p>
                                    <p className="text-xs font-bold text-emerald-700 uppercase">{returnRequest.refundMethod?.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                            {returnRequest.refundTransactionId && (
                                <div className="pt-1 border-t border-emerald-100">
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Transaction ID</p>
                                    <p className="text-[10px] font-mono font-bold text-emerald-600 break-all">{returnRequest.refundTransactionId}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Picked Up status */}
                    {(returnRequest?.status === 'PICKED_UP' || returnRequest?.status === 'RECEIVED_AT_WAREHOUSE') && (
                        <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-xs font-bold text-blue-700 flex items-center gap-2">
                                <Package className="h-3.5 w-3.5" />
                                Item Picked Up
                            </p>
                            {returnRequest.pickedAt && (
                                <p className="text-[10px] font-medium text-blue-500 mt-0.5">
                                    on {new Date(returnRequest.pickedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Failed Pickup Status */}
                    {returnRequest?.status === 'FAILED_PICKUP' && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                            <p className="text-xs font-bold text-red-700 flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Pickup Failed
                            </p>
                            <p className="text-[10px] font-medium text-red-500 mt-0.5 uppercase tracking-widest">
                                Action Required: Reschedule or Review
                            </p>
                        </div>
                    )}

                    {/* Action button */}
                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>
            </div>

            {/* ── View Details toggle button ── */}
            {hasAttrs && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAttrs((v) => !v)}
                    className="mt-3 h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1.5 -ml-1"
                >
                    {showAttrs ? (
                        <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Details
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            View Details
                        </>
                    )}
                </Button>
            )}

            {/* ── Collapsible Variant Attributes Table ── */}
            {showAttrs && (
                <div className="mt-1 rounded-xl border bg-muted/40 overflow-hidden">

                    {/* Main attributes */}
                    {mainAttrs.length > 0 && (
                        <>
                            <div className="px-3 py-1.5 bg-muted/60 border-b">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Variant Details
                                </p>
                            </div>
                            <div className="divide-y divide-border">
                                {mainAttrs.map((attr) => (
                                    <div key={attr.name} className="flex items-center justify-between px-3 py-2 gap-4">
                                        <span className="text-xs text-muted-foreground shrink-0">{attr.name}</span>
                                        <span className="text-xs font-semibold text-foreground text-right">{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Storage & Shelf Life */}
                    {storageAttrs.length > 0 && (
                        <>
                            <div className="px-3 py-1.5 bg-muted/60 border-t border-b">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    Storage &amp; Shelf Life
                                </p>
                            </div>
                            <div className="divide-y divide-border">
                                {storageAttrs.map((attr) => (
                                    <div key={attr.name} className="flex items-start justify-between px-3 py-2 gap-4">
                                        <span className="text-xs text-muted-foreground shrink-0">{attr.name}</span>
                                        <span className="text-xs font-semibold text-foreground text-right">{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {!isLast && <Separator className="mt-4" />}
        </div>
    )
}