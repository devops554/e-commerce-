"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Bike,
    MapPin,
    Shield,
    ExternalLink,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    Building2,
    Hash,
    ChevronRight,
    Droplet,
    History,
    CheckCircle2,
    Clock,
    Package,
    Navigation,
    Calendar,
    Info,
    Search
} from 'lucide-react'
import { useDeliveryPartnerById, useUpdatePartnerStatus } from '@/hooks/useDeliveryPartners'
import { useShipments, useAssignShipment } from '@/hooks/useShipments'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { FaWhatsapp } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

interface DeliveryPartnerDetailProps {
    id: string
}

const DeliveryPartnerDetail = ({ id }: DeliveryPartnerDetailProps) => {
    const router = useRouter()
    const { data: partner, isLoading, error } = useDeliveryPartnerById(id)
    const updateStatus = useUpdatePartnerStatus()

    // Fetch Active Shipments
    const { data: activeShipments, isLoading: isActiveLoading } = useShipments({
        deliveryPartnerId: id,
        status: 'ASSIGNED_TO_DELIVERY,PICKED_UP,OUT_FOR_DELIVERY'
    })

    // Fetch Shipment History
    const { data: historyShipments, isLoading: isHistoryLoading } = useShipments({
        deliveryPartnerId: id,
        status: 'DELIVERED,CANCELLED,FAILED'
    })

    const { data: availableShipments } = useShipments({ status: 'PACKED', limit: 50 })
    const assignShipment = useAssignShipment()

    const [searchQuery, setSearchQuery] = useState('')

    const handleStatusUpdate = (accountStatus: string) => {
        updateStatus.mutate({ id, status: { accountStatus } }, {
            onSuccess: () => toast.success(`Partner status updated to ${accountStatus}`),
            onError: () => toast.error('Failed to update status')
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
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-slate-400 text-xs tracking-widest uppercase font-black">Loading profile</p>
                </div>
            </div>
        )
    }

    if (error || !partner) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center rounded-3xl border-rose-100 shadow-xl shadow-rose-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="h-8 w-8 text-rose-500" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Partner Not Found</h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">This delivery partner profile could not be loaded.</p>
                    <Button onClick={() => router.back()} className="mt-6 rounded-xl font-bold px-8">Go Back</Button>
                </Card>
            </div>
        )
    }

    const isActive = partner.accountStatus === 'ACTIVE'
    const filteredAvailable = availableShipments?.data?.filter((s: any) =>
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline" size="icon"
                            className="rounded-xl h-12 w-12 shrink-0 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Partner Network</span>
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Fleet Core</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{partner.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 inline-block ${isActive ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`} />
                            {partner.accountStatus}
                        </Badge>

                        <Button
                            variant={isActive ? "outline" : "default"}
                            className={`rounded-xl font-black text-[11px] uppercase tracking-wider h-11 px-6 shadow-sm ${isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            onClick={() => handleStatusUpdate(isActive ? 'BLOCKED' : 'ACTIVE')}
                        >
                            {isActive ? <><ShieldAlert className="w-4 h-4 mr-2" />Suspend Partner</> : <><ShieldCheck className="w-4 h-4 mr-2" />Fully Activate</>}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Identification & Logistics (Left) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Summary */}
                        <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white group">
                            <div className="h-24 bg-linear-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            </div>
                            <div className="px-6 pb-6 -mt-12 relative flex flex-col items-center">
                                <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-2xl shadow-indigo-100 group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-full h-full rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <User className="w-10 h-10 text-indigo-200" />
                                    </div>
                                </div>
                                <div className="text-center mt-4">
                                    <h2 className="text-lg font-black text-slate-900 leading-tight">{partner.name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest mt-1 uppercase">ID: {id.slice(-8)}</p>
                                </div>

                                <div className="w-full mt-6 grid grid-cols-2 gap-3 pb-2">
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center gap-1">
                                        <Droplet className="w-3.5 h-3.5 text-rose-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Blood</span>
                                        <span className="text-xs font-black text-slate-700">{partner.bloodGroup || '—'}</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center gap-1 text-center">
                                        <Bike className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Fleet</span>
                                        <span className="text-xs font-black text-slate-700 truncate w-full px-1">{partner.vehicleType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 space-y-3 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Phone className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-bold font-mono tracking-tight">{partner.phone}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-green-500 bg-green-50 hover:bg-green-100" onClick={() => window.open(`https://wa.me/${partner.phone}`, '_blank')}>
                                        <FaWhatsapp size={16} />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Mail className="w-4 h-4 text-slate-300" />
                                    <span className="text-xs font-bold truncate max-w-[180px]">{partner.email || 'No email registered'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Addresses */}
                        <Card className="rounded-3xl border-slate-100 shadow-sm p-6 space-y-5 bg-white">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-400" />
                                Location Matrix
                            </h3>
                            <div className="space-y-4">
                                <div className="relative pl-6 border-l-2 border-indigo-100 last:border-0 pb-1">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Permanent Residence</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        {partner.permanentAddress ? `${partner.permanentAddress.addressLine}, ${partner.permanentAddress.city}, ${partner.permanentAddress.state} - ${partner.permanentAddress.pincode}` : 'Location data missing'}
                                    </p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-purple-100 last:border-0 pb-1">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-purple-50" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Zone (Current)</p>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                        {partner.currentAddress ? `${partner.currentAddress.addressLine}, ${partner.currentAddress.city}, ${partner.currentAddress.state} - ${partner.currentAddress.pincode}` : 'Current location not synced'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Operational Dynamics (Right) */}
                    <div className="lg:col-span-8 space-y-6">
                        <Tabs defaultValue="logistics" className="w-full">
                            <TabsList className="bg-white border border-slate-100 p-1.5 rounded-2xl w-fit mb-6 shadow-sm">
                                <TabsTrigger value="logistics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[11px] uppercase tracking-wider transition-all">
                                    Logistics Orbit
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[11px] uppercase tracking-wider transition-all">
                                    Verification Docs
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="logistics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                            </TabsContent>

                            <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white">
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Aadhaar Stack */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Aadhaar Protocol</h4>
                                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-black text-[9px] uppercase tracking-widest px-3">Government ID</Badge>
                                            </div>
                                            <div className="relative rounded-[2.5rem] overflow-hidden p-8 bg-linear-to-br from-slate-900 to-indigo-950 text-white shadow-2xl shadow-indigo-100">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                                                <div className="relative">
                                                    <ShieldCheck className="w-12 h-12 text-indigo-400/30 mb-8" />
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mb-2 opacity-60">Verified Credentials</p>
                                                    <p className="text-2xl font-mono font-black tracking-[0.15em]">
                                                        {partner.documents?.aadhaarNumber ? partner.documents.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• ••••'}
                                                    </p>
                                                    <div className="mt-8 flex items-center justify-between opacity-40">
                                                        <span className="text-[9px] font-black tracking-widest">{partner.name.toUpperCase()}</span>
                                                        <Package size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold group">
                                                <ExternalLink className="w-4 h-4 mr-2 group-hover:text-indigo-500 transition-colors" />
                                                Audit Government Copy
                                            </Button>
                                        </div>

                                        {/* PAN Stack */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Tax Index (PAN)</h4>
                                                <Badge className="bg-purple-50 text-purple-700 border-purple-100 font-black text-[9px] uppercase tracking-widest px-3">Tax Identity</Badge>
                                            </div>
                                            <div className="relative rounded-[2.5rem] overflow-hidden p-8 bg-linear-to-br from-purple-700 to-indigo-800 text-white shadow-2xl shadow-purple-100">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                                <div className="relative">
                                                    <div className="flex justify-between items-start mb-10">
                                                        <Building2 className="w-10 h-10 text-white/20" />
                                                        <Badge className="bg-white/10 text-white border-0 text-[8px] font-black">ACTIVE</Badge>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-200/50 uppercase tracking-[0.3em] font-black mb-2">Registry Number</p>
                                                    <p className="text-2xl font-mono font-black tracking-[0.15em] uppercase">
                                                        {partner.documents?.panNumber || '••••••••••'}
                                                    </p>
                                                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-white/5 rounded-full translate-y-2 translate-x-2" />
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold group">
                                                <ExternalLink className="w-4 h-4 mr-2 group-hover:text-purple-500 transition-colors" />
                                                Audit Registry Copy
                                            </Button>
                                        </div>
                                    </div>

                                    {partner.documents?.drivingLicenseImage && (
                                        <div className="mx-8 mb-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <Bike className="w-7 h-7 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-slate-900 mb-1">Fleet Operations Authorization</h5>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">License Protocol Verified</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 border border-indigo-50 hover:bg-indigo-50">
                                                Review License
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StatsCard = ({ icon, label, value, color }: any) => (
    <Card className="rounded-3xl border-slate-100 shadow-sm p-5 bg-white flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
        </div>
    </Card>
)

const ShipmentRow = ({ shipment, status }: any) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all group">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'active' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400'
            }`}>
            {shipment.status === 'DELIVERED' ? <CheckCircle2 size={18} /> : <Package size={18} />}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start mb-0.5">
                <p className="text-xs font-black text-slate-900 truncate">#{shipment.trackingNumber}</p>
                <Badge variant="outline" className={`text-[8px] font-black uppercase px-2 py-0 border-0 ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    shipment.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                        'bg-indigo-100 text-indigo-700'
                    }`}>
                    {shipment.status.replace(/_/g, ' ')}
                </Badge>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order {shipment.orderId.slice(-6)}</p>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <Calendar size={10} className="text-slate-300" />
                    {format(new Date(shipment.assignedAt), 'MMM dd')}
                </div>
            </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
    </div>
)

const LoadingList = () => (
    <div className="space-y-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
        ))}
    </div>
)

const EmptyState = ({ message }: any) => (
    <div className="py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3">
        <Package className="w-8 h-8 text-slate-200" />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
)

export default DeliveryPartnerDetail
