"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Warehouse, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useWarehouses } from '@/hooks/useWarehouses'
import { useReassignWarehouse } from '@/hooks/useOrders'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface ReassignWarehouseDialogProps {
    orderId: string
    oldWarehouseId: string
    isOpen: boolean
    onClose: () => void
}

export function ReassignWarehouseDialog({ orderId, oldWarehouseId, isOpen, onClose }: ReassignWarehouseDialogProps) {
    const { data: warehouses, isLoading: isWarehousesLoading } = useWarehouses()
    const reassignMutation = useReassignWarehouse()
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const handleReassign = async () => {
        if (!selectedWarehouseId) return

        try {
            await reassignMutation.mutateAsync({
                orderId,
                oldWarehouseId,
                newWarehouseId: selectedWarehouseId
            })
            onClose()
        } catch (error) {
            // Error is handled by the hook's toast
        }
    }

    const filteredWarehouses = warehouses?.filter((w: any) =>
        w._id !== oldWarehouseId &&
        (w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.state?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || []

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                            <Warehouse className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900">Reassign Warehouse</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 font-medium">
                                Select a new warehouse to fulfill this order
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 font-medium leading-relaxed">
                            Reassigning will cancel existing shipments from the old warehouse and reserve stock in the new one.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">
                                Available Warehouses
                            </label>
                            <div className="relative w-48">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search warehouse..."
                                    className="pl-8 h-8 text-xs border-slate-200 bg-white"
                                />
                            </div>
                        </div>

                        {isWarehousesLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                <span className="text-sm font-bold text-slate-400">Loading warehouses...</span>
                            </div>
                        ) : (
                            <ScrollArea className="h-[280px] pr-4 -mr-4">
                                <div className="grid gap-3">
                                    {filteredWarehouses.length > 0 ? (
                                        filteredWarehouses.map((w: any) => (
                                            <div
                                                key={w._id}
                                                onClick={() => setSelectedWarehouseId(w._id)}
                                                className={`
                                                    relative group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300
                                                    ${selectedWarehouseId === w._id
                                                        ? 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-100'
                                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`
                                                            w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                                            ${selectedWarehouseId === w._id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}
                                                        `}>
                                                            <Warehouse className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900 leading-tight">
                                                                {w.name}
                                                                {w.isDefault && (
                                                                    <Badge className="ml-2 bg-indigo-50 text-indigo-600 border-none px-1.5 py-0 text-[10px] uppercase tracking-tighter">Default</Badge>
                                                                )}
                                                            </h4>
                                                            <div className="flex items-center text-slate-400 mt-1 gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wide">{w.city}, {w.state}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {selectedWarehouseId === w._id && (
                                                        <div className="bg-amber-500 text-white rounded-full p-1.5 shadow-lg shadow-amber-200">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <AlertCircle className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-black text-slate-400">No other warehouses available</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedWarehouseId || reassignMutation.isPending}
                        className="rounded-xl px-8 bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xl shadow-amber-200"
                        onClick={handleReassign}
                    >
                        {reassignMutation.isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reassigning...</>
                        ) : (
                            'Confirm Reassignment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
