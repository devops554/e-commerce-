"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useDeliveryPartnerById, useUpdatePartnerStatus } from '@/hooks/useDeliveryPartners'
import { useShipments, useAssignShipment } from '@/hooks/useShipments'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

// Sub-components
import DocumentViewer from './DocumentViewer'
import PartnerHeader from './PartnerHeader'
import PartnerInfoSidebar from './PartnerInfoSidebar'
import PartnerLogisticsTab from './PartnerLogisticsTab'
import PartnerDocumentsTab from './PartnerDocumentsTab'
import { BlockPartnerDialog, EditDocumentsDialog } from './PartnerDialogs'

interface DeliveryPartnerDetailProps {
    id: string
}

const DeliveryPartnerDetail = ({ id }: DeliveryPartnerDetailProps) => {
    const router = useRouter()
    const { data: partner, isLoading, error } = useDeliveryPartnerById(id)
    const updateStatus = useUpdatePartnerStatus()

    const { data: activeShipments, isLoading: isActiveLoading } = useShipments({
        deliveryPartnerId: id,
        status: 'ASSIGNED_TO_DELIVERY,ACCEPTED,PICKED_UP,OUT_FOR_DELIVERY'
    })

    const { data: historyShipments, isLoading: isHistoryLoading } = useShipments({
        deliveryPartnerId: id,
        status: 'DELIVERED,CANCELLED,FAILED'
    })

    const { data: availableShipments } = useShipments({ status: 'PACKED', limit: 50 })
    const assignShipment = useAssignShipment()

    const [searchQuery, setSearchQuery] = useState('')
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
    const [blockReason, setBlockReason] = useState('')
    const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
    const [docData, setDocData] = useState({
        aadhaarNumber: '',
        aadhaarImage: '',
        panNumber: '',
        panImage: '',
        drivingLicenseImage: ''
    })
    const [viewerConfig, setViewerConfig] = useState<{ isOpen: boolean; title: string; url?: string }>({
        isOpen: false,
        title: '',
        url: ''
    })

    const handleStatusUpdate = (accountStatus: string, reason?: string) => {
        updateStatus.mutate({ id, status: { accountStatus, blockReason: reason } }, {
            onSuccess: () => {
                toast.success(`Partner status updated to ${accountStatus}`)
                setIsBlockDialogOpen(false)
                setBlockReason('')
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status')
        })
    }

    const openDocEdit = () => {
        if (!partner) return
        setDocData({
            aadhaarNumber: partner.documents?.aadhaarNumber || '',
            aadhaarImage: partner.documents?.aadhaarImage || '',
            panNumber: partner.documents?.panNumber || '',
            panImage: partner.documents?.panImage || '',
            drivingLicenseImage: partner.documents?.drivingLicenseImage || ''
        })
        setIsDocDialogOpen(true)
    }

    const handleDocUpdate = () => {
        updateStatus.mutate({ id, status: { documents: docData } as any }, {
            onSuccess: () => {
                toast.success('Documents updated successfully')
                setIsDocDialogOpen(false)
            },
            onError: () => toast.error('Failed to update documents')
        })
    }

    const handleAssignOrder = (shipmentId: string) => {
        assignShipment.mutate({ id: shipmentId, data: { deliveryPartnerId: id } }, {
            onSuccess: () => toast.success('Order assigned successfully'),
            onError: () => toast.error('Failed to assign order')
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (error || !partner) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center rounded-3xl border-rose-100 shadow-xl shadow-rose-50/50">
                    <ShieldAlert className="h-8 w-8 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-slate-800">Partner Not Found</h2>
                    <Button onClick={() => router.back()} className="mt-6">Go Back</Button>
                </Card>
            </div>
        )
    }

    const isActive = partner.accountStatus === 'ACTIVE'

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <PartnerHeader
                    partner={partner}
                    onBack={() => router.back()}
                    onOpenBlockDialog={() => setIsBlockDialogOpen(true)}
                    onUpdateStatus={(status) => handleStatusUpdate(status)}
                />

                {!isActive && partner.blockReason && (
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                            <div>
                                <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest leading-none mb-1.5">Suspension Reason</h4>
                                <p className="text-sm font-medium text-rose-700 leading-relaxed">{partner.blockReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <PartnerInfoSidebar partner={partner} partnerId={id} />

                    <div className="lg:col-span-8 space-y-6">
                        <Tabs defaultValue="logistics" className="w-full">
                            <TabsList className="bg-white border border-slate-100 p-1.5 rounded-2xl w-fit mb-6 shadow-sm">
                                <TabsTrigger value="logistics" className="rounded-xl px-6 py-2.5 font-black text-[11px] uppercase tracking-wider transition-all">
                                    Logistics Orbit
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-xl px-6 py-2.5 font-black text-[11px] uppercase tracking-wider transition-all">
                                    Verification Docs
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="logistics">
                                <PartnerLogisticsTab
                                    partner={partner}
                                    activeShipments={activeShipments}
                                    historyShipments={historyShipments}
                                    availableShipments={availableShipments}
                                    isActiveLoading={isActiveLoading}
                                    isHistoryLoading={isHistoryLoading}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    handleAssignOrder={handleAssignOrder}
                                />
                            </TabsContent>

                            <TabsContent value="documents">
                                <PartnerDocumentsTab
                                    partner={partner}
                                    onOpenViewer={(title, url) => setViewerConfig({ isOpen: true, title, url })}
                                    onOpenEdit={openDocEdit}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <BlockPartnerDialog
                isOpen={isBlockDialogOpen}
                onOpenChange={setIsBlockDialogOpen}
                partnerName={partner.name}
                blockReason={blockReason}
                setBlockReason={setBlockReason}
                onConfirm={() => handleStatusUpdate('BLOCKED', blockReason)}
                isPending={updateStatus.isPending}
            />

            <EditDocumentsDialog
                isOpen={isDocDialogOpen}
                onOpenChange={setIsDocDialogOpen}
                partnerName={partner.name}
                docData={docData}
                setDocData={setDocData}
                onConfirm={handleDocUpdate}
                isPending={updateStatus.isPending}
            />

            <DocumentViewer
                isOpen={viewerConfig.isOpen}
                onOpenChange={(open) => setViewerConfig(prev => ({ ...prev, isOpen: open }))}
                title={viewerConfig.title}
                url={viewerConfig.url}
            />
        </div>
    )
}

export default DeliveryPartnerDetail
