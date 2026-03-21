"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

import { useReturnById, useManagerApprove, useManagerReject, useUpdateReturnQc, useInitiateRefund, useManagerResolveFailedPickup } from '@/hooks/useReturns'
import { useShipmentById } from '@/hooks/useShipments'
import { ReturnRequestStatus } from '@/services/return.service'
import { useAuth } from '@/providers/AuthContext'

// Modular Components
import { ReturnItemCard } from './components/ReturnItemCard'
import { ReturnInfoCard } from './components/ReturnInfoCard'
import { CustomerDetailsCard } from './components/CustomerDetailsCard'
import { ActionCards } from './components/ActionCards'
import { DeliveryAssignmentCard } from './components/DeliveryAssignmentCard'
import { ShipmentTrackingCard } from './components/ShipmentTrackingCard'
import { ReturnFailureDetails } from '@/components/returns/ReturnFailureDetails'

// Timeline Item Component
function TimelineItem({ date, title, description, active }: any) {
    return (
        <div className="relative pl-8 space-y-1">
            <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 ${active ? 'bg-blue-600 border-blue-100 shadow-[0_0_0_4px] shadow-blue-50' : 'bg-slate-200 border-white'}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">{date}</p>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{description}</p>
        </div>
    )
}

export default function ReturnDetailView() {
    const { id } = useParams()
    const router = useRouter()
    const returnId = id as string
    const { user } = useAuth()

    const { data: request, isLoading, refetch } = useReturnById(returnId)
    const { data: shipment } = useShipmentById(request?.returnShipmentId as string)

    const { mutateAsync: managerApprove, isPending: isApproving } = useManagerApprove()
    const { mutateAsync: managerReject, isPending: isRejecting } = useManagerReject()
    const { mutateAsync: updateQc, isPending: isUpdatingQc } = useUpdateReturnQc()
    const { mutateAsync: initiateRefund, isPending: isRefunding } = useInitiateRefund()
    const { mutateAsync: managerResolveFailedPickup, isPending: isResolvingFailed } = useManagerResolveFailedPickup()

    const handleReview = async (status: ReturnRequestStatus, reason?: string, adminNote?: string) => {
        try {
            if (status === ReturnRequestStatus.APPROVED) {
                await managerApprove({ id: returnId, data: { adminNote } })
            } else {
                await managerReject({ id: returnId, data: { rejectionReason: reason || 'Rejected by manager', adminNote } })
            }
        } catch (err: any) {
            console.error('Failed to review return', err)
        }
    }

    const handleQcUpdate = async (grade: string, notes: string) => {
        try {
            await updateQc({
                id: returnId,
                data: { warehouseQcGrade: grade as any, warehouseQcNotes: notes }
            })
            toast.success("QC updated successfully")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update QC")
        }
    }

    const handleRefund = async (method: string, amount: number, transactionId?: string) => {
        try {
            await initiateRefund({
                id: returnId,
                data: { refundMethod: method as any, refundAmount: amount, refundTransactionId: transactionId }
            })
            toast.success("Refund processed successfully")
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to process refund")
        }
    }

    if (isLoading || !request) return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Loading Return Details...</div>

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
            {/* Header */}
            <div className="flex items-center gap-4 py-4">
                <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">Return Request</h1>
                    <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest truncate">{request._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <ReturnItemCard request={request} />

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <ReturnInfoCard request={request} />
                        </CardContent>
                    </Card>



                    <DeliveryAssignmentCard request={request} shipment={shipment as any} onAssigned={() => refetch()} />

                    {/* Show failure details if either the request or the associated shipment shows a failed pickup */}
                    {(request.status === ReturnRequestStatus.FAILED_PICKUP || (shipment as any)?.status === 'FAILED_PICKUP') && (
                        <ReturnFailureDetails
                            pickupNotes={(shipment as any)?.pickupNotes || request.pickupNotes}
                            verificationMedia={(shipment as any)?.verificationMedia || request.verificationMedia}
                        />
                    )}

                    <ShipmentTrackingCard request={request} />
                    <ActionCards
                        request={request}
                        role={user?.role}
                        onReview={handleReview}
                        onResolveFailedPickup={async (status, reason, note) => {
                            try {
                                await managerResolveFailedPickup({
                                    id: returnId,
                                    data: { approved: status === ReturnRequestStatus.APPROVED, rejectionReason: reason, adminNote: note }
                                })
                            } catch (err: any) {
                                console.error("Failed to resolve failed pickup", err)
                            }
                        }}
                        onQC={handleQcUpdate}
                        onRefund={handleRefund}
                        isPending={isApproving || isRejecting || isUpdatingQc || isRefunding || isResolvingFailed}
                    />
                </div>

                {/* Right Column: Customer & Timeline */}
                <div className="space-y-6">
                    <CustomerDetailsCard request={request} />

                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                <TimelineItem
                                    date={format(new Date(request.createdAt), 'dd MMM, HH:mm')}
                                    title="Request Submitted"
                                    description="Return request created by customer"
                                    active
                                />
                                {request.approvedAt && (
                                    <TimelineItem
                                        date={format(new Date(request.approvedAt), 'dd MMM, HH:mm')}
                                        title="Approved"
                                        description="Return request approved by manager"
                                        active
                                    />
                                )}
                                {request.rejectedAt && (
                                    <TimelineItem
                                        date={format(new Date(request.rejectedAt), 'dd MMM, HH:mm')}
                                        title="Rejected"
                                        description="Return request was rejected"
                                        active
                                    />
                                )}
                                {request.warehouseReceivedAt && (
                                    <TimelineItem
                                        date={format(new Date(request.warehouseReceivedAt), 'dd MMM, HH:mm')}
                                        title="Received at Warehouse"
                                        description="Item received and inspected"
                                        active
                                    />
                                )}
                                {request.refundInitiatedAt && (
                                    <TimelineItem
                                        date={format(new Date(request.refundInitiatedAt), 'dd MMM, HH:mm')}
                                        title="Refund Initiated"
                                        description="Refund process has started"
                                        active
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}