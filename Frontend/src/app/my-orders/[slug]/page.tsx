"use client";

import { useOrderById } from '@/hooks/useOrders'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react'

import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { OrderMetaCard } from '@/components/order/OrderMetaCard'
import { useReviews as useReviewQuery, useReviewActions } from '@/hooks/useReviews'
import ReviewForm from '@/components/product/ReviewForm'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { OrderShippingCard } from '@/components/order/OrderShippingCard'
import { ReturnPolicyDrawer } from '@/components/product/detail/Returnpolicydrawer'
import { OrderPaymentCard } from '@/components/order/OrderPaymentCard'
import { useState } from 'react'
import { useReturns } from '@/hooks/useReturns'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Checks if the order status means the item has been delivered.
 * Handles both "DELIVERED" and "delivered" from the API.
 */
const isOrderDelivered = (status: string): boolean =>
    status?.toUpperCase() === 'DELIVERED'

/**
 * Return window check — is today within the return window?
 * Uses the order's updatedAt as a proxy for delivery date
 * (or createdAt as fallback).
 */
const isWithinReturnWindow = (
    deliveredAtStr: string,
    windowValue: number,
    windowUnit: 'DAYS' | 'HOURS',
): boolean => {
    if (!deliveredAtStr || windowValue <= 0) return false
    const deliveredAt = new Date(deliveredAtStr).getTime()
    const now = Date.now()
    const windowMs =
        windowUnit === 'HOURS'
            ? windowValue * 60 * 60 * 1000
            : windowValue * 24 * 60 * 60 * 1000
    return now - deliveredAt <= windowMs
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.slug as string

    const { data: order, isLoading, error } = useOrderById(orderId)
    const { data: reviewsData } = useReviewQuery({ orderId })
    const { createReview } = useReviewActions()
    const { data: returnsData } = useReturns({ orderId: order?._id })

    const [reviewingItem, setReviewingItem] = useState<{
        productId: string
        productTitle: string
        productImage?: string
    } | null>(null)

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-40 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading order…</p>
            </div>
        )
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !order) {
        return (
            <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center py-40 gap-3">
                <AlertCircle className="w-10 h-10 text-destructive/60" />
                <p className="text-sm font-medium text-destructive">Could not load order details.</p>
                <Button variant="outline" size="sm" onClick={() => router.back()}>Go back</Button>
            </div>
        )
    }

    const delivered = isOrderDelivered(order.orderStatus)

    return (
        <div className="min-h-screen bg-muted/40">
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

                {/* ── Back + heading ── */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline" size="icon"
                        className="rounded-xl h-9 w-9 shrink-0"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold text-foreground">Order Details</h1>
                        <p className="text-xs text-muted-foreground font-mono truncate">{order.orderId}</p>
                    </div>
                </div>

                {/* ── 1. Status + Timeline ── */}
                <OrderStatusCard
                    orderStatus={order.orderStatus}
                    totalAmount={order.totalAmount}
                    createdAt={order.createdAt}
                    orderId={order.orderId}
                    cancelReason={order.cancelReason}
                    cancelAt={order.cancelAt}
                    cancelBy={order.cancelBy}
                />

                {/* ── 2. Items Ordered ── */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3 px-5 pt-5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            Items Ordered
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 space-y-4">
                        {order.items.map((item: any, i: number) => {
                            // ── Review state ────────────────────────────────
                            const hasReviewed = reviewsData?.data?.some(
                                (r: any) => r.productId?._id === (item.productId?._id || item.productId)
                            )

                            // ── Return eligibility ──────────────────────────
                            // Resolution order:
                            //   1. ProductVariant.returnPolicyOverride (if overrideEnabled)
                            //   2. Product.returnPolicy
                            const variantOverride = item.variant?.returnPolicyOverride
                            const effectivePolicy =
                                variantOverride?.overrideEnabled
                                    ? { ...item.product?.returnPolicy, ...variantOverride }
                                    : item.product?.returnPolicy

                            // Find an existing return request for this item
                            const itemReturn = returnsData?.data?.find(
                                (r: any) => r.orderItemId === item._id
                            )

                            // ── Gate: all conditions must pass ──────────────
                            const policyAllows = effectivePolicy?.isReturnable === true
                            const notYetReturned = !itemReturn                         // no active return
                            const withinWindow = delivered && effectivePolicy
                                ? isWithinReturnWindow(
                                    order.updatedAt,                // closest proxy to delivery date
                                    effectivePolicy.windowValue,
                                    effectivePolicy.windowUnit,
                                )
                                : false

                            const canReturn = delivered && policyAllows && notYetReturned && withinWindow

                            return (
                                <div key={item._id ?? i} className="group relative">
                                    <OrderItemCard
                                        item={item}
                                        isLast={i === order.items.length - 1}
                                        returnStatus={itemReturn?.status}
                                        returnRejectionReason={itemReturn?.rejectionReason}
                                        returnPolicy={effectivePolicy}
                                        returnRequest={itemReturn}
                                        action={
                                            <div className="flex flex-wrap gap-2">
                                                {/* Rate button — only after delivery, only if not reviewed */}
                                                {delivered && !hasReviewed && (
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 h-8 text-[10px] uppercase tracking-wider"
                                                        onClick={() => setReviewingItem({
                                                            productId: item.productId?._id || item.productId,
                                                            productTitle: item.title,
                                                            productImage: item.image || item.thumbnail,
                                                        })}
                                                    >
                                                        Rate Item
                                                    </Button>
                                                )}

                                                {/* Return button — gated by all conditions above */}
                                                {canReturn && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-xl font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 h-8 text-[10px] uppercase tracking-wider"
                                                        onClick={() =>
                                                            router.push(
                                                                `/profile/returns/new?orderId=${order._id}&orderItemId=${item._id}`
                                                            )
                                                        }
                                                    >
                                                        Return Item
                                                    </Button>
                                                )}

                                                {/* Return in progress badge */}
                                                {itemReturn && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                                                        Return · {itemReturn.status}
                                                    </span>
                                                )}

                                                {/* Window expired notice */}
                                                {delivered && policyAllows && !itemReturn && !withinWindow && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                                        Return window expired
                                                    </span>
                                                )}
                                            </div>
                                        }
                                    />

                                    {hasReviewed && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-100">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span className="text-[10px] font-bold uppercase">Reviewed</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* ── Bill summary ── */}
                        <Separator />
                        <div className="space-y-2 pt-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal (Taxable Value)</span>
                                <span>
                                    &#8377;{((order.totalAmount || 0) - (order.totalGstAmount || 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>GST Amount</span>
                                <span>&#8377;{order.totalGstAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Delivery</span>
                                <span className="text-emerald-600 font-semibold">Free</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-black text-foreground">
                                <div className="flex flex-col">
                                    <span>Total Paid</span>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                        Inclusive of GST
                                    </span>
                                </div>
                                <span>&#8377;{order.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── 2.5 Tax Details ── */}
                {order.items.some((i: any) => i.gstRate) && (
                    <Card className="shadow-sm border-emerald-100 bg-emerald-50/20">
                        <CardHeader className="pb-2 px-5 pt-4">
                            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Tax Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            <div className="space-y-2">
                                {order.items.map((item: any, i: number) =>
                                    item.gstRate ? (
                                        <div key={i} className="flex justify-between items-center text-[12px]">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{item.title}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    GST @{item.gstRate}% on &#8377;{item.lineTaxableValue?.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <span className="font-bold text-slate-900">
                                                &#8377;{item.lineTotalGst?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    ) : null
                                )}
                                <Separator className="bg-emerald-100" />
                                <div className="flex justify-between items-center text-[12px] pt-1">
                                    <span className="font-black text-emerald-900">Total GST Paid</span>
                                    <span className="font-black text-emerald-900">
                                        &#8377;{order.totalGstAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── 3. Return Policy ── */}
                {order.items.some((i: any) => i.product?.returnPolicy) && (
                    <div className="space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">
                            Return Policy
                        </p>
                        {order.items.map((item: any, i: number) => {
                            const policy = item.variant?.returnPolicyOverride?.overrideEnabled
                                ? { ...item.product?.returnPolicy, ...item.variant.returnPolicyOverride }
                                : item.product?.returnPolicy
                            if (!policy) return null
                            return (
                                <div key={i}>
                                    {order.items.length > 1 && (
                                        <p className="text-[10px] text-slate-400 font-medium px-1 mb-1 truncate">
                                            {item.title}
                                        </p>
                                    )}
                                    <ReturnPolicyDrawer returnPolicy={policy} trigger="card" />
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* ── 4. Shipping Address ── */}
                <OrderShippingCard address={order.shippingAddress} />

                {/* ── 5. Payment Info ── */}
                <OrderPaymentCard
                    paymentMethod={order.paymentMethod}
                    paymentStatus={order.paymentStatus}
                    razorpayOrderId={order.razorpayOrderId}
                    razorpayPaymentId={order.razorpayPaymentId}
                />

                {/* ── 6. Order Meta ── */}
                <OrderMetaCard
                    orderId={order.orderId}
                    createdAt={order.createdAt}
                    updatedAt={order.updatedAt}
                    isStockDeducted={order.isStockDeducted}
                />

                {/* ── Support ── */}
                <p className="text-center text-xs text-muted-foreground pb-4">
                    Need help?{' '}
                    <a
                        href="/support"
                        className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                        Contact Support
                    </a>
                </p>
            </main>

            {/* ── Review Dialog ── */}
            <Dialog open={!!reviewingItem} onOpenChange={() => setReviewingItem(null)}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0 bg-transparent border-none shadow-none sm:rounded-3xl overflow-visible">
                    {reviewingItem && (
                        <ReviewForm
                            orderId={orderId}
                            productId={reviewingItem.productId}
                            productTitle={reviewingItem.productTitle}
                            productImage={reviewingItem.productImage}
                            onSubmit={async (values) => {
                                await createReview(values)
                                setReviewingItem(null)
                            }}
                            onCancel={() => setReviewingItem(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}