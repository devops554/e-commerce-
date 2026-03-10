"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners'
import { useAssignShipment } from '@/hooks/useShipments'
import { toast } from 'sonner'
import { Loader2, Search, User, Phone, Bike, ChevronRight, Package } from 'lucide-react'

interface AssignPartnerDialogProps {
    isOpen: boolean
    onClose: () => void
    shipmentId: string
    warehouseId: string
    trackingNumber?: string
}

export const AssignPartnerDialog = ({
    isOpen,
    onClose,
    shipmentId,
    warehouseId,
    trackingNumber
}: AssignPartnerDialogProps) => {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: partnersData, isLoading: isPartnersLoading } = useDeliveryPartners({
        warehouseId,
        limit: 100
    })

    const assignMutation = useAssignShipment()

    const handleAssign = (partnerId: string, partnerName: string) => {
        assignMutation.mutate({
            id: shipmentId,
            data: { deliveryPartnerId: partnerId }
        }, {
            onSuccess: () => {
                toast.success(`Shipment assigned to ${partnerName}`)
                onClose()
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to assign partner')
            }
        })
    }

    const filteredPartners = partnersData?.data?.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white">
                <div className="bg-slate-900 p-6 text-white pb-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white">Assign Delivery Partner</DialogTitle>
                        <DialogDescription className="text-slate-400 font-bold mt-1 text-xs">
                            Find an available partner for shipment <span className="text-indigo-400 font-mono">#{trackingNumber || shipmentId.slice(-8)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4">
                    {isPartnersLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching Fleet...</p>
                        </div>
                    ) : filteredPartners && filteredPartners.length > 0 ? (
                        <ScrollArea className="h-[350px] pr-4">
                            <div className="space-y-3">
                                {filteredPartners.map((partner) => (
                                    <div
                                        key={partner._id}
                                        className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group flex items-center justify-between cursor-pointer"
                                        onClick={() => handleAssign(partner._id, partner.name)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                <User className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{partner.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge className={`text-[8px] font-black uppercase px-2 py-0 border-0 ${partner.availabilityStatus === 'ONLINE' ? 'bg-green-100 text-green-700' :
                                                            partner.availabilityStatus === 'BUSY' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {partner.availabilityStatus}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                        <Bike size={10} />
                                                        {partner.vehicleType}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-[10px] font-black text-slate-400 font-mono italic">{partner.phone}</p>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                <Package className="w-8 h-8 text-slate-200" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">No Partners Found</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">Try a different search term or check warehouse settings.</p>
                            </div>
                        </div>
                    )}
                </div>

                {assignMutation.isPending && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50 rounded-3xl">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Assigning Mission...</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
