// app/orders/[id]/page.tsx
"use client"

import { useOrderById } from '@/hooks/useOrders'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react'

import { OrderStatusCard } from './_component/OrderStatusCard'
import { OrderItemCard } from './_component/OrderItemCard'
import { OrderShippingCard } from './_component/OrderShippingCard'
import { OrderPaymentCard } from './_component/OrderPaymentCard'
import { OrderMetaCard } from './_component/OrderMetaCard'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string
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
                                <span>Subtotal</span>
                                <span>&#8377;{order.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Delivery</span>
                                <span className="text-emerald-600 font-semibold">Free</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-black text-foreground">
                                <span>Total Paid</span>
                                <span>&#8377;{order.totalAmount?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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