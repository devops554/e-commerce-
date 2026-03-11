"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Package, Building2, ExternalLink, Bike } from 'lucide-react'
import { DeliveryPartner } from '@/services/delivery-partner.service'

interface PartnerDocumentsTabProps {
    partner: DeliveryPartner
    onOpenViewer: (title: string, url?: string) => void
    onOpenEdit: () => void
}

const PartnerDocumentsTab = ({ partner, onOpenViewer, onOpenEdit }: PartnerDocumentsTabProps) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold group"
                            onClick={() => onOpenViewer(`${partner.name} - Aadhaar Card`, partner.documents?.aadhaarImage)}
                        >
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
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold group"
                            onClick={() => onOpenViewer(`${partner.name} - PAN Card`, partner.documents?.panImage)}
                        >
                            <ExternalLink className="w-4 h-4 mr-2 group-hover:text-purple-500 transition-colors" />
                            Update Registry Entry
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
                        <Button
                            variant="ghost"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 border border-indigo-50 hover:bg-indigo-50"
                            onClick={() => onOpenViewer(`${partner.name} - Driving License`, partner.documents?.drivingLicenseImage)}
                        >
                            Review License
                        </Button>
                    </div>
                )}

                <div className="px-8 pb-8">
                    <Button
                        variant="ghost"
                        className="w-full h-12 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-500 transition-all"
                        onClick={onOpenEdit}
                    >
                        Detailed Registry Management
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default PartnerDocumentsTab
