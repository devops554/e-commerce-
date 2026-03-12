"use client";

import React, { useEffect, useState } from 'react'
import { useOrderById, useDispatchItem, useCancelOrder } from '@/hooks/useOrders'
import { useShipments } from '@/hooks/useShipments'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const LiveTrackingMap = dynamic(() => import('@/components/manager/LiveTrackingMap'), { ssr: false })
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft, Loader2, AlertCircle, ShoppingBag, Truck, ChevronRight,
    XCircle
} from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa"
import { Badge } from '@/components/ui/badge'
import { OrderStatusCard } from '@/components/order/OrderStatusCard'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { useManagerWarehouse } from '@/hooks/useWarehouses'
import { AssignPartnerDialog } from '@/components/admin/AssignPartnerDialog'
import {
    useUpdateShipmentStatus,
    useRequestPickupOtp,
    useVerifyPickupOtp,
    useRequestDeliveryOtp,
    useVerifyDeliveryOtp
} from '@/hooks/useShipments'
import { ShipmentStatus } from '@/services/shipment.service'
import { OTPVerificationDialog } from '@/components/manager/OTPVerificationDialog'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// Extracted sub-components
import { ItemActionCell, getNextStepConfig } from './_components/OrderActionComponents'
import { DeliveryDetails } from './_components/DeliveryDetails'
import { LogisticsCard } from './_components/LogisticsCard'
import { WarehousePackingList } from './_components/WarehousePackingList'
import { OrderMetaCard } from './_components/OrderMetaCard'

export default function ManagerOrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = params.id as string
    const [activeTab, setActiveTab] = useState<'details' | 'tracking'>(searchParams.get('tab') === 'tracking' ? 'tracking' : 'details')
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: warehouse, isLoading: isWarehouseLoading } = useManagerWarehouse()
    const { data: order, isLoading: isOrderLoading, error } = useOrderById(orderId)
    const { data: shipmentData, isLoading: isShipmentLoading } = useShipments({
        orderId: order?._id,
        warehouseId: warehouse?._id
    })

    const dispatchMutation = useDispatchItem()
    const cancelMutation = useCancelOrder()

    const shipment = shipmentData?.data?.[0]
    const partner = shipment?.deliveryPartnerId

    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

    const updateShipmentStatusMutation = useUpdateShipmentStatus()
    const requestPickupOtpMutation = useRequestPickupOtp()
    const verifyPickupOtpMutation = useVerifyPickupOtp()
    const requestDeliveryOtpMutation = useRequestDeliveryOtp()
    const verifyDeliveryOtpMutation = useVerifyDeliveryOtp()

    const [otpDialog, setOtpDialog] = useState<{ open: boolean; type: 'pickup' | 'delivery' }>({ open: false, type: 'pickup' })

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

    const handleStatusTransition = async () => {
        if (!shipment) return
        try {
            switch (shipment.status) {
                case ShipmentStatus.ORDER_PLACED:
                    await updateShipmentStatusMutation.mutateAsync({ id: shipment._id, data: { status: ShipmentStatus.PACKED } })
                    toast.success('Order marked as packed')
                    break
                case ShipmentStatus.ASSIGNED_TO_DELIVERY:
                case ShipmentStatus.ACCEPTED:
                case ShipmentStatus.PACKED:
                    if (!partner) {
                        setIsAssignDialogOpen(true)
                        return
                    }
                    await requestPickupOtpMutation.mutateAsync(shipment._id)
                    setOtpDialog({ open: true, type: 'pickup' })
                    toast.success('Pickup OTP sent to partner')
                    break
                case ShipmentStatus.PICKED_UP:
                    await updateShipmentStatusMutation.mutateAsync({ id: shipment._id, data: { status: ShipmentStatus.OUT_FOR_DELIVERY } })
                    toast.success('Delivery started')
                    break
                case ShipmentStatus.OUT_FOR_DELIVERY:
                    await requestDeliveryOtpMutation.mutateAsync(shipment._id)
                    setOtpDialog({ open: true, type: 'delivery' })
                    toast.success('Delivery OTP sent to customer')
                    break
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status')
        }
    }

    const handleVerifyOtp = async (otp: string) => {
        if (!shipment) return
        try {
            if (otpDialog.type === 'pickup') {
                await verifyPickupOtpMutation.mutateAsync({ id: shipment._id, otp })
                toast.success('Handover successful! Order is now shipped.')
            } else {
                await verifyDeliveryOtpMutation.mutateAsync({ id: shipment._id, otp })
                toast.success('Order delivered successfully!')
            }
            setOtpDialog({ ...otpDialog, open: false })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP')
        }
    }

    const nextStep = getNextStepConfig(shipment?.status)
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
                <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl">Go back</Button>
            </div>
        )
    }

    const warehouseItems = order.items.filter((item: any) =>
        item.warehouse === warehouse._id ||
        (typeof item.warehouse === 'object' && item.warehouse._id === warehouse._id)
    )

    const isCancellable = !['cancelled', 'delivered', 'shipped'].includes(order.orderStatus)
    const confirmedCount = warehouseItems.filter((i: any) => ['confirmed', 'packed', 'shipped', 'delivered'].includes((i.status ?? '').toLowerCase())).length
    const totalCount = warehouseItems.length

    return (
        <div className="space-y-6 pb-10">
            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={(open) => { setShowCancelDialog(open); if (!open) setCancelReason('') }}>
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
                        Confirming this will notify the <span className="font-black">Admin</span> that your warehouse cannot fulfil this order. The Admin will reassign it to another warehouse.
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
                        <p className="text-[10px] text-slate-400 font-medium">{cancelReason.trim().length} characters</p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button variant="outline" className="rounded-xl flex-1 font-bold border-slate-200" onClick={() => { setShowCancelDialog(false); setCancelReason('') }} disabled={cancelMutation.isPending}>
                            Discard
                        </Button>
                        <Button className="rounded-xl flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black shadow-lg shadow-amber-100" onClick={handleCancel} disabled={!cancelReason.trim() || cancelMutation.isPending}>
                            {cancelMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Requesting…</> : <><AlertCircle className="w-4 h-4 mr-2" />Submit Request</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0 border-slate-200" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Fulfillment Management</h1>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-200">Manager</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-400 font-mono truncate">{order.orderId}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] rounded border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50" onClick={() => router.push(`/manager/orders/${order._id}/invoice`)}>
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            View Invoice
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {nextStep && (
                        <Button
                            onClick={handleStatusTransition}
                            disabled={updateShipmentStatusMutation.isPending || requestPickupOtpMutation.isPending || requestDeliveryOtpMutation.isPending}
                            className={`text-white font-black rounded-xl shadow-lg px-6 gap-2 transition-all active:scale-95 ${nextStep.color}`}
                        >
                            {(updateShipmentStatusMutation.isPending || requestPickupOtpMutation.isPending || requestDeliveryOtpMutation.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>{nextStep.icon}{nextStep.label}<ChevronRight className="w-3.5 h-3.5 opacity-70" /></>
                            )}
                        </Button>
                    )}
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        <FaWhatsapp className='text-green-500 hover:text-green-600 cursor-pointer transition-colors mx-2' size={24} onClick={() => window.open(`https://wa.me/${order.shippingAddress.phone}`, '_blank')} />
                    </div>
                    {isCancellable && (
                        <Button variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50 font-bold rounded-xl" onClick={() => setShowCancelDialog(true)}>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Cannot Fulfill
                        </Button>
                    )}
                </div>
            </div>

            {/* Sub-navigation Tabs */}
            {shipment && shipment.status !== 'ORDER_PLACED' && shipment.status !== 'PACKED' && (
                <div className="flex items-center gap-6 border-b border-slate-200 mt-2 mb-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Order Details
                    </button>
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tracking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Live Tracking
                    </button>
                </div>
            )}

            {activeTab === 'details' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                        <LogisticsCard
                            shipment={shipment}
                            partner={partner}
                            onAssignPartner={() => setIsAssignDialogOpen(true)}
                            onViewPartner={(id) => router.push(`/manager/delivery-partners/${id}`)}
                        />

                        <WarehousePackingList
                            warehouseItems={warehouseItems}
                            confirmedCount={confirmedCount}
                            totalCount={totalCount}
                            orderStatus={order.orderStatus}
                            onConfirm={handleConfirm}
                            isDispatching={dispatchMutation.isPending}
                        />
                    </div>

                    <div className="space-y-6">
                        <DeliveryDetails order={order} />
                        <OrderMetaCard order={order} />
                    </div>
                </div>
            ) : (
                <div className="w-full h-[500px] lg:h-[600px] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative shadow-sm mt-4">
                    <LiveTrackingMap
                        warehouseLoc={warehouse?.location}
                        customerLoc={order?.shippingAddress}
                        partnerLoc={partner?.currentLocation}
                        partnerName={partner?.name}
                    />

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 w-[90%] md:w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl z-[400] border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-indigo-500" /> Live Status
                            </h4>
                            <Badge className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] uppercase font-black tracking-widest border-none">
                                En Route
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Partner</p>
                                <p className="text-sm font-black text-slate-800">{partner?.name || 'Assigned Partner'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Destination</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {shipment && (
                <AssignPartnerDialog
                    isOpen={isAssignDialogOpen}
                    onClose={() => setIsAssignDialogOpen(false)}
                    shipmentId={shipment._id}
                    warehouseId={warehouse._id}
                    trackingNumber={shipment.trackingNumber}
                />
            )}

            <OTPVerificationDialog
                isOpen={otpDialog.open}
                onClose={() => setOtpDialog({ ...otpDialog, open: false })}
                onVerify={handleVerifyOtp}
                isLoading={verifyPickupOtpMutation.isPending || verifyDeliveryOtpMutation.isPending}
                title={otpDialog.type === 'pickup' ? 'Handover Verification' : 'Delivery Verification'}
                description={otpDialog.type === 'pickup'
                    ? 'Ask the delivery partner for the OTP sent to their app.'
                    : 'Ask the customer for the OTP sent to their phone/app.'
                }
            />
        </div>
    )
}