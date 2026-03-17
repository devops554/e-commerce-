import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCheck, Truck, Loader2 } from 'lucide-react'
import { ReturnRequest } from '@/services/return.service'
import { AssignPartnerDialog } from '@/app/(protected)/manager/orders/_components/AssignPartnerDialog'

interface DeliveryAssignmentCardProps {
    request: ReturnRequest;
    onAssigned: () => void;
}

export function DeliveryAssignmentCard({ request, onAssigned }: DeliveryAssignmentCardProps) {
    const [showAssignDialog, setShowAssignDialog] = useState(false)

    // Only show if approved but not yet picked up
    const canShow = request.status === 'APPROVED' || request.status === 'PICKUP_SCHEDULED'
    const isAssigned = request.status === 'PICKUP_SCHEDULED' || request.status === 'PICKED_UP'

    if (!canShow) return null

    return (
        <>
            <Card className="border-none shadow-xl shadow-indigo-100/50 rounded-3xl overflow-hidden bg-white ring-1 ring-indigo-50">
                <CardHeader className="p-6 bg-indigo-600 text-white flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Reverse Logistics
                    </CardTitle>
                    {isAssigned && (
                        <Badge className="bg-white/20 text-white border-white/20 font-bold uppercase text-[10px]">
                            Assigned
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {!isAssigned ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium">
                                <p>Return request has been approved. Please assign a delivery partner for doorstep pickup from the customer.</p>
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
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                <p className="text-sm font-bold text-slate-700">{request.status.replace(/_/g, ' ')}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-2xl font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => setShowAssignDialog(true)}
                            >
                                Change Partner
                            </Button>
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
