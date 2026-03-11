"use client";

import { useOrderById } from '@/hooks/useOrders'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react'

import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { OrderShippingCard } from '@/components/order/OrderShippingCard'
import { OrderPaymentCard } from '@/components/order/OrderPaymentCard'
import { OrderMetaCard } from '@/components/order/OrderMetaCard'


export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.slug as string
    const { data: order, isLoading, error } = useOrderById(orderId)

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-muted/30">

                <div className="flex flex-col items-center justify-center py-40 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading order…</p>
                </div>

            </div>
        )
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !order) {
        return (
            <div className="min-h-screen bg-muted/30">

                <div className="flex flex-col items-center justify-center py-40 gap-3">
                    <AlertCircle className="w-10 h-10 text-destructive/60" />
                    <p className="text-sm font-medium text-destructive">Could not load order details.</p>
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        Go back
                    </Button>
                </div>

            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/40">


            <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

                {/* ── Back + heading ── */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
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
                        {order.items.map((item: any, i: number) => (
                            <OrderItemCard
                                key={item._id ?? i}
                                item={item}
                                isLast={i === order.items.length - 1}
                            />
                        ))}

                        {/* Bill summary */}
                        <Separator />
                        <div className="space-y-2 pt-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal (Taxable Value)</span>
                                <span>&#8377;{((order.totalAmount || 0) - (order.totalGstAmount || 0)).toLocaleString('en-IN')}</span>
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
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Inclusive of GST</span>
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
                                {order.items.map((item: any, i: number) => item.gstRate ? (
                                    <div key={i} className="flex justify-between items-center text-[12px]">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{item.title}</span>
                                            <span className="text-[10px] text-slate-500">GST @{item.gstRate}% on &#8377;{item.lineTaxableValue?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">&#8377;{item.lineTotalGst?.toLocaleString('en-IN')}</span>
                                    </div>
                                ) : null)}
                                <Separator className="bg-emerald-100" />
                                <div className="flex justify-between items-center text-[12px] pt-1">
                                    <span className="font-black text-emerald-900">Total GST Paid</span>
                                    <span className="font-black text-emerald-900">&#8377;{order.totalGstAmount?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── 3. Shipping Address ── */}
                <OrderShippingCard address={order.shippingAddress} />

                {/* ── 4. Payment Info ── */}
                <OrderPaymentCard
                    paymentMethod={order.paymentMethod}
                    paymentStatus={order.paymentStatus}
                    razorpayOrderId={order.razorpayOrderId}
                    razorpayPaymentId={order.razorpayPaymentId}
                />

                {/* ── 5. Order Meta ── */}
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


        </div>
    )
}