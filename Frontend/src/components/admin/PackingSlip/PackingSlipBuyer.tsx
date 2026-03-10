"use client"

import React from 'react'

interface PackingSlipBuyerProps {
    buyer: {
        fullName: string
        phone: string
        address: string
    }
}

export const PackingSlipBuyer = ({ buyer }: PackingSlipBuyerProps) => {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 space-y-1 mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping To</p>
            <p className="font-black text-slate-900 text-base">{buyer?.fullName}</p>
            <p className="text-slate-600 font-bold text-sm">{buyer?.phone}</p>
            <p className="text-slate-500 text-xs leading-relaxed max-w-[400px]">{buyer?.address}</p>
        </div>
    )
}
