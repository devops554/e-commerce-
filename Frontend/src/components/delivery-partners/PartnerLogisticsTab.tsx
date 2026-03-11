"use client"

import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    CheckCircle2,
    Navigation,
    Search,
    Package,
    ChevronRight,
    MapPin,
    Building2,
    History
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { StatsCard, ShipmentRow, LoadingList, EmptyState } from './PartnerStats'
import { DeliveryPartner } from '@/services/delivery-partner.service'

interface PartnerLogisticsTabProps {
    partner: DeliveryPartner
    activeShipments: any
    historyShipments: any
    availableShipments: any
    isActiveLoading: boolean
    isHistoryLoading: boolean
    searchQuery: string
    setSearchQuery: (query: string) => void
    handleAssignOrder: (shipmentId: string) => void
}

const PartnerLogisticsTab = ({
    partner,
    activeShipments,
    historyShipments,
    availableShipments,
    isActiveLoading,
    isHistoryLoading,
    searchQuery,
    setSearchQuery,
    handleAssignOrder
}: PartnerLogisticsTabProps) => {
    const filteredAvailable = availableShipments?.data?.filter((s: any) =>
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard icon={<Clock className="text-indigo-500" />} label="In Flight" value={activeShipments?.data?.length || 0} color="indigo" />
                <StatsCard icon={<CheckCircle2 className="text-green-500" />} label="Fulfillment" value={historyShipments?.data?.filter((s: any) => s.status === 'DELIVERED').length || 0} color="green" />
                <StatsCard icon={<Clock className="text-amber-500" />} label="Fleets" value={partner.warehouseIds?.length || 0} color="amber" />
            </div>

            {/* Active & Registry Section */}
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-black text-slate-900">Delivery Lifecycle</CardTitle>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Real-time tracking & history</p>
                        </div>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-slate-200">
                                Assign New Mission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                            <div className="bg-slate-900 p-6 text-white pb-8">
                                <DialogTitle className="text-xl font-black">Available Missions</DialogTitle>
                                <DialogDescription className="text-slate-400 font-bold mt-1 text-xs">Assign a packed order to {partner.name}</DialogDescription>
                                <div className="relative mt-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Scan Tracking or Order ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-white space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar">
                                {filteredAvailable?.length > 0 ? (
                                    filteredAvailable.map((shipment: any) => (
                                        <div key={shipment._id} className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group cursor-pointer" onClick={() => handleAssignOrder(shipment._id)}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                        <Package className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">TXN-{shipment.trackingNumber.slice(-6)}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Order: {shipment.orderId.slice(-8)}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black text-[9px] uppercase tracking-widest">{shipment.status}</Badge>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Assign Mission <ChevronRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Package className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">No Missions Available</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* In-Flight Registry */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Active In-Flight
                            </h4>
                            {isActiveLoading ? <LoadingList /> : activeShipments?.data?.length > 0 ? (
                                activeShipments.data.map((shipment: any) => (
                                    <ShipmentRow key={shipment._id} shipment={shipment} status="active" />
                                ))
                            ) : <EmptyState message="No active missions in flight" />}
                        </div>

                        {/* Historical Logs */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-2">
                                <History className="w-4 h-4 text-slate-400" />
                                Archived Logs
                            </h4>
                            {isHistoryLoading ? <LoadingList /> : historyShipments?.data?.length > 0 ? (
                                historyShipments.data.slice(0, 5).map((shipment: any) => (
                                    <ShipmentRow key={shipment._id} shipment={shipment} status="history" />
                                ))
                            ) : <EmptyState message="Registry archive is empty" />}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Warehouses Registry */}
            {partner.warehouseIds && partner.warehouseIds.length > 0 && (
                <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Fleet Depots ({partner.warehouseIds?.length})</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partner.warehouseIds?.map((wh: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-black text-slate-900 truncate pr-2">{wh.name}</p>
                                    <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">Depot</div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 mt-2">
                                    <MapPin size={12} className="shrink-0" />
                                    <p className="text-[10px] font-medium truncate leading-tight">{wh.address?.city}, {wh.address?.state}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}

export default PartnerLogisticsTab
