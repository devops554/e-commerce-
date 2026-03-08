"use client"

import React, { useEffect, useState } from 'react'
import { useOrderById, useDispatchItem, useCancelOrder } from '@/hooks/useOrders'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft, Loader2, AlertCircle, ShoppingBag,
    User, Phone, MapPin, Check, XCircle
} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa"
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export default function ManagerOrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: warehouse, isLoading: isWarehouseLoading } = useManagerWarehouse()
    const { data: order, isLoading: isOrderLoading, error } = useOrderById(orderId)

    const dispatchMutation = useDispatchItem()
    const cancelMutation = useCancelOrder()

    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Order Fulfillment', href: '/manager/orders' },
            { label: order ? `Order #${order.orderId}` : 'Order Details' }
        ])
    }, [order, setBreadcrumbs])

    const handleConfirm = async (variantId: string) => {
        if (!warehouse) return
        await dispatchMutation.mutateAsync({
            orderId: order!._id,
            variantId,
            warehouseId: warehouse._id
        })
    }

    const handleCancel = async () => {
        if (!cancelReason.trim()) return
        await cancelMutation.mutateAsync({ orderId: order!._id, reason: cancelReason.trim() })
        setShowCancelDialog(false)
        setCancelReason('')
        router.back()
    }

    const isLoading = isWarehouseLoading || isOrderLoading

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 font-medium">Loading fulfillment details…</p>
            </div>
        )
    }

    if (error || !order || !warehouse) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
                <AlertCircle className="w-10 h-10 text-rose-500/60" />
                <p className="text-sm font-bold text-rose-500 underline">Could not load fulfillment details.</p>
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">
                    Go back
                </Button>
            </div>
        )
    }

    const warehouseItems = order.items.filter((item: any) =>
        item.warehouse === warehouse._id ||
        (typeof item.warehouse === 'object' && item.warehouse._id === warehouse._id)
    )

    const isCancellable = !['cancelled', 'delivered', 'shipped'].includes(order.orderStatus)



    return (
        <div className="space-y-6 pb-10">
            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={(open) => {
                setShowCancelDialog(open)
                if (!open) setCancelReason('')
            }}>
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">Cancel Order</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                    Order <span className="font-mono font-bold text-slate-700">#{order.orderId}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-xs text-rose-700 font-medium">
                        This action is <span className="font-black">irreversible</span>. The customer will be notified with the reason you provide below.
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            Cancellation Reason <span className="text-rose-500">*</span>
                        </label>
                        <Textarea
                            placeholder="e.g. Item out of stock at warehouse, customer requested cancellation, address issue..."
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="resize-none bg-white border-slate-200 focus:border-rose-400 text-sm rounded-xl"
                            rows={3}
                        />
                        <p className="text-[10px] text-slate-400 font-medium">
                            {cancelReason.trim().length} characters
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl flex-1 font-bold border-slate-200"
                            onClick={() => { setShowCancelDialog(false); setCancelReason('') }}
                            disabled={cancelMutation.isPending}
                        >
                            Discard
                        </Button>
                        <Button
                            className="rounded-xl flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-100"
                            onClick={handleCancel}
                            disabled={!cancelReason.trim() || cancelMutation.isPending}
                        >
                            {cancelMutation.isPending
                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Cancelling…</>
                                : <><XCircle className="w-4 h-4 mr-2" />Confirm Cancel</>
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline" size="icon"
                        className="rounded-xl h-10 w-10 shrink-0 border-slate-200"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Fulfillment Management</h1>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-200">Manager</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{order.orderId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <FaWhatsapp
                            className='text-green-500 hover:text-green-600 cursor-pointer transition-colors mx-2'
                            size={24}
                            onClick={() => window.open(`https://wa.me/${order.shippingAddress.phone}`, '_blank')}
                        />
                    </div>
                    {isCancellable && (
                        <Button
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <OrderStatusCard
                        orderStatus={order.orderStatus}
                        totalAmount={order.totalAmount}
                        createdAt={order.createdAt}
                        orderId={order.orderId}
                        cancelReason={order.cancelReason}
                        cancelAt={order.cancelAt}
                        cancelBy={order.cancelBy}
                    />

                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                                Assigned Items
                            </CardTitle>
                            <Badge className="bg-white text-slate-600 border-slate-200 font-bold">
                                {warehouseItems.length} Items
                            </Badge>
                        </CardHeader>
                        <CardContent className="px-6 py-6 space-y-5">
                            {warehouseItems.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 font-medium">
                                    No items in this order are assigned to your warehouse.
                                </div>
                            ) : (
                                warehouseItems.map((item: any, i: number) => (
                                    <div key={item._id ?? i} className="relative group flex items-start justify-between border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                        <div className="flex-1 shrink-0">
                                            <OrderItemCard item={item} isLast={i === warehouseItems.length - 1} />
                                        </div>
                                        <div className="ml-4 flex flex-col items-end gap-2 shrink-0 self-center">
                                            {item.status === 'confirmed' || item.status === 'packed' || item.status === 'shipped' || item.status === 'delivered' ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-4 py-2 mt-2 rounded-xl">
                                                    <Check className="h-4 w-4 mr-1.5" />
                                                    Confirmed
                                                </Badge>
                                            ) : item.status !== 'cancelled' ? (
                                                <Button
                                                    className="bg-slate-900 hover:bg-black text-white font-black px-6 rounded-xl h-10 shadow-lg shadow-slate-200 mt-2"
                                                    onClick={() => handleConfirm(item.variant._id)}
                                                    disabled={dispatchMutation.isPending}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Confirm Item
                                                </Button>
                                            ) : (
                                                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-black px-4 py-2 mt-2 rounded-xl">
                                                    Cancelled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                <User className="w-5 h-5 text-slate-400" />
                                Delivery Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{order.shippingAddress?.fullName}</p>
                                </div>
                            </div>
                            <Separator className="bg-slate-100" />
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold font-mono">{order.shippingAddress?.phone}</span>
                            </div>
                            <div
                                className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => {
                                    const { latitude, longitude, street, city, state, postalCode } = order.shippingAddress
                                    const url = latitude && longitude
                                        ? `https://www.google.com/maps?q=${latitude},${longitude}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${city}, ${state}, ${postalCode}`)}`
                                    window.open(url, '_blank')
                                }}
                            >
                                <div className="flex gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-blue-600 transition-colors">
                                        {order.shippingAddress?.street},<br />
                                        {order.shippingAddress?.landmark && <>{order.shippingAddress.landmark},<br /></>}
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                        {order.shippingAddress?.postalCode} - {order.shippingAddress?.country}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-base font-black text-slate-900">Order Meta</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Placed On</span>
                                    <span className="font-bold text-slate-900">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Payment</span>
                                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${(order as any).paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {(order as any).paymentStatus || 'pending'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}