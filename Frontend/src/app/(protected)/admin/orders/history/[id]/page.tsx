"use client"

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOrderById } from '@/hooks/useOrders'
import { useShipments, useTrackingHistory } from '@/hooks/useShipments'
import { useBreadcrumb } from '@/providers/BreadcrumbContext'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderHistoryTimeline } from '@/components/manager/OrderHistoryTimeline'
import dynamic from 'next/dynamic'
import { ChevronLeft, Search, Truck, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

import { getStatus } from '@/types/orderhistory'
import { OhdCard, SectionLabel, CardTitle, StatusBadge } from '@/components/Orderhistory/primitives'
import { CustomerCard, DeliveryPartnerCard, WarehouseCard, OrderMetaCard } from '@/components/Orderhistory/info-cards'
import { OrderItemsCard } from '@/components/Orderhistory/items-card'

/* ── dynamic map (no SSR) ── */
const LiveTrackingMap = dynamic(
    () => import('@/components/manager/LiveTrackingMap'),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
                <MapPin className="h-8 w-8 text-slate-300" />
            </div>
        ),
    }
)

export default function AdminOrderHistoryDetailPage() {
    const { id } = useParams() as { id: string }
    const router = useRouter()
    const { setBreadcrumbs } = useBreadcrumb()

    const { data: order, isLoading: isOrderLoading } = useOrderById(id)
    const { data: shipmentData, isLoading: isShipmentLoading } = useShipments({ orderId: id })

    const shipmentId = shipmentData?.data?.[0]?._id
    const { data: trackingHistory } = useTrackingHistory(shipmentId)

    useEffect(() => {
        setBreadcrumbs([
            { label: 'Admin Dashboard', href: '/admin' },
            { label: 'Order History', href: '/admin/orders/history' },
            { label: 'Snapshot Detail' },
        ])
    }, [setBreadcrumbs])

    const isLoading = isOrderLoading || isShipmentLoading

    /* ── skeleton ── */
    if (isLoading) return <PageSkeleton />

    /* ── not found ── */
    if (!order) return <NotFound onBack={() => router.back()} />

    /* ── data prep ── */
    const shipment = shipmentData?.data?.[0]

    const warehouseLoc = (shipment?.warehouseId?.location)
        || (order.items?.[0]?.warehouse?.location)
        || { latitude: 20.5937, longitude: 78.9629 }

    const customerLoc = order.shippingAddress?.location
    const historyLocsRaw = trackingHistory?.map((h: any) => h.location) || []
    const lastLoc = historyLocsRaw[0] ?? null
    const historyLocs = [...historyLocsRaw].reverse()

    /* pull delivery partner */
    const partner = (typeof shipment?.deliveryPartnerId === 'object' ? shipment.deliveryPartnerId : null)
        ?? null

    /* normalise warehouse object for WarehouseCard */
    const warehouse = (typeof shipment?.warehouseId === 'object' ? { ...shipment.warehouseId, location: warehouseLoc } : null)
        || (order.items?.[0]?.warehouse ? { ...order.items[0].warehouse, location: warehouseLoc } : null)

    return (
        <>
            <style>{PAGE_STYLES}</style>

            <div className="ohd-root space-y-5 pb-24">

                <header className="ohd-fade ohd-fade-1 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="h-11 w-11 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 active:scale-95 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5 text-slate-700" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="ohd-display text-2xl font-bold text-slate-900 tracking-tight leading-none">
                                    Archive Snapshot
                                </h1>
                                <code className="text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-lg">
                                    #{order.orderId}
                                </code>
                            </div>
                            <p className="text-slate-400 text-sm font-medium mt-1">Global Audit Registry • Administrator View</p>
                        </div>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <div className="lg:col-span-2 space-y-5">

                        <div className="ohd-fade ohd-fade-2 ohd-card bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]">
                            <div className="px-6 pt-5 pb-3">
                                <SectionLabel>Route history</SectionLabel>
                                <CardTitle
                                    icon={<Truck className="h-4 w-4 text-blue-500" />}
                                    className="mb-1"
                                >
                                    Logistics Path Visualization
                                </CardTitle>
                                <p className="text-slate-400 text-xs font-medium mb-0">
                                    Historical trace of the delivery agent&apos;s movements.
                                </p>
                            </div>
                            <div className="h-[400px] mx-4 mb-4 rounded-2xl overflow-hidden ring-1 ring-slate-100">
                                <LiveTrackingMap
                                    warehouseLoc={warehouseLoc}
                                    customerLoc={customerLoc}
                                    partnerLoc={lastLoc}
                                    historyLocs={historyLocs}
                                    orderStatus={order.orderStatus}
                                    orderId={order.orderId}
                                    partnerName={partner?.name}
                                />
                            </div>
                        </div>

                        <OrderItemsCard
                            order={order}
                            animClass="ohd-fade ohd-fade-3"
                        />
                    </div>

                    <div className="space-y-5">

                        <CustomerCard
                            order={order}
                            animClass="ohd-fade ohd-fade-2"
                        />

                        <DeliveryPartnerCard
                            partner={partner}
                            animClass="ohd-fade ohd-fade-3"
                        />

                        <WarehouseCard
                            warehouse={warehouse}
                            animClass="ohd-fade ohd-fade-4"
                        />

                        <OrderMetaCard
                            order={order}
                            animClass="ohd-fade ohd-fade-4"
                        />

                        <OhdCard className="ohd-fade ohd-fade-5">
                            <SectionLabel>Audit log</SectionLabel>
                            <CardTitle icon={<Clock className="h-4 w-4 text-amber-500" />} className="mb-1">
                                Status Timeline
                            </CardTitle>
                            <p className="text-xs text-slate-400 font-medium mb-5">
                                Record of all system-recorded status transitions.
                            </p>
                            <OrderHistoryTimeline history={order.history || []} />
                        </OhdCard>

                    </div>
                </div>
            </div>
        </>
    )
}

function PageSkeleton() {
    return (
        <div className="space-y-5 p-1 animate-pulse">
            <Skeleton className="h-16 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <Skeleton className="h-[460px] rounded-3xl" />
                    <Skeleton className="h-[280px] rounded-3xl" />
                </div>
                <div className="space-y-5">
                    <Skeleton className="h-[180px] rounded-3xl" />
                    <Skeleton className="h-[200px] rounded-3xl" />
                    <Skeleton className="h-[220px] rounded-3xl" />
                    <Skeleton className="h-[120px] rounded-3xl" />
                    <Skeleton className="h-[260px] rounded-3xl" />
                </div>
            </div>
        </div>
    )
}

function NotFound({ onBack }: { onBack: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6">
                <Search className="h-9 w-9 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Not Found</h2>
            <p className="text-slate-400 font-medium mt-2 max-w-xs text-sm">
                The order snapshot you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
                onClick={onBack}
                className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
            >
                <ChevronLeft className="h-4 w-4" /> Go Back
            </button>
        </div>
    )
}

const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.ohd-root  { font-family: 'DM Sans', system-ui, sans-serif; }
.ohd-display { font-family: 'Syne', system-ui, sans-serif; }

@keyframes ohd-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.ohd-fade   { animation: ohd-in .38s cubic-bezier(.22,1,.36,1) both; }
.ohd-fade-1 { animation-delay: .04s; }
.ohd-fade-2 { animation-delay: .10s; }
.ohd-fade-3 { animation-delay: .16s; }
.ohd-fade-4 { animation-delay: .22s; }
.ohd-fade-5 { animation-delay: .30s; }
`
