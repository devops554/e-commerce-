"use client"

import React from 'react'
import { ArrowLeft, ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeliveryPartner } from '@/services/delivery-partner.service'

interface PartnerHeaderProps {
    partner: DeliveryPartner
    onBack: () => void
    onOpenBlockDialog: () => void
    onUpdateStatus: (status: string) => void
}

const PartnerHeader = ({ partner, onBack, onOpenBlockDialog, onUpdateStatus }: PartnerHeaderProps) => {
    const isActive = partner.accountStatus === 'ACTIVE'

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline" size="icon"
                    className="rounded-xl h-12 w-12 shrink-0 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all"
                    onClick={onBack}
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
                    onClick={() => isActive ? onOpenBlockDialog() : onUpdateStatus('ACTIVE')}
                >
                    {isActive ? <><ShieldAlert className="w-4 h-4 mr-2" />Suspend Partner</> : <><ShieldCheck className="w-4 h-4 mr-2" />Fully Activate</>}
                </Button>
            </div>
        </div>
    )
}

export default PartnerHeader
