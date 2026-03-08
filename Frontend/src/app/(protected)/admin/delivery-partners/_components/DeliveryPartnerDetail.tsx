"use client"
import React from 'react'
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
    ChevronRight
} from 'lucide-react'
import { useDeliveryPartnerById, useUpdatePartnerStatus } from '@/hooks/useDeliveryPartners'
import { toast } from 'sonner'

interface DeliveryPartnerDetailProps {
    id: string
}

const DeliveryPartnerDetail = ({ id }: DeliveryPartnerDetailProps) => {
    const router = useRouter()
    const { data: partner, isLoading, error } = useDeliveryPartnerById(id)
    const updateStatus = useUpdatePartnerStatus()

    const handleStatusUpdate = (accountStatus: string) => {
        updateStatus.mutate({ id, status: { accountStatus } }, {
            onSuccess: () => toast.success(`Partner status updated to ${accountStatus}`),
            onError: () => toast.error('Failed to update status')
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-14 h-14">
                        <div className="w-14 h-14 rounded-full border-2 border-indigo-100 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
                    </div>
                    <p className="text-slate-400 text-xs tracking-[0.2em] uppercase font-semibold">Loading partner details</p>
                </div>
            </div>
        )
    }

    if (error || !partner) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-5">
                    <div className="w-18 h-18 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto p-5">
                        <ShieldAlert className="h-9 w-9 text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Partner Not Found</h2>
                        <p className="text-slate-400 mt-1.5 text-sm">This delivery partner does not exist or has been removed.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const isActive = partner.accountStatus === 'ACTIVE'

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Accent top stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400" />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shadow-sm transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-xs tracking-widest uppercase">Delivery Partners</span>
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span className="text-indigo-500 text-xs tracking-widest uppercase font-semibold">Profile</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">{partner.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase border ${isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-rose-50 border-rose-200 text-rose-500'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                            {partner.accountStatus}
                        </div>

                        {isActive ? (
                            <button
                                onClick={() => handleStatusUpdate('BLOCKED')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold hover:bg-amber-100 transition-all shadow-sm"
                            >
                                <ShieldAlert className="w-4 h-4" />
                                Block Partner
                            </button>
                        ) : (
                            <button
                                onClick={() => handleStatusUpdate('ACTIVE')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 transition-all shadow-sm"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Activate Partner
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Decorative header */}
                            <div className="h-20 bg-gradient-to-br from-indigo-50 to-violet-50 relative">
                                <div className="absolute inset-0 opacity-30"
                                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #c7d2fe 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                            </div>
                            <div className="px-6 pb-5 -mt-10">
                                <div className="relative w-16 h-16 mb-3">
                                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center">
                                        <User className="w-7 h-7 text-indigo-300" />
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                                </div>
                                <h2 className="text-base font-bold text-slate-800">{partner.name}</h2>
                                <p className="text-slate-400 text-xs font-mono mt-0.5">#{id.slice(-8).toUpperCase()}</p>
                            </div>

                            <div className="px-4 pb-5 border-t border-slate-100 pt-3 space-y-0.5">
                                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={partner.phone} />
                                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={partner.email || 'Not provided'} truncate />
                                <InfoRow
                                    icon={<MapPin className="w-3.5 h-3.5" />}
                                    label="Warehouse"
                                    value={typeof partner.warehouseId === 'object' ? partner.warehouseId?.name : (partner.warehouseId ?? 'Unassigned')}
                                />
                            </div>
                        </div>

                        {/* Vehicle Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <Bike className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Vehicle</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                    <p className="text-slate-800 font-semibold text-sm">{partner.vehicleType}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Reg. No.</p>
                                    <p className="text-slate-800 font-mono font-bold text-sm tracking-wide">
                                        {partner.vehicleNumber || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Documents */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Identity & Verification</span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Aadhaar */}
                                <div className="space-y-3">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Aadhaar Card</p>
                                    <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-200">
                                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 border border-white/5" />
                                        <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-white/5 border border-white/5" />
                                        <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-3 relative">Aadhaar Number</p>
                                        <p className="text-lg font-mono font-bold tracking-[0.12em] relative">
                                            {partner.documents?.aadhaarNumber
                                                ? partner.documents.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()
                                                : '•••• •••• ••••'}
                                        </p>
                                    </div>
                                    {partner.documents?.aadhaarImage && (
                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 hover:text-slate-700 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View Aadhaar Document
                                        </button>
                                    )}
                                </div>

                                {/* PAN */}
                                <div className="space-y-3">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">PAN Card</p>
                                    <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-100">
                                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 border border-white/10" />
                                        <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-white/10 border border-white/10" />
                                        <p className="text-[9px] text-indigo-200/60 uppercase tracking-[0.2em] mb-3 relative">PAN Number</p>
                                        <p className="text-lg font-mono font-bold tracking-[0.12em] uppercase relative">
                                            {partner.documents?.panNumber || '••••••••••'}
                                        </p>
                                    </div>
                                    {partner.documents?.panImage && (
                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 hover:text-slate-700 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            View PAN Document
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Driving License */}
                            {partner.documents?.drivingLicenseImage && (
                                <div className="mx-6 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                            <Bike className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">Driving License</p>
                                            <p className="text-xs text-emerald-500 mt-0.5 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                                Verified & uploaded
                                            </p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap">
                                        View License
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Warehouse */}
                        {partner.warehouseId && typeof partner.warehouseId === 'object' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Assigned Warehouse</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Warehouse</p>
                                            <p className="text-slate-800 font-semibold text-sm">{partner.warehouseId.name}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Hash className="w-3 h-3 text-slate-300" />
                                                <p className="text-xs text-slate-400 font-mono">{partner.warehouseId.code}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Contact</p>
                                            <p className="text-xs text-slate-700 font-medium flex items-center gap-2">
                                                <User className="w-3 h-3 text-slate-300" />
                                                {partner.warehouseId.contact.contactPerson}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-slate-300" />
                                                {partner.warehouseId.contact.phone}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-slate-300" />
                                                {partner.warehouseId.contact.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {partner.warehouseId.address.addressLine1}
                                            {partner.warehouseId.address.addressLine2 && `, ${partner.warehouseId.address.addressLine2}`}
                                            {`, ${partner.warehouseId.address.city}, ${partner.warehouseId.address.state} — ${partner.warehouseId.address.pincode}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const InfoRow = ({ icon, label, value, truncate = false }: { icon: React.ReactNode, label: string, value: string, truncate?: boolean }) => (
    <div className="flex items-center gap-3 group py-2 px-2 rounded-xl hover:bg-slate-50 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-500 transition-all shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-sm text-slate-700 font-medium mt-0.5 ${truncate ? 'truncate' : ''}`}>{value}</p>
        </div>
    </div>
)

export default DeliveryPartnerDetail