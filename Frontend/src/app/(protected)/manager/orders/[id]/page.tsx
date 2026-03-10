"use client"

import React, { useEffect, useState } from 'react'
import { useOrderById, useDispatchItem, useCancelOrder } from '@/hooks/useOrders'
import { useShipments } from '@/hooks/useShipments'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft, Loader2, AlertCircle, ShoppingBag,
    User, Phone, MapPin, Check, XCircle, Truck, Hash, Calendar, Info
} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa"
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { AssignPartnerDialog } from '@/components/admin/AssignPartnerDialog'
import { useUpdateShipmentStatus } from '@/hooks/useShipments'
import { ShipmentStatus } from '@/services/shipment.service'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    const { data: shipmentData, isLoading: isShipmentLoading } = useShipments({
        orderId: order?._id,
        warehouseId: warehouse?._id
    })

    const dispatchMutation = useDispatchItem()
    const cancelMutation = useCancelOrder()

    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

    const updateShipmentStatusMutation = useUpdateShipmentStatus()

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

    const isLoading = isWarehouseLoading || isOrderLoading || isShipmentLoading

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
    const shipment = shipmentData?.data?.[0]
    const partner = shipment?.deliveryPartnerId

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
                                <DialogTitle className="text-base font-black text-slate-900">Request Order Reassignment</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                    Order <span className="font-mono font-bold text-slate-700">#{order.orderId}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                        Confirming this will notify the <span className="font-black">Admin</span> that your warehouse cannot fulfillment this order. The Admin will reassign it to another warehouse.
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                            Fulfillment Issue Reason <span className="text-rose-500">*</span>
                        </label>
                        <Textarea
                            placeholder="e.g. Item out of stock at this warehouse, damaged during packing..."
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
                            className="rounded-xl flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black shadow-lg shadow-amber-100"
                            onClick={handleCancel}
                            disabled={!cancelReason.trim() || cancelMutation.isPending}
                        >
                            {cancelMutation.isPending
                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Requesting…</>
                                : <><AlertCircle className="w-4 h-4 mr-2" />Submit Request</>
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
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-400 font-mono truncate">{order.orderId}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] rounded border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50"
                                onClick={() => router.push(`/manager/orders/${order._id}/invoice`)}
                            >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                View Invoice
                            </Button>
                        </div>
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
                            className="border-amber-200 text-amber-600 hover:bg-amber-50 font-bold rounded-xl"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Cannot Fulfill
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

                    {/* Shipment Assignment Details */}
                    <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                <Truck className="w-5 h-5 text-indigo-500" />
                                Logistics & Assignment
                            </CardTitle>
                            {shipment && (
                                <Badge className={`font-bold capitalize ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    shipment.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                        'bg-indigo-100 text-indigo-700'
                                    }`}>
                                    {shipment.status.replace(/_/g, ' ')}
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="px-6 py-6 font-medium">
                            {!shipment ? (
                                <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Info className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No delivery partner assigned to this order yet.</p>
                                    <Button
                                        onClick={() => router.push('/manager/orders')}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl font-black bg-white border-slate-200"
                                    >
                                        Go to Assignment List
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Assigned Delivery Partner</span>
                                            {!partner ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                                        <p className="text-xs font-bold text-rose-600">No partner assigned</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => setIsAssignDialogOpen(true)}
                                                        className="rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-10 w-full"
                                                    >
                                                        Assign Partner Now
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                        <User className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-slate-900 truncate">{partner.name || 'N/A'}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">{partner.phone || 'No phone'}</p>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-full h-8 w-8 text-green-500"
                                                            onClick={() => partner.phone && window.open(`https://wa.me/${partner.phone}`, '_blank')}
                                                        >
                                                            <FaWhatsapp size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="rounded-full h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                            onClick={() => setIsAssignDialogOpen(true)}
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tracking Number</span>
                                            <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                                                <Hash className="w-3.5 h-3.5 text-slate-400" />
                                                {shipment.trackingNumber}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Status Override</span>
                                            <Select
                                                value={shipment.status}
                                                onValueChange={(status) => updateShipmentStatusMutation.mutate({
                                                    id: shipment._id,
                                                    data: { status: status as ShipmentStatus }
                                                })}
                                                disabled={updateShipmentStatusMutation.isPending}
                                            >
                                                <SelectTrigger className="h-10 rounded-xl text-[11px] font-black uppercase border-slate-200 bg-white shadow-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(ShipmentStatus).map(s => (
                                                        <SelectItem key={s} value={s} className="text-xs font-bold uppercase">
                                                            {s.replace(/_/g, ' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Assigned On</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                    {shipment.assignedAt ? format(new Date(shipment.assignedAt), 'MMM dd, HH:mm') : 'Pending'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Picked Up</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                    {shipment.pickedAt ? format(new Date(shipment.pickedAt), 'MMM dd, HH:mm') : 'Pending'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Dispatch Agent</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                                                <Check className={`w-4 h-4 ${shipment.deliveredAt ? 'text-green-600' : 'text-slate-300'}`} />
                                                {shipment.deliveredAt
                                                    ? `Delivered on ${format(new Date(shipment.deliveredAt), 'MMM dd, yyyy HH:mm')}`
                                                    : shipment.status === 'OUT_FOR_DELIVERY' ? 'Order is out for delivery' :
                                                        shipment.status === 'ACCEPTED' ? 'Partner accepted, awaiting pickup' :
                                                            shipment.status === 'ASSIGNED_TO_DELIVERY' ? 'Awaiting partner acceptance' :
                                                                'Awaiting pickup from warehouse'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                                            {['confirmed', 'packed', 'shipped', 'delivered'].includes(item.status) ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-4 py-2 mt-2 rounded-xl">
                                                    <Check className="h-4 w-4 mr-1.5" />
                                                    Confirmed
                                                </Badge>
                                            ) : item.status === 'PENDING_REASSIGNMENT' ? (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-black px-4 py-2 mt-2 rounded-xl">
                                                    Reassignment Requested
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

            {shipment && (
                <AssignPartnerDialog
                    isOpen={isAssignDialogOpen}
                    onClose={() => setIsAssignDialogOpen(false)}
                    shipmentId={shipment._id}
                    warehouseId={warehouse._id}
                    trackingNumber={shipment.trackingNumber}
                />
            )}
        </div>
    )
}