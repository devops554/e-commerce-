import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Truck, User, Phone, RefreshCw } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'
import { Shipment } from '@/services/shipment.service'
import { AssignPartnerDialog } from '@/app/(protected)/manager/orders/_components/AssignPartnerDialog'

interface DeliveryAssignmentCardProps {
    request: ReturnRequest;
    shipment?: Shipment | null;
    onAssigned: () => void | Promise<any>;
}

// Derive acceptance status from shipment status (source of truth)
function getPartnerAcceptanceStatus(shipment?: Shipment | null): 'PENDING' | 'ACCEPTED' | 'REJECTED' {
    if (!shipment) return 'PENDING'
    const s = shipment.status
    // Once partner picks up or beyond, they've accepted
    if (['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_PICKUP'].includes(s)) return 'ACCEPTED'
    if (s === 'CANCELLED') return 'REJECTED'
    // ASSIGNED means awaiting partner acceptance
    return 'PENDING'
}

function getShipmentStatusLabel(status: string): string {
    return status.replace(/_/g, ' ')
}

function getShipmentStatusStyle(status: string): string {
    switch (status) {
        case 'ACCEPTED':
        case 'PICKED_UP':
        case 'OUT_FOR_DELIVERY':
        case 'DELIVERED':
            return 'text-emerald-700 border-emerald-200 bg-emerald-50'
        case 'FAILED_DELIVERY':
        case 'FAILED_PICKUP':
        case 'CANCELLED':
            return 'text-rose-700 border-rose-200 bg-rose-50'
        case 'ASSIGNED_TO_DELIVERY':
        case 'ASSIGNED':
            return 'text-blue-700 border-blue-200 bg-blue-50'
        default:
            return 'text-amber-700 border-amber-200 bg-amber-50'
    }
}

export function DeliveryAssignmentCard({ request, shipment, onAssigned }: DeliveryAssignmentCardProps) {
    const [showAssignDialog, setShowAssignDialog] = useState(false)


    const isAssigned = !!(request.assignedPartnerId)
    // Show if approved (to assign) or if already assigned (to track/history)
    const canShow = !['PENDING'].includes(request.status) || isAssigned

    if (!canShow) return null

    const partner = request.assignedPartnerId
    const acceptanceStatus = getPartnerAcceptanceStatus(shipment)

    const acceptanceBadgeStyle = {
        ACCEPTED: 'text-emerald-700 border-emerald-200 bg-emerald-50',
        REJECTED: 'text-rose-700 border-rose-200 bg-rose-50',
        PENDING: 'text-amber-700 border-amber-200 bg-amber-50',
    }[acceptanceStatus]

    const acceptanceLabel = {
        ACCEPTED: '✓ Partner Accepted',
        REJECTED: '✕ Partner Rejected',
        PENDING: '⏳ Awaiting Acceptance',
    }[acceptanceStatus]

    return (
        <>
            <Card className="border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-indigo-50">
                <CardHeader className="px-6 py-5 bg-linear-to-r from-indigo-600 to-violet-600 text-white flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Reverse Logistics
                    </CardTitle>
                    {isAssigned && (
                        <Badge className="bg-white/20 text-white border-white/30 font-bold uppercase text-[10px] tracking-wider px-3 py-1">
                            Assigned
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                    {!isAssigned ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
                                Return request has been approved. Assign a delivery partner for doorstep pickup.
                            </div>
                            <Button
                                className="w-full h-12 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                                onClick={() => setShowAssignDialog(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Assign Pickup Partner
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Status Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Return Status</p>
                                    <p className="text-sm font-bold text-slate-800">{request.status.replace(/_/g, ' ')}</p>
                                </div>
                                {shipment && (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shipment Status</p>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] uppercase font-bold border ${getShipmentStatusStyle(shipment.status)}`}
                                        >
                                            {getShipmentStatusLabel(shipment.status)}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Partner Info */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Partner</p>

                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                {partner?.name || 'Unknown Partner'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <p className="text-sm text-slate-500 font-medium">
                                                {partner?.phone || 'No phone'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {request.partnerRejectionReason && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <p className="text-xs text-rose-500 font-bold">
                                            Rejection Reason:{' '}
                                            <span className="font-medium text-rose-600/80">{request.partnerRejectionReason}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ✅ Fixed: was using || which is always true; now correctly hides button for terminal statuses */}
                            {!["PICKED_UP", "DELIVERED", "RETURNED", "RECEIVED_AT_WAREHOUSE", "QC_FAILED", "QC_PASSED", "REFUND_INITIATED", "REFUND_COMPLETED", "CLOSED"].includes(request.status) && (
                                <Button
                                    variant="outline"
                                    className="w-full h-11 rounded-2xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-sm"
                                    onClick={() => setShowAssignDialog(true)}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Change Partner
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AssignPartnerDialog
                open={showAssignDialog}
                onClose={() => {
                    setShowAssignDialog(false)
                    onAssigned()
                }}
                orderId={request.orderId?._id ?? ''}
                warehouseId={request.warehouseId?._id ?? ''}
                type="REVERSE"
            />
        </>
    )
}