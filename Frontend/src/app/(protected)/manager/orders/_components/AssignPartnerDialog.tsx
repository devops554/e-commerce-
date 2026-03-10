"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { UserCheck, Search, Loader2, Bike } from 'lucide-react'
import { useDeliveryPartners } from '@/hooks/useDeliveryPartners'
import { useCreateShipment } from '@/hooks/useShipments'
import { toast } from 'sonner'

interface AssignPartnerDialogProps {
    open: boolean
    onClose: () => void
    orderId: string
    warehouseId: string
}

export function AssignPartnerDialog({ open, onClose, orderId, warehouseId }: AssignPartnerDialogProps) {
    const [search, setSearch] = useState('')
    const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
    const createShipment = useCreateShipment()

    const { data: partnersData, isLoading } = useDeliveryPartners({ warehouseId, limit: 100 })
    const partners = partnersData?.data || []

    const filtered = partners.filter((p: any) =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
    )

    const handleAssign = async () => {
        if (!selectedPartnerId) return
        try {
            await createShipment.mutateAsync({
                orderId,
                warehouseId,
                deliveryPartnerId: selectedPartnerId,
            })
            toast.success('Delivery partner assigned successfully')
            setSelectedPartnerId(null)
            setSearch('')
            onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to assign delivery partner')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-3xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-100">
                    <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-indigo-600" />
                        Assign Delivery Partner
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium text-sm mt-1">
                        Select a delivery partner to dispatch this order.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-medium"
                        />
                    </div>

                    {/* Partner List */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 font-bold text-sm">
                                No delivery partners found for this warehouse
                            </div>
                        ) : (
                            filtered.map((partner: any) => {
                                const isSelected = selectedPartnerId === partner._id
                                const isUnavailable = partner.availabilityStatus === 'BUSY'
                                return (
                                    <button
                                        key={partner._id}
                                        disabled={isUnavailable}
                                        onClick={() => setSelectedPartnerId(partner._id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all border
                                            ${isSelected
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                                                : isUnavailable
                                                    ? 'bg-slate-50 opacity-50 cursor-not-allowed border-transparent'
                                                    : 'bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border-transparent'
                                            }`}
                                    >
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-indigo-100'}`}>
                                            <Bike className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                {partner.name}
                                            </p>
                                            <p className={`text-xs font-medium truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                {partner.phone} · {partner.vehicleType}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${partner.availabilityStatus === 'ONLINE'
                                                ? (isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700')
                                                : partner.availabilityStatus === 'BUSY'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : (isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
                                            }`}>
                                            {partner.availabilityStatus}
                                        </span>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-2xl font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedPartnerId || createShipment.isPending}
                        onClick={handleAssign}
                        className="flex-1 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200"
                    >
                        {createShipment.isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning...</>
                        ) : (
                            <><UserCheck className="h-4 w-4 mr-2" />Assign Partner</>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
