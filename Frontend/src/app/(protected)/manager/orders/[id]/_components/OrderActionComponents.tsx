import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, XCircle, AlertCircle, Package, BadgeCheck, Truck, Loader2 } from 'lucide-react'
import { ShipmentStatus } from '@/services/shipment.service'

/**
 * Item status → action config extracted from Manager Order Details
 */
export function ItemActionCell({
    item,
    orderStatus,
    onConfirm,
    isPending,
}: {
    item: any
    orderStatus: string
    onConfirm: (variantId: string) => void
    isPending: boolean
}) {
    const s = (item.status ?? '').toLowerCase()
    const os = (orderStatus ?? '').toLowerCase()

    // ── Terminal / read-only badges ──────────────────────────────────────────
    if (['shipped', 'delivered'].includes(s)) {
        return (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black px-4 py-2 rounded-xl gap-1.5 whitespace-nowrap">
                <Check className="h-3.5 w-3.5" />
                {s.toUpperCase()}
            </Badge>
        )
    }
    if (s === 'cancelled') {
        return (
            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-black px-4 py-2 rounded-xl gap-1.5 whitespace-nowrap">
                <XCircle className="h-3.5 w-3.5" />
                CANCELLED
            </Badge>
        )
    }
    if (s === 'pending_reassignment') {
        return (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-black px-4 py-2 rounded-xl gap-1.5 whitespace-nowrap">
                <AlertCircle className="h-3.5 w-3.5" />
                Reassignment Pending
            </Badge>
        )
    }
    if (s === 'packed') {
        return (
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black px-4 py-2 rounded-xl gap-1.5 whitespace-nowrap">
                <Package className="h-3.5 w-3.5" />
                PACKED
            </Badge>
        )
    }
    if (s === 'confirmed') {
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-black px-4 py-2 rounded-xl gap-1.5 whitespace-nowrap">
                <BadgeCheck className="h-3.5 w-3.5" />
                CONFIRMED
            </Badge>
        )
    }

    // ── Order-level block ────────────────────────────────────────────────────
    if (['cancelled', 'delivered'].includes(os)) {
        return (
            <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-bold px-4 py-2 rounded-xl whitespace-nowrap">
                No Action
            </Badge>
        )
    }

    // ── Active: pending / processing / anything else → Confirm button ────────
    return (
        <Button
            className="bg-slate-900 hover:bg-black text-white font-black px-5 rounded-xl h-10 shadow-md shadow-slate-200 gap-2 transition-all active:scale-95 whitespace-nowrap"
            onClick={() => onConfirm(item.variant._id)}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Check className="h-4 w-4" />
            )}
            Confirm Item
        </Button>
    )
}

/**
 * Next-step CTA shown in the header
 */
export function getNextStepConfig(shipmentStatus?: string) {
    switch (shipmentStatus) {
        case ShipmentStatus.ORDER_PLACED:
            return { label: 'Mark as Packed', icon: <Package className="w-4 h-4" />, color: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' }
        case ShipmentStatus.PACKED:
        case ShipmentStatus.ASSIGNED_TO_DELIVERY:
        case ShipmentStatus.ACCEPTED:
            return { label: 'Handover to Partner', icon: <Truck className="w-4 h-4" />, color: 'bg-violet-600 hover:bg-violet-700 shadow-violet-200' }
        case ShipmentStatus.PICKED_UP:
            return { label: 'Start Delivery', icon: <Truck className="w-4 h-4" />, color: 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' }
        case ShipmentStatus.OUT_FOR_DELIVERY:
            return { label: 'Complete Delivery', icon: <Check className="w-4 h-4" />, color: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' }
        default:
            return null
    }
}
