"use client"

import { useOrderById } from '@/hooks/useOrders'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    ShoppingBag,
    User,
    Phone,
    Mail,
    ShieldCheck,
    Trash2,

} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService, OrderStatus } from '@/services/order.service'
import { toast } from 'sonner'

import { OrderStatusCard } from '@/app/my-orders/[id]/_component/OrderStatusCard'
import { OrderItemCard } from '@/app/my-orders/[id]/_component/OrderItemCard'
import { OrderShippingCard } from '@/app/my-orders/[id]/_component/OrderShippingCard'
import { OrderPaymentCard } from '@/app/my-orders/[id]/_component/OrderPaymentCard'
import { OrderMetaCard } from '@/app/my-orders/[id]/_component/OrderMetaCard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { OrderCancellationDialog } from '@/components/admin/OrderCancellationDialog'

const ALL_STATUSES: OrderStatus[] = ["created", "pending", "confirmed", "shipped", "delivered", "failed", "cancelled"]

import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import React from 'react'

export default function AdminOrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const orderId = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: order, isLoading, error } = useOrderById(orderId)

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Orders', href: '/admin/orders' },
            { label: order ? `Order #${order.orderId}` : 'Order Details' }
        ])
    }, [order, setBreadcrumbs])

    const [isCancelOrderOpen, setIsCancelOrderOpen] = React.useState(false)
    const [cancelItemData, setCancelItemData] = React.useState<{ variantId: string; title: string } | null>(null)

    const updateStatusMutation = useMutation({
        mutationFn: (status: OrderStatus) => orderService.updateStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
            toast.success("Order status updated")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status")
        },
    })

    const cancelOrderMutation = useMutation({
        mutationFn: (reason: string) => orderService.cancelOrder(orderId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
            toast.success("Order cancelled successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to cancel order")
        },
    })

    const cancelItemMutation = useMutation({
        mutationFn: ({ variantId, reason }: { variantId: string; reason: string }) =>
            orderService.cancelOrderItem(orderId, variantId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] })
            toast.success("Item cancelled successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to cancel item")
        },
    })

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-slate-500 font-medium">Loading order details…</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
                <AlertCircle className="w-10 h-10 text-destructive/60" />
                <p className="text-sm font-bold text-destructive underline">Could not load order details.</p>
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">
                    Go back
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Management</h1>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-widest border border-slate-200">Admin</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{order.orderId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Status Control</p>
                    <Select
                        value={order.orderStatus}
                        onValueChange={s => updateStatusMutation.mutate(s as OrderStatus)}
                        disabled={updateStatusMutation.isPending}
                    >
                        <SelectTrigger className="h-10 w-[160px] rounded-xl text-sm font-bold border-slate-200 bg-slate-50 focus:ring-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_STATUSES.map(s => (
                                <SelectItem key={s} value={s} className="text-sm font-medium capitalize">
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>
                    <FaWhatsapp className='text-green-500' size={24} onClick={() => window.open(`https://wa.me/${order.shippingAddress.phone}`, '_blank')} />
                    {/* <MdOutlineMail className='text-blue-500' size={24} onClick={() => window.open(`mailto:${order.shippingAddress.email}`, '_blank')} /> */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order details & items */}
                <div className="lg:col-span-2 space-y-6">
                    <OrderStatusCard
                        orderStatus={order.orderStatus}
                        totalAmount={order.totalAmount}
                        createdAt={order.createdAt}
                        orderId={order.orderId}
                        cancelReason={order.cancelReason}
                        cancelAt={order.cancelAt}
                    />

                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-6 space-y-5">
                            {order.items.map((item: any, i: number) => (
                                <div key={item._id ?? i} className="relative group">
                                    <OrderItemCard
                                        item={item}
                                        isLast={i === order.items.length - 1}
                                    />
                                    {item.status !== 'cancelled' && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-8 px-3 font-bold text-[10px] uppercase tracking-wider"
                                            onClick={() => setCancelItemData({ variantId: item.variant._id, title: item.title })}
                                        >
                                            Cancel Item
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 mt-4 border border-slate-100">
                                <div className="flex justify-between text-sm font-medium text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 font-black">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-slate-500">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600 font-black">Free</span>
                                </div>
                                <Separator className="bg-slate-200/60" />
                                <div className="flex justify-between items-center text-lg font-black text-slate-900">
                                    <span>Total Amount</span>
                                    <span className="text-2xl tracking-tight">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Customer & Payment info */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                <User className="w-5 h-5 text-slate-400" />
                                Customer Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{order.shippingAddress?.fullName}</p>
                                    <p className="text-xs text-slate-400 font-medium tracking-tight">Customer ID: {order.user as any}</p>
                                </div>
                            </div>
                            <Separator className="bg-slate-100" />
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold font-mono">{order.shippingAddress?.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium truncate">{(order.user as any)?.email ?? 'No email associated'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <OrderShippingCard address={order.shippingAddress} />

                    <OrderPaymentCard
                        paymentMethod={order.paymentMethod}
                        paymentStatus={order.paymentStatus}
                        razorpayOrderId={order.razorpayOrderId}
                        razorpayPaymentId={order.razorpayPaymentId}
                    />

                    <OrderMetaCard
                        orderId={order.orderId}
                        createdAt={order.createdAt}
                        updatedAt={order.updatedAt}
                        isStockDeducted={order.isStockDeducted ?? false}
                    />

                    {/* Dangerous zone */}
                    <Card className="rounded-3xl border-rose-100 bg-rose-50/30 overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b border-rose-100">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Admin Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                                <Button
                                    onClick={() => setIsCancelOrderOpen(true)}
                                    className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 font-bold h-11 shadow-lg shadow-orange-100"
                                >
                                    Cancel Entire Order
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 font-bold h-11 shadow-lg shadow-rose-200"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Order Record
                            </Button>
                            <p className="text-[10px] text-slate-400 mt-3 text-center font-medium">
                                * Action will permanently remove order from database
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <OrderCancellationDialog
                isOpen={isCancelOrderOpen}
                onClose={() => setIsCancelOrderOpen(false)}
                onConfirm={async (reason) => { await cancelOrderMutation.mutateAsync(reason) }}
                title="Cancel Entire Order"
                description={`Are you sure you want to cancel order #${order.orderId}? This will restore stock for all active items.`}
                isLoading={cancelOrderMutation.isPending}
            />

            <OrderCancellationDialog
                isOpen={!!cancelItemData}
                onClose={() => setCancelItemData(null)}
                onConfirm={async (reason) => { await cancelItemMutation.mutateAsync({ variantId: cancelItemData!.variantId, reason }) }}
                title="Cancel Individual Item"
                description={`Cancel "${cancelItemData?.title}" from this order? Stock will be restored for this variant.`}
                isLoading={cancelItemMutation.isPending}
            />
        </div>
    )
}
