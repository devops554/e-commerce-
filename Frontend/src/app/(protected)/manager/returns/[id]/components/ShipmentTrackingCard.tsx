import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Truck, ChevronRight } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'
import dynamic from 'next/dynamic'

// Dynamically import LiveTrackingMap to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(() => import('@/components/manager/LiveTrackingMap'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold">Loading Map...</div>
})

interface ShipmentTrackingCardProps {
    request: ReturnRequest;
}

export function ShipmentTrackingCard({ request }: ShipmentTrackingCardProps) {
    // Only show if shipment exists or status is relevant for tracking
    const showTracking = ['PICKUP_SCHEDULED', 'PICKED_UP', 'RECEIVED_AT_WAREHOUSE'].includes(request.status)

    if (!showTracking) return null

    // Mock/Derived coordinates for now since ReturnRequest might not have real-time partner loc yet
    // In a real scenario, we'd fetch the Shipment object by returnShipmentId
    const warehouseLoc = request.warehouseId?.location || { latitude: 28.6139, longitude: 77.2090 } // Default for now
    const customerLoc = { latitude: 28.5355, longitude: 77.3910 } // Need customer address loc

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-indigo-600" />
                    Pickup Tracking
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-80 w-full relative">
                    <LiveTrackingMap
                        warehouseLoc={warehouseLoc}
                        customerLoc={customerLoc}
                        orderStatus={request.status.toLowerCase()}
                        orderId={request.returnId}
                    />
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Current Status</span>
                        <span className="text-indigo-600">{request.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="space-y-3">
                        {request.pickedAt && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Picked Up</p>
                                    <p className="text-[10px] text-slate-500">{new Date(request.pickedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3 items-center opacity-50">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-2 border-dashed border-slate-300">
                                <Truck className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-400">In Transit to Warehouse</p>
                                <p className="text-[10px] text-slate-400">Estimated Arrival: Pending</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
