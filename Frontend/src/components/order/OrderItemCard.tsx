// components/order/OrderItemCard.tsx
"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

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
}

function getAttr(attributes: Attribute[] = [], name: string) {
    return attributes.find((a) => a.name === name)?.value ?? null
}

export function OrderItemCard({ item, isLast }: Props) {
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
                        {item.status && (
                            <div className="shrink-0 flex flex-col items-end gap-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${item.status === 'cancelled' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                    {item.status}
                                </span>
                                {item.status === 'cancelled' && item.cancelReason && (
                                    <span className="text-[8px] text-rose-400 font-medium max-w-[100px] text-right leading-none italic">
                                        "{item.cancelReason}"
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Net Volume badge */}
                    {netVolume && (
                        <div className="mt-2">
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold">
                                {netVolume}
                            </Badge>
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