"use client"

import { useOrderById } from '@/hooks/useOrders'
import { useShipments } from '@/hooks/useShipments'
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
    MapPin,
    Truck,
    Hash,
    Calendar,
    Check,
    Info
} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa";
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService, OrderStatus } from '@/services/order.service'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { OrderItemCard } from '@/components/order/OrderItemCard'
import { OrderShippingCard } from '@/components/order/OrderShippingCard'
import { OrderPaymentCard } from '@/components/order/OrderPaymentCard'
import { OrderMetaCard } from '@/components/order/OrderMetaCard'
import { OrderHistoryCard } from '@/components/order/OrderHistoryCard'
import AdminOrderGstCard from '@/components/admin/AdminOrderGstCard'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { OrderCancellationDialog } from '@/components/admin/OrderCancellationDialog'
import { Badge } from '@/components/ui/badge'
import { AssignPartnerDialog } from '@/components/admin/AssignPartnerDialog'
import { ReassignWarehouseDialog } from '@/components/admin/ReassignWarehouseDialog'
import { useUpdateShipmentStatus } from '@/hooks/useShipments'
import { ShipmentStatus } from '@/services/shipment.service'

const ALL_STATUSES: OrderStatus[] = ["created", "pending", "confirmed", "shipped", "delivered", "failed", "cancelled"]

import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import React from 'react'

export default function AdminOrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const orderId = params.id as string
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: order, isLoading: isOrderLoading, error } = useOrderById(orderId)
    const { data: shipmentData, isLoading: isShipmentLoading } = useShipments({ orderId: order?._id })

    React.useEffect(() => {
        setBreadcrumbs([
            { label: 'Orders', href: '/admin/orders' },
            { label: order ? `Order #${order.orderId}` : 'Order Details' }
        ])
    }, [order, setBreadcrumbs])

    const [isCancelOrderOpen, setIsCancelOrderOpen] = React.useState(false)
    const [cancelItemData, setCancelItemData] = React.useState<{ variantId: string; title: string } | null>(null)
    const [assignPartnerData, setAssignPartnerData] = React.useState<{ shipmentId: string; warehouseId: string; trackingNumber: string } | null>(null)
    const [reassignData, setReassignData] = React.useState<{ oldWarehouseId: string } | null>(null)

    const updateShipmentStatusMutation = useUpdateShipmentStatus()

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

    const isLoading = isOrderLoading || isShipmentLoading

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

    const shipment = shipmentData?.data?.[0]
    const partner = shipment?.deliveryPartnerId

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
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-400 font-mono truncate">{order.orderId}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px] rounded border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50"
                                onClick={() => router.push(`/admin/orders/${order._id}/invoice`)}
                            >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                View Invoice
                            </Button>
                        </div>
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
                        cancelBy={order.cancelBy}
                    />

                    {/* Logistics & Assignment Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Shipments ({shipmentData?.data?.length || 0})</h3>
                        </div>

                        {!shipmentData?.data || shipmentData.data.length === 0 ? (
                            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardContent className="px-6 py-10 flex flex-col items-center justify-center text-slate-500 gap-3 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Info className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No shipments found for this order.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            shipmentData.data.map((shipment: any) => (
                                <Card key={shipment._id} className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                    <CardHeader className="pb-3 px-6 pt-6 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
                                            <Truck className="w-5 h-5 text-indigo-500" />
                                            Shipment: {shipment.trackingNumber}
                                        </CardTitle>
                                        <div className="flex items-center gap-3">
                                            <Select
                                                value={shipment.status}
                                                onValueChange={(status) => updateShipmentStatusMutation.mutate({
                                                    id: shipment._id,
                                                    data: { status: status as ShipmentStatus }
                                                })}
                                                disabled={updateShipmentStatusMutation.isPending}
                                            >
                                                <SelectTrigger className="h-8 w-[140px] rounded-lg text-[10px] font-black uppercase border-slate-200 bg-white">
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
                                            <Badge className={`font-bold capitalize ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                shipment.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                {shipment.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6 py-6 font-medium">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Assigned Delivery Partner</span>
                                                    {!shipment.deliveryPartnerId ? (
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                                                <p className="text-xs font-bold text-rose-600">No partner assigned</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => setAssignPartnerData({
                                                                    shipmentId: shipment._id,
                                                                    warehouseId: shipment.warehouseId?._id || shipment.warehouseId,
                                                                    trackingNumber: shipment.trackingNumber
                                                                })}
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
                                                                <p className="text-sm font-black text-slate-900 truncate">{shipment.deliveryPartnerId?.name || 'N/A'}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold">{shipment.deliveryPartnerId?.phone || 'No phone'}</p>
                                                            </div>
                                                            <div className="ml-auto flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="rounded-full h-8 w-8 text-green-500"
                                                                    onClick={() => shipment.deliveryPartnerId?.phone && window.open(`https://wa.me/${shipment.deliveryPartnerId.phone}`, '_blank')}
                                                                >
                                                                    <FaWhatsapp size={18} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="rounded-full h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                                    onClick={() => setAssignPartnerData({
                                                                        shipmentId: shipment._id,
                                                                        warehouseId: shipment.warehouseId?._id || shipment.warehouseId,
                                                                        trackingNumber: shipment.trackingNumber
                                                                    })}
                                                                >
                                                                    <Info className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Origin Warehouse</span>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {shipment.warehouseId?.name || 'Unknown Warehouse'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
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
                                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Live Status Agent</span>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                                                        <Check className={`w-4 h-4 ${shipment.deliveredAt ? 'text-green-600' : 'text-slate-300'}`} />
                                                        {shipment.deliveredAt
                                                            ? `Delivered on ${format(new Date(shipment.deliveredAt), 'MMM dd, yyyy HH:mm')}`
                                                            : shipment.status === 'OUT_FOR_DELIVERY' ? 'Order is out for delivery' :
                                                                shipment.status === 'ACCEPTED' ? 'Partner accepted, awaiting pickup' :
                                                                    shipment.status === 'ASSIGNED_TO_DELIVERY' ? 'Awaiting partner acceptance' :
                                                                        'Shipment in progress...'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

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
                                        action={
                                            item.status === 'PENDING_REASSIGNMENT' ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-[10px] h-7 px-3"
                                                    onClick={() => setReassignData({ oldWarehouseId: item.warehouse?._id || item.warehouse })}
                                                >
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Reassign Warehouse
                                                </Button>
                                            ) : null
                                        }
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

                    {/* GST Summary */}
                    <AdminOrderGstCard order={{ ...order, _id: order._id } as any} />
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

                    <OrderHistoryCard history={order.history} />

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

            {assignPartnerData && (
                <AssignPartnerDialog
                    isOpen={!!assignPartnerData}
                    onClose={() => setAssignPartnerData(null)}
                    shipmentId={assignPartnerData.shipmentId}
                    warehouseId={assignPartnerData.warehouseId}
                    trackingNumber={assignPartnerData.trackingNumber}
                />
            )}

            {reassignData && (
                <ReassignWarehouseDialog
                    isOpen={!!reassignData}
                    onClose={() => setReassignData(null)}
                    orderId={orderId}
                    oldWarehouseId={reassignData.oldWarehouseId}
                />
            )}
        </div>
    )
}
