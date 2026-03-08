"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText,
    ExternalLink,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useSellerBySlug, useUpdateSellerStatus } from '@/hooks/useSellers'

export default function AdminSellerDetailPage() {
    const { slug } = useParams()
    const router = useRouter()
    const { data: seller, isLoading } = useSellerBySlug(slug as string)
    const updateStatus = useUpdateSellerStatus()

    const handleStatusUpdate = (status: string) => {
        if (!seller) return
        updateStatus.mutate({ id: seller._id, status })
    }

    if (isLoading) return (
        <div className="flex h-[400px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
        </div>
    )

    if (!seller) return (
        <div className="text-center py-20 space-y-3">
            <p className="text-gray-500 font-bold">Seller not found</p>
            <Button variant="link" onClick={() => router.back()}>Go back</Button>
        </div>
    )

    const currentStatus = seller.status

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl h-10 w-10 bg-white shadow-sm border border-slate-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{seller.storeName}</h1>
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none
                                ${currentStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                    currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {currentStatus}
                            </Badge>
                        </div>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            Registered {seller.createdAt ? format(new Date(seller.createdAt), 'PPP') : '—'}
                        </p>
                    </div>
                </div>

                {currentStatus === 'pending' && (
                    <div className="flex gap-3">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6 h-11"
                            onClick={() => handleStatusUpdate('approved')}
                            disabled={updateStatus.isPending}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </Button>
                        <Button
                            variant="destructive"
                            className="font-bold rounded-xl px-6 h-11"
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={updateStatus.isPending}
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Core details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-base font-black flex items-center gap-2">
                                <Store className="h-5 w-5 text-blue-600" /> Store Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem label="Store Name" value={seller.storeName} bold />
                            <InfoItem label="Business Type" value={seller.businessType} />
                            <InfoItem label="Monthly Sales" value={seller.monthlySales || 'N/A'} />
                            <InfoItem label="Store Description" value={seller.storeDescription || '—'} />
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Categories</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {seller.productCategories?.map((c: string) => (
                                        <Badge key={c} variant="secondary" className="rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-600 border-none">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-base font-black flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-rose-500" /> Pickup Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <p className="font-bold text-gray-900">{seller.pickupAddress?.addressLine}</p>
                            <p className="text-gray-400 font-medium text-sm mt-1">
                                {seller.pickupAddress?.city}, {seller.pickupAddress?.state} — {seller.pickupAddress?.pincode}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-base font-black flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-emerald-500" /> Bank Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem label="Account Holder" value={seller.bankDetails?.accountHolderName} />
                            <InfoItem label="Bank Name" value={seller.bankDetails?.bankName} />
                            <InfoItem label="Account Number" value={seller.bankDetails?.accountNumber} />
                            <InfoItem label="IFSC Code" value={seller.bankDetails?.ifscCode} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Owner + Documents */}
                <div className="space-y-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-base font-black flex items-center gap-2">
                                <User className="h-5 w-5 text-purple-500" /> Owner Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center font-black text-purple-600 text-xl shrink-0">
                                    {seller.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">{seller.name}</p>
                                    <p className="text-xs font-medium text-gray-400">Store Owner</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-gray-300" />
                                    <span className="text-sm font-bold text-gray-700">{seller.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-300" />
                                    <span className="text-sm font-bold text-gray-700">{seller.phone}</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Business IDs</p>
                                {[
                                    { label: 'PAN', value: seller.panNumber },
                                    { label: 'GST', value: seller.gstNumber },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between bg-slate-50 rounded-xl p-3">
                                        <span className="text-xs font-black text-gray-400 uppercase">{label}</span>
                                        <span className="text-xs font-black text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="border-b border-white/5 px-8 py-6">
                            <CardTitle className="text-base font-black flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" /> Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-3">
                            {(['aadhar', 'pan', 'passbook', 'digitalSignature'] as const).map((doc) => (
                                <div key={doc} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-xs font-bold text-white/60 capitalize">
                                        {doc.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                    {seller.documentPaths?.[doc] ? (
                                        <a href={seller.documentPaths[doc]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">Missing</span>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ label, value, bold = false }: { label: string; value?: string; bold?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm text-gray-900 ${bold ? 'font-black' : 'font-medium'}`}>{value || '—'}</p>
        </div>
    )
}
