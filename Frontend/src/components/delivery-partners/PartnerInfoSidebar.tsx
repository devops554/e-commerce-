"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, Droplet, Bike, MapPin, ChevronRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { DeliveryPartner } from '@/services/delivery-partner.service'

interface PartnerInfoSidebarProps {
    partner: DeliveryPartner
    partnerId: string
}

const PartnerInfoSidebar = ({ partner, partnerId }: PartnerInfoSidebarProps) => {
    return (
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
                        <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest mt-1 uppercase">ID: {partnerId.slice(-8)}</p>
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
    )
}

export default PartnerInfoSidebar
